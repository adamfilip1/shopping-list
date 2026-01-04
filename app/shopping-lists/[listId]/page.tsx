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
import ItemsStatusChart from "@/components/ItemsStatusChart";
import Header from "@/components/Header";
import { useI18n } from "@/contexts/I18nContext";

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
    <section className="bg-white dark:bg-[#1a1a1a] rounded-2xl border dark:border-gray-700 mb-6">
      <div className="border-b dark:border-gray-700 px-4 sm:px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="font-semibold text-gray-900 dark:text-gray-100">{title}</div>
        {right && <div className="w-full sm:w-auto">{right}</div>}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
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
  const { t } = useI18n();

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
      setNameError(t("detail.nameRequired"));
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
  const resolveLabel = hasAnyOpenSelected ? t("items.markCompleted") : t("items.markUndone");

  async function bulkResolve(ids: string[]) {
    if (!canEditItems || !list) return;

    const selectedNow = list.items.filter((i) => ids.includes(i.id));
    const hasAnyOpen = selectedNow.some((i) => i.state === "open");

    const nextCompleted = hasAnyOpen;

    await Promise.all(
      ids.map((id) => api.item.markComplete({ id, completed: nextCompleted }))
    );

    clearSelection();
    await load();
  }

  async function bulkDelete(ids: string[]) {
    if (!canEditItems) return;
    if (!confirm(t("items.deleteConfirm", { count: ids.length }))) return;
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
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
          <div className="max-w-3xl mx-auto px-4 sm:px-5 py-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t("common.loading")}</p>
          </div>
        </main>
      </>
    );
  }

  if (!list) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
          <div className="max-w-3xl mx-auto px-4 sm:px-5 py-8">
            <a href="/shopping-lists" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
              {t("nav.backToLists")}
            </a>
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{loadError || t("common.notFound")}</p>
          </div>
        </main>
      </>
    );
  }

  const headerButtonsDisabled = savingStatus || savingName;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-5 py-6 sm:py-8">
          <div className="mb-4">
            <a href="/shopping-lists" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
              {t("nav.backToLists")}
            </a>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("detail.listId")}: {list.id}</div>

              {editingName ? (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      autoFocus
                      className="text-2xl sm:text-3xl font-extrabold bg-white dark:bg-[#1a1a1a] border dark:border-gray-700 rounded-lg px-2 py-1 text-gray-900 dark:text-gray-100"
                      value={editName}
                      onChange={(e) => {
                        setEditName(e.target.value);
                        setNameError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && saveName()}
                      disabled={savingName}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveName}
                        disabled={savingName}
                        className="px-3 py-1.5 rounded-lg border dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 disabled:opacity-50"
                      >
                        {savingName ? t("detail.saving") : t("detail.save")}
                      </button>
                      <button
                        onClick={cancelEditName}
                        disabled={savingName}
                        className="px-3 py-1.5 rounded-lg border dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 disabled:opacity-50"
                      >
                        {t("detail.cancel")}
                      </button>
                    </div>
                  </div>
                  {nameError && <p className="text-xs text-red-600 dark:text-red-400">{nameError}</p>}
                </div>
              ) : (
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 break-words">{list.name}</h1>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t("detail.owner")}: {ownerName}</span>
                <RoleBadge role={role} />
                <StatusBadge status={list.status} />
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              {isOwner && !archived && (
                <button
                  onClick={startEditName}
                  disabled={headerButtonsDisabled}
                  className="px-3 py-1.5 rounded-lg border dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 disabled:opacity-50 text-sm sm:text-base"
                >
                  {t("detail.editName")}
                </button>
              )}

              {isOwner && list.status === "active" && (
                <button
                  onClick={() => setArchived(true)}
                  disabled={headerButtonsDisabled}
                  className="px-3 py-1.5 rounded-lg border dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 disabled:opacity-50 text-sm sm:text-base"
                >
                  {savingStatus ? t("detail.archiving") : t("detail.archive")}
                </button>
              )}

              {isOwner && list.status === "archived" && (
                <button
                  onClick={() => setArchived(false)}
                  disabled={headerButtonsDisabled}
                  className="px-3 py-1.5 rounded-lg border dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 disabled:opacity-50 text-sm sm:text-base"
                >
                  {savingStatus ? t("detail.unarchiving") : t("detail.unarchive")}
                </button>
              )}
            </div>
          </div>

          <Section
            title={t("stats.itemsStatus")}
          >
            <ItemsStatusChart items={list.items} />
          </Section>

          <Section
            title={t("items.title")}
            right={canEditItems ? <ItemAddForm listId={list.id} disabled={!canEditItems} onAdded={load} /> : null}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t("items.filter")}:</span>
              <select
                className="border dark:border-gray-700 rounded-xl px-3 py-1.5 bg-white dark:bg-[#1a1a1a] text-sm text-gray-900 dark:text-gray-100"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "open" | "done")}
              >
                <option value="all">{t("items.filterAll")}</option>
                <option value="open">{t("items.filterOpen")}</option>
                <option value="done">{t("items.filterDone")}</option>
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

          <Section title={t("members.title")}>
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
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 p-4">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg p-5 w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{t("items.editItemTitle")}</h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t("items.productName")}</label>
                  <input
                    className="w-full border dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100"
                    value={editItemName}
                    onChange={(e) => setEditItemName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t("items.quantity")}</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full border dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100"
                    value={editItemQty}
                    onChange={(e) => setEditItemQty(Number(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={cancelEditItem}
                  className="px-3 py-1.5 rounded-lg border dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100"
                >
                  {t("detail.cancel")}
                </button>
                <button
                  onClick={saveEditItem}
                  className="px-3 py-1.5 rounded-lg border bg-black dark:bg-white text-white dark:text-black"
                >
                  {t("detail.save")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
