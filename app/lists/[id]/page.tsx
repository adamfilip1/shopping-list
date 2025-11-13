"use client";

import { useMemo, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
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
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const initial = useMemo(() => INITIAL_LISTS.find((l) => l.id === id), [id]);
  if (!initial) notFound();

  const [list, setList] = useState<ShoppingList>(initial!);

const role = getRole(list, CURRENT_USER_ID);

const isOwner  = role === "owner";
const isMember = role === "member";
const isViewer = role === "viewer";

const archived = list.status === "archived";


  const [editing, setEditing] = useState(false);
  function saveName(next: string) {
    if (!isOwner || archived) return;
    setList((p) => ({ ...p, name: next.trim() || p.name }));
    setEditing(false);
  }

  const canEditItems = (isOwner || isMember) && !archived;

  function addItem(name: string, quantity: number) {
    if (!canEditItems) return;
    const item: ShoppingListItem = { id: uid("i"), name, quantity, state: "open" };
    setList((p) => ({ ...p, items: [item, ...p.items] }));
  }

  function editItem(id: string) {
    if (!canEditItems) return;
    setList((p) => {
      const cur = p.items.find((x) => x.id === id);
      if (!cur) return p;
      const name = prompt("Edit item name:", cur.name ?? "") ?? cur.name ?? "";
      const qStr = prompt("Edit quantity:", String(cur.quantity)) ?? String(cur.quantity);
      const qty = Number.isFinite(Number(qStr)) ? Number(qStr) : cur.quantity;
      return {
        ...p,
        items: p.items.map((x) =>
          x.id === id ? { ...x, name: name.trim() || cur.name, quantity: qty } : x
        ),
      };
    });
  }

  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
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
      items: p.items.map((i) => (ids.includes(i.id) ? { ...i, state: "done" } : i)),
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

  function addMember(userId: string) {
    if (!isOwner || archived) return;
    if (!USERS.some((u) => u.id === userId)) return;
    if (list.memberIds.includes(userId)) return;
    setList((p) => ({ ...p, memberIds: [...p.memberIds, userId] }));
  }

  function removeMember(userId: string) {
    if (!isOwner) return; 
    if (userId === list.ownerId) return;
    setList((p) => ({ ...p, memberIds: p.memberIds.filter((x) => x !== userId) }));
  }

  //Leave list
  function leaveList() {
    if (isOwner) return;
    if (isMember) {
      setList((p) => ({ ...p, memberIds: p.memberIds.filter((x) => x !== CURRENT_USER_ID) }));
    }
  }

  function archive() {
    if (isOwner) setList((p) => ({ ...p, status: "archived" }));
  }
  function unarchive() {
    if (isOwner) setList((p) => ({ ...p, status: "active" }));
  }

  const ownerName = USERS.find((u) => u.id === list.ownerId)?.name ?? "—";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">List ID: {list.id}</div>

            {editing ? (
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
                    const el = document.querySelector<HTMLInputElement>("input");
                    saveName(el?.value ?? list.name);
                  }}
                  className="px-3 py-1.5 rounded-lg border bg-white"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1.5 rounded-lg border bg-white"
                >
                  Cancel
                </button>
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
                onClick={() => setEditing(true)}
                className="px-3 py-1.5 rounded-lg border bg-white"
              >
                Edit name
              </button>
            )}
            {isOwner && list.status === "active" && (
              <button onClick={archive} className="px-3 py-1.5 rounded-lg border bg-white">
                Archive
              </button>
            )}
            {isOwner && list.status === "archived" && (
              <button onClick={unarchive} className="px-3 py-1.5 rounded-lg border bg-white">
                Unarchive
              </button>
            )}
          </div>
        </div>

        {/* Items */}
        <Section
          title="Items"
          right={<ItemAddForm disabled={!canEditItems} onAdd={addItem} />}
        >
          <ItemsTable
            items={list.items}
            disabled={!canEditItems}
            selected={selected}
            onToggleSelect={toggleSelect}
            onClear={clearSelection}
            onEdit={editItem}
            onBulkResolve={bulkResolve}
            onBulkDelete={bulkDelete}
          />
        </Section>

        {/* Members */}
        <Section title="Members" right={
          (isMember || isViewer) ? (
            <button onClick={leaveList} className="px-3 py-1.5 rounded-lg border bg-white">
              Leave list
            </button>
          ) : null
        }>
          <MembersTable
            ownerId={list.ownerId}
            memberIds={list.memberIds}
            canManage={isOwner && !archived}
            canLeave={false}
            onAdd={addMember}
            onRemove={removeMember}
            onLeave={leaveList}
          />
        </Section>
      </div>
    </main>
  );
}
