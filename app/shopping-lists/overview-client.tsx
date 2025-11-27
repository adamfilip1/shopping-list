"use client";

import { useMemo, useState } from "react";
import { CURRENT_USER_ID, INITIAL_LISTS } from "@/lib/data";
import { ShoppingList } from "@/lib/types";
import { uid } from "@/lib/utils";
import ShoppingListCard from "@/components/ShoppingListCard";

type Filter = "all" | "active" | "archived";

export default function HomeOverview() {
  const [lists, setLists] = useState<ShoppingList[]>(INITIAL_LISTS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const visibleLists = useMemo(
    () =>
      filter === "all"
        ? lists
        : lists.filter((l) => l.status === filter),
    [lists, filter]
  );

  function openCreate() {
    setIsCreateOpen(true);
    setError("");
    setNewName("");
  }

  function closeCreate() {
    setIsCreateOpen(false);
    setError("");
  }

  function handleCreate() {
    const name = newName.trim();
    if (!name) {
      setError("Name is required.");
      return;
    }

    const list: ShoppingList = {
      id: uid("list"),
      name,
      ownerId: CURRENT_USER_ID,
      memberIds: [CURRENT_USER_ID],
      status: "active",
      items: [],
    };

    setLists((prev) => [list, ...prev]);
    setNewName("");
    setError("");
    setIsCreateOpen(false);
  }

  function handleDelete(id: string) {
    const list = lists.find((l) => l.id === id);
    if (!list) return;

    if (!window.confirm(`Delete shopping list "${list.name}"?`)) return;

    setLists((prev) => prev.filter((l) => l.id !== id));
  }

  function handleArchive(id: string) {
    setLists((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status: "archived" } : l
      )
    );
  }

  function handleUnarchive(id: string) {
    setLists((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status: "active" } : l
      )
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-5 py-8">
        {/* Header */}
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
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>

            <button
              onClick={openCreate}
              className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-900"
            >
              + New list
            </button>
          </div>
        </div>

        {/* Tiles */}
        {visibleLists.length === 0 ? (
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
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal: new list */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">New shopping list</h2>

            <label
              className="block text-sm font-medium mb-1"
              htmlFor="new-list-name"
            >
              Name
            </label>
            <input
              id="new-list-name"
              autoFocus
              className="w-full border rounded-lg px-3 py-2 mb-2"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
            {error && (
              <p className="text-xs text-red-600 mb-2">{error}</p>
            )}

            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={closeCreate}
                className="px-3 py-1.5 rounded-lg border bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-3 py-1.5 rounded-lg border bg-black text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
