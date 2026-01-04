"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api-client";
import { ShoppingList } from "@/lib/types";
import ShoppingListCard from "@/components/ShoppingListCard";
import ItemsPerListChart from "@/components/ItemsPerListChart";
import Header from "@/components/Header";
import { useI18n } from "@/contexts/I18nContext";

type Filter = "all" | "active" | "archived";

function mapServerListToUi(l: any): ShoppingList {
  const itemsRaw = l.items ?? l.itemList ?? [];
  return {
    id: l.id,
    name: l.name,
    ownerId: l.ownerId,
    memberIds: l.members ?? l.memberIds ?? [],
    status: l.isArchived ? "archived" : "active",
    items: itemsRaw.map((i: any) => {
      const status = i.status ?? i.state;
      const done = status === "done" || status === "completed";
      return {
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        state: done ? "done" : "open",
      };
    }),
  };
}

export default function HomeOverview() {
  const { t } = useI18n();
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

      const listItems = res?.itemList ?? [];
      
      // Fetch full data for each list to get item counts
      const listsWithItems = await Promise.all(
        listItems.map(async (listItem: any) => {
          try {
            const fullList = await api.shoppingList.get({ id: listItem.id });
            return mapServerListToUi(fullList);
          } catch {
            // If fetching full list fails, use basic data
            return mapServerListToUi(listItem);
          }
        })
      );

      setLists(listsWithItems);
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
        
        const listItems = res?.itemList ?? [];
        
        // Fetch full data for each list to get item counts
        const listsWithItems = await Promise.all(
          listItems.map(async (listItem: any) => {
            try {
              const fullList = await api.shoppingList.get({ id: listItem.id });
              return mapServerListToUi(fullList);
            } catch {
              return mapServerListToUi(listItem);
            }
          })
        );
        
        if (cancelled) return;
        setLists(listsWithItems);
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
      setCreateError(t("create.nameRequired"));
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
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 py-6 sm:py-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                {t("overview.title")}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t("overview.description")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                className="border dark:border-gray-700 rounded-xl px-3 py-1.5 bg-white dark:bg-[#1a1a1a] text-sm text-gray-900 dark:text-gray-100"
                value={filter}
                onChange={(e) => setFilter(e.target.value as Filter)}
                disabled={loading}
              >
                <option value="all">{t("overview.filterAll")}</option>
                <option value="active">{t("overview.filterActive")}</option>
                <option value="archived">{t("overview.filterArchived")}</option>
              </select>

              <button
                onClick={openCreate}
                className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 disabled:opacity-60"
                disabled={loading}
              >
                {t("overview.newList")}
              </button>
            </div>
          </div>

          {actionError && (
            <div className="mb-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2">
              <p className="text-sm text-red-700 dark:text-red-400">{actionError}</p>
            </div>
          )}

          {loading ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">{t("common.loading")}</p>
          ) : loadError ? (
            <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2">
              <p className="text-sm text-red-700 dark:text-red-400">{loadError}</p>
            </div>
          ) : (
            <>
              {lists.length > 0 && (
                <div className="mb-6 bg-white dark:bg-[#1a1a1a] rounded-2xl border dark:border-gray-700 p-4 sm:p-5">
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    {t("overview.itemsPerList")}
                  </h2>
                  <ItemsPerListChart lists={lists} />
                </div>
              )}

              {visibleLists.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("overview.noLists")}
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
                      // @ts-ignore
                      busy={busyListId === list.id}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {isCreateOpen && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 p-4">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg p-5 w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                {t("create.title")}
              </h2>

              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300" htmlFor="new-list-name">
                {t("create.name")}
              </label>
              <input
                id="new-list-name"
                autoFocus
                className="w-full border dark:border-gray-700 rounded-lg px-3 py-2 mb-2 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100"
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

              {createError && <p className="text-xs text-red-600 dark:text-red-400 mb-2">{createError}</p>}

              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={closeCreate}
                  className="px-3 py-1.5 rounded-lg border dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 disabled:opacity-60"
                  disabled={creating}
                >
                  {t("detail.cancel")}
                </button>
                <button
                  onClick={handleCreate}
                  className="px-3 py-1.5 rounded-lg border bg-black dark:bg-white text-white dark:text-black disabled:opacity-60"
                  disabled={creating}
                >
                  {creating ? t("create.creating") : t("create.create")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
