"use client";

import { useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { CURRENT_USER_ID, INITIAL_LISTS, USERS } from "@/lib/data";
import { ShoppingList, ShoppingListItem } from "@/lib/types";
import { getRole, uid } from "@/lib/utils";
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

export default function Page() {
  // route param odpovídá názvu složky [listId]
  const { listId } = useParams<{ listId: string }>();

  const initial = useMemo(
    () => INITIAL_LISTS.find((l) => l.id === listId),
    [listId]
  );
  if (!initial) notFound();

  const [list, setList] = useState<ShoppingList>(initial);

  const role = getRole(list, CURRENT_USER_ID);
  const isOwner = role === "owner";
  const isMember = role === "member";
  const isViewer = role === "viewer";
  const archived = list.status === "archived";

  // edit názvu listu
  const [editingName, setEditingName] = useState(false);
  function saveName(next: string) {
    if (!isOwner || archived) return;
    setList((p) => ({ ...p, name: next.trim() || p.name }));
    setEditingName(false);
  }

  const canEditItems = (isOwner || isMember) && !archived;

  // přidávání položky
  function addItem(name: string, quantity: number) {
    if (!canEditItems) return;
    const item: ShoppingListItem = {
      id: uid("i"),
      name,
      quantity,
      state: "open",
    };
    setList((p) => ({ ...p, items: [item, ...p.items] }));
  }

  // --- EDIT ITEM: modál se jménem + množstvím v jednom ---
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemQty, setEditItemQty] = useState(1);

  function startEditItem(id: string) {
    if (!canEditItems) return;
    const cur = list.items.find((x) => x.id === id);
    if (!cur) return;
    setEditingItem(cur);
    setEditItemName(cur.name ?? "");
    setEditItemQty(cur.quantity ?? 1);
  }

  function cancelEditItem() {
    setEditingItem(null);
  }

  function saveEditItem() {
    if (!canEditItems || !editingItem) return;
    const nextName = editItemName.trim() || editingItem.name;
    const nextQty = editItemQty > 0 ? editItemQty : editingItem.quantity;
    setList((p) => ({
      ...p,
      items: p.items.map((i) =>
        i.id === editingItem.id
          ? { ...i, name: nextName, quantity: nextQty }
          : i
      ),
    }));
    setEditingItem(null);
  }

  // výběr položek (jen když můžu editovat)
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

  function bulkResolve(ids: string[]) {
    if (!canEditItems) return;
    setList((p) => ({
      ...p,
      items: p.items.map((i) =>
        ids.includes(i.id) ? { ...i, state: "done" } : i
      ),
    }));
    clearSelection();
  }

  function bulkDelete(ids: string[]) {
    if (!canEditItems) return;
    if (!confirm(`Delete ${ids.length} item(s)?`)) return;
    setList((p) => ({
      ...p,
      items: p.items.filter((i) => !ids.includes(i.id)),
    }));
    clearSelection();
  }

  // --- filtr položek podle stavu ---
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "done">(
    "all"
  );

  const visibleItems = useMemo(() => {
    if (statusFilter === "all") return list.items;
    return list.items.filter((i) => i.state === statusFilter);
  }, [list.items, statusFilter]);

  // members
  function addMember(userId: string) {
    if (!isOwner || archived) return;
    if (!USERS.some((u) => u.id === userId)) return;
    if (list.memberIds.includes(userId)) return;
    setList((p) => ({ ...p, memberIds: [...p.memberIds, userId] }));
  }

  function removeMember(userId: string) {
    if (!isOwner) return;
    if (userId === list.ownerId) return;
    setList((p) => ({
      ...p,
      memberIds: p.memberIds.filter((x) => x !== userId),
    }));
  }

  function leaveList() {
    if (!isMember || archived) return;
    setList((p) => ({
      ...p,
      memberIds: p.memberIds.filter((x) => x !== CURRENT_USER_ID),
    }));
  }

  function archive() {
    if (isOwner) setList((p) => ({ ...p, status: "archived" }));
  }

  function unarchive() {
    if (isOwner) setList((p) => ({ ...p, status: "active" }));
  }

  const ownerName =
    USERS.find((u) => u.id === list.ownerId)?.name ?? "—";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="mb-4">
  <a href="/shopping-lists" className="text-sm text-gray-600 hover:underline">
          ← Back to lists
          </a>
        </div>

        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">
              List ID: {list.id}
            </div>

            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  className="text-3xl font-extrabold bg-white border rounded-lg px-2 py-1"
                  defaultValue={list.name}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    saveName((e.target as HTMLInputElement).value)
                  }
                />
                <button
                  onClick={() => {
                    const el =
                      document.querySelector<HTMLInputElement>("input");
                    saveName(el?.value ?? list.name);
                  }}
                  className="px-3 py-1.5 rounded-lg border bg-white"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="px-3 py-1.5 rounded-lg border bg-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <h1 className="text-3xl font-extrabold">{list.name}</h1>
            )}

            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Owner: {ownerName}
              </span>
              <RoleBadge role={role} />
              <StatusBadge status={list.status} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {isOwner && !archived && (
              <button
                onClick={() => setEditingName(true)}
                className="px-3 py-1.5 rounded-lg border bg-white"
              >
                Edit name
              </button>
            )}
            {isOwner && list.status === "active" && (
              <button
                onClick={archive}
                className="px-3 py-1.5 rounded-lg border bg-white"
              >
                Archive
              </button>
            )}
            {isOwner && list.status === "archived" && (
              <button
                onClick={unarchive}
                className="px-3 py-1.5 rounded-lg border bg:white"
              >
                Unarchive
              </button>
            )}
          </div>
        </div>

        {/* Items */}
        <Section
          title="Items"
          right={
            canEditItems ? (
              <ItemAddForm disabled={!canEditItems} onAdd={addItem} />
            ) : null
          }
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Filter:</span>
            <select
              className="border rounded-xl px-3 py-1.5 bg-white text-sm"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "open" | "done")
              }
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
            onBulkDelete={bulkDelete}
          />
        </Section>

        {/* Members */}
        <Section
          title="Members"
          right={
            isMember && !archived ? (
              <button
                onClick={leaveList}
                className="px-3 py-1.5 rounded-lg border bg-white"
              >
                Leave list
              </button>
            ) : null
          }
        >
          <MembersTable
            ownerId={list.ownerId}
            memberIds={list.memberIds}
            canManage={isOwner && !archived}
            canLeave={isMember && !archived}
            onAdd={addMember}
            onRemove={removeMember}
            onLeave={leaveList}
          />
        </Section>
      </div>

      {/* EDIT ITEM MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Edit item</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Product name
                </label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={editItemName}
                  onChange={(e) => setEditItemName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full border rounded-lg px-3 py-2"
                  value={editItemQty}
                  onChange={(e) =>
                    setEditItemQty(Number(e.target.value) || 0)
                  }
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={cancelEditItem}
                className="px-3 py-1.5 rounded-lg border bg-white"
              >
                Cancel
              </button>
              <button
                onClick={saveEditItem}
                className="px-3 py-1.5 rounded-lg border bg-black text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
