"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api-client";
import { CURRENT_USER_ID, USERS } from "@/lib/data";
import { ShoppingList, ShoppingListItem } from "@/lib/types";
import { getRole } from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";
import RoleBadge from "@/components/RoleBadge";
import ItemAddForm from "@/components/ItemAddForm";
import ItemsTable from "@/components/ItemsTable";
import MembersTable from "@/components/MembersTable";

function Section({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border mb-6">
      <div className="border-b px-5 py-3 flex items-center justify-between">
        <div className="font-semibold">{title}</div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function mapServerItemToUi(i: any): ShoppingListItem {
  const status = i.status ?? i.state;
  const done = status === "done" || status === "completed";
  return {
    id: i.id,
    name: i.name,
    quantity: i.quantity,
    state: done ? "done" : "open",
  };
}

function mapServerListToUi(l: any): ShoppingList {
  const itemsRaw = l.items ?? l.itemList ?? [];
  return {
    id: l.id,
    name: l.name,
    ownerId: l.ownerId,
    memberIds: l.members ?? l.memberIds ?? [],
    status: l.isArchived ? "archived" : "active",
    items: itemsRaw.map(mapServerItemToUi),
  };
}

export default function Page() {
  const { listId } = useParams<{ listId: string }>();

  const [list, setList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  async function load() {
    setLoading(true);
    setLoadError("");
    try {
      const res: any = await api.shoppingList.get({ id: listId });
      setList(mapServerListToUi(res));
    } catch (e: any) {
      setLoadError(e?.message ?? "Load failed.");
      setList(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [listId]);

  const role = list ? getRole(list, CURRENT_USER_ID) : "viewer";
  const isOwner = role === "owner";
  const isMember = role === "member";
  const archived = list?.status === "archived";

  const canEditItems = !!list && (isOwner || isMember) && !archived;

  // --- EDIT NAME (server) ---
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState("");

  function startEditName() {
    if (!list || !isOwner || archived) return;
    setEditName(list.name);
    setNameError("");
    setEditingName(true);
  }

  function cancelEditName() {
    setEditingName(false);
    setNameError("");
  }

  async function saveName() {
    if (!list || !isOwner || archived || savingName) return;
    const next = editName.trim();
    if (!next) {
      setNameError("Name is required.");
      return;
    }

    setSavingName(true);
    setNameError("");
    try {
      await api.shoppingList.updateName({ id: list.id, name: next });
      setEditingName(false);
      await load();
    } catch (e: any) {
      setNameError(e?.message ?? "Update name failed.");
    } finally {
      setSavingName(false);
    }
  }

  // --- ARCHIVE / UNARCHIVE (server) ---
  const [savingStatus, setSavingStatus] = useState(false);

  async function setArchived(nextArchived: boolean) {
    if (!list || !isOwner || savingStatus) return;
    setSavingStatus(true);
    try {
      await api.shoppingList.updateStatus({ id: list.id, isArchived: nextArchived });
      await load();
    } finally {
      setSavingStatus(false);
    }
  }

  // --- EDIT ITEM MODAL ---
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemQty, setEditItemQty] = useState(1);

  function startEditItem(id: string) {
    if (!canEditItems || !list) return;
    const cur = list.items.find((x) => x.id === id);
    if (!cur) return;
    setEditingItem(cur);
    setEditItemName(cur.name ?? "");
    setEditItemQty(cur.quantity ?? 1);
  }

  function cancelEditItem() {
    setEditingItem(null);
  }

  async function saveEditItem() {
    if (!canEditItems || !editingItem) return;

    const nextName = editItemName.trim() || editingItem.name;
    const nextQty = editItemQty > 0 ? editItemQty : editingItem.quantity;

    await api.item.update({
      id: editingItem.id,
      name: nextName,
      quantity: nextQty,
    });

    setEditingItem(null);
    await load();
  }

  // --- SELECTION ---
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
    if (!canEditItems) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  // --- TOGGLE COMPLETE/UNDO based on selection ---
  const selectedItems = useMemo(() => {
    if (!list) return [];
    return list.items.filter((i) => selected.has(i.id));
  }, [list, selected]);

  const hasAnyOpenSelected = selectedItems.some((i) => i.state === "open");
  const resolveLabel = hasAnyOpenSelected ? "Mark as completed" : "Mark as undone";

  async function bulkResolve(ids: string[]) {
    if (!canEditItems || !list) return;

    const selectedNow = list.items.filter((i) => ids.includes(i.id));
    const hasAnyOpen = selectedNow.some((i) => i.state === "open");

    // pokud je aspoň jedna open -> dokončíme všechny
    // pokud jsou všechny done -> vrátíme všechny na open
    const nextCompleted = hasAnyOpen;

    await Promise.all(
      ids.map((id) => api.item.markComplete({ id, completed: nextCompleted }))
    );

    clearSelection();
    await load();
  }

  async function bulkDelete(ids: string[]) {
    if (!canEditItems) return;
    if (!confirm(`Delete ${ids.length} item(s)?`)) return;
    await Promise.all(ids.map((id) => api.item.delete({ id })));
    clearSelection();
    await load();
  }

  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "done">("all");

  const visibleItems = useMemo(() => {
    if (!list) return [];
    if (statusFilter === "all") return list.items;
    return list.items.filter((i) => i.state === statusFilter);
  }, [list, statusFilter]);

  const ownerName = list ? USERS.find((u) => u.id === list.ownerId)?.name ?? "—" : "—";

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-5 py-8">
          <p className="text-sm text-gray-600">Loading…</p>
        </div>
      </main>
    );
  }

  if (!list) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-5 py-8">
          <a href="/shopping-lists" className="text-sm text-gray-600 hover:underline">
            ← Back to lists
          </a>
          <p className="mt-4 text-sm text-red-600">{loadError || "List not found."}</p>
        </div>
      </main>
    );
  }

  const headerButtonsDisabled = savingStatus || savingName;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-5 py-8">
        <div className="mb-4">
          <a href="/shopping-lists" className="text-sm text-gray-600 hover:underline">
            ← Back to lists
          </a>
        </div>

        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">List ID: {list.id}</div>

            {editingName ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    className="text-3xl font-extrabold bg-white border rounded-lg px-2 py-1"
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      setNameError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && saveName()}
                    disabled={savingName}
                  />
                  <button
                    onClick={saveName}
                    disabled={savingName}
                    className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-50"
                  >
                    {savingName ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={cancelEditName}
                    disabled={savingName}
                    className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
                {nameError && <p className="text-xs text-red-600">{nameError}</p>}
              </div>
            ) : (
              <h1 className="text-3xl font-extrabold">{list.name}</h1>
            )}

            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-gray-600">Owner: {ownerName}</span>
              <RoleBadge role={role} />
              <StatusBadge status={list.status} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {isOwner && !archived && (
              <button
                onClick={startEditName}
                disabled={headerButtonsDisabled}
                className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-50"
              >
                Edit name
              </button>
            )}

            {isOwner && list.status === "active" && (
              <button
                onClick={() => setArchived(true)}
                disabled={headerButtonsDisabled}
                className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-50"
              >
                {savingStatus ? "Archiving…" : "Archive"}
              </button>
            )}

            {isOwner && list.status === "archived" && (
              <button
                onClick={() => setArchived(false)}
                disabled={headerButtonsDisabled}
                className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-50"
              >
                {savingStatus ? "Unarchiving…" : "Unarchive"}
              </button>
            )}
          </div>
        </div>

        <Section
          title="Items"
          right={canEditItems ? <ItemAddForm listId={list.id} disabled={!canEditItems} onAdded={load} /> : null}
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Filter:</span>
            <select
              className="border rounded-xl px-3 py-1.5 bg-white text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "open" | "done")}
            >
              <option value="all">All</option>
              <option value="open">To buy</option>
              <option value="done">Completed</option>
            </select>
          </div>

          <ItemsTable
            items={visibleItems}
            disabled={!canEditItems}
            selected={selected}
            onToggleSelect={toggleSelect}
            onClear={clearSelection}
            onEdit={startEditItem}
            onBulkResolve={bulkResolve}
            resolveLabel={resolveLabel}
            onBulkDelete={bulkDelete}
          />
        </Section>

        <Section title="Members">
          <MembersTable
            listId={list.id}
            ownerId={list.ownerId}
            memberIds={list.memberIds}
            canManage={isOwner && !archived}
            canLeave={isMember && !archived}
            onChanged={load}
          />
        </Section>
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Edit item</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Product name</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={editItemName}
                  onChange={(e) => setEditItemName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  className="w-full border rounded-lg px-3 py-2"
                  value={editItemQty}
                  onChange={(e) => setEditItemQty(Number(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={cancelEditItem} className="px-3 py-1.5 rounded-lg border bg-white">
                Cancel
              </button>
              <button onClick={saveEditItem} className="px-3 py-1.5 rounded-lg border bg-black text-white">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
