"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api-client";
import { ShoppingList } from "@/lib/types";
import ShoppingListCard from "@/components/ShoppingListCard";

type Filter = "all" | "active" | "archived";

function mapServerListToUi(l: any): ShoppingList {
  return {
    id: l.id,
    name: l.name,
    ownerId: l.ownerId,
    memberIds: l.members ?? l.memberIds ?? [],
    status: l.isArchived ? "archived" : "active",
    items: [],
  };
}

export default function HomeOverview() {
  const [lists, setLists] = useState<ShoppingList[]>([]);

  // load states (pending / error / ready)
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>("");

  // action states (create/archive/unarchive/delete refresh)
  const [actionError, setActionError] = useState<string>("");
  const [busyListId, setBusyListId] = useState<string | null>(null);

  // create modal
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const [createError, setCreateError] = useState<string>("");
  const [creating, setCreating] = useState<boolean>(false);

  const [filter, setFilter] = useState<Filter>("all");

  const loadLists = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res: any = await api.shoppingList.list({
        ownedOnly: false,
        includeArchived: true,
        pageIndex: 0,
        pageSize: 100,
      });

      const itemList = (res?.itemList ?? []).map(mapServerListToUi);
      setLists(itemList);
    } catch (e: any) {
      setLists([]);
      setLoadError(e?.message ?? "Failed to load shopping lists.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const res: any = await api.shoppingList.list({
          ownedOnly: false,
          includeArchived: true,
          pageIndex: 0,
          pageSize: 100,
        });
        if (cancelled) return;
        setLists((res?.itemList ?? []).map(mapServerListToUi));
      } catch (e: any) {
        if (cancelled) return;
        setLists([]);
        setLoadError(e?.message ?? "Failed to load shopping lists.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleLists = useMemo(
    () => (filter === "all" ? lists : lists.filter((l) => l.status === filter)),
    [lists, filter]
  );

  function openCreate() {
    setIsCreateOpen(true);
    setCreateError("");
    setNewName("");
  }

  function closeCreate() {
    if (creating) return;
    setIsCreateOpen(false);
    setCreateError("");
  }

  async function handleCreate() {
    const name = newName.trim();
    if (!name) {
      setCreateError("Name is required.");
      return;
    }

    setCreating(true);
    setCreateError("");
    setActionError("");

    try {
      await api.shoppingList.create({ name, members: [] });
      setIsCreateOpen(false);
      setNewName("");
      await loadLists();
    } catch (e: any) {
      setCreateError(e?.message ?? "Create failed.");
    } finally {
      setCreating(false);
    }
  }

  async function handleArchive(id: string) {
    setActionError("");
    setBusyListId(id);
    try {
      await api.shoppingList.updateStatus({ id, isArchived: true });
      await loadLists();
    } catch (e: any) {
      setActionError(e?.message ?? "Archive failed.");
    } finally {
      setBusyListId(null);
    }
  }

  async function handleUnarchive(id: string) {
    setActionError("");
    setBusyListId(id);
    try {
      await api.shoppingList.updateStatus({ id, isArchived: false });
      await loadLists();
    } catch (e: any) {
      setActionError(e?.message ?? "Unarchive failed.");
    } finally {
      setBusyListId(null);
    }
  }

  async function handleDeletedRefresh() {
    setActionError("");
    try {
      await loadLists();
    } catch (e: any) {
      setActionError(e?.message ?? "Refresh failed.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold">Shopping lists</h1>
            <p className="text-sm text-gray-600">
              Overview of all shopping lists. Click a tile to open its detail.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              className="border rounded-xl px-3 py-1.5 bg-white text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              disabled={loading}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>

            <button
              onClick={openCreate}
              className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-900 disabled:opacity-60"
              disabled={loading}
            >
              + New list
            </button>
          </div>
        </div>

        {actionError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
            <p className="text-sm text-red-700">{actionError}</p>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-600">Loading…</p>
        ) : loadError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2">
            <p className="text-sm text-red-700">{loadError}</p>
          </div>
        ) : visibleLists.length === 0 ? (
          <p className="text-sm text-gray-600">
            No shopping lists for this filter. Use &quot;+ New list&quot; to create one.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleLists.map((list) => (
              <ShoppingListCard
                key={list.id}
                list={list}
                onArchive={handleArchive}
                onUnarchive={handleUnarchive}
                onDeleted={handleDeletedRefresh}
                // pokud máš ve ShoppingListCard tlačítka, můžeš to tam použít pro disable:
                // @ts-ignore (jen pokud komponenta busy prop nemá)
                busy={busyListId === list.id}
              />
            ))}
          </div>
        )}
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">New shopping list</h2>

            <label className="block text-sm font-medium mb-1" htmlFor="new-list-name">
              Name
            </label>
            <input
              id="new-list-name"
              autoFocus
              className="w-full border rounded-lg px-3 py-2 mb-2"
              value={newName}
              disabled={creating}
              onChange={(e) => {
                setNewName(e.target.value);
                setCreateError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />

            {createError && <p className="text-xs text-red-600 mb-2">{createError}</p>}

            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={closeCreate}
                className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-60"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-3 py-1.5 rounded-lg border bg-black text-white disabled:opacity-60"
                disabled={creating}
              >
                {creating ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
