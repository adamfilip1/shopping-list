"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { INITIAL_LISTS, CURRENT_USER_ID } from "@/lib/data";
import { ShoppingList } from "@/lib/types";
import { uid } from "@/lib/utils";
import ShoppingListCard from "@/components/ShoppingListCard";

export default function Page() {
  const router = useRouter();
  const search = useSearchParams();
  const showOverview = search.get("overview") === "1";

  // automatický redirect na detail
  useEffect(() => {
    if (showOverview) return;
    const firstActive =
      INITIAL_LISTS.find((l) => l.status === "active")?.id ??
      INITIAL_LISTS[0]?.id;
    if (firstActive) router.replace(`/lists/${firstActive}`);
  }, [showOverview, router]);

  if (!showOverview) return null;

  const [lists, setLists] = useState<ShoppingList[]>(INITIAL_LISTS);
  const [hideArchived, setHideArchived] = useState(false);

  function addList() {
    const name = prompt("List name:");
    if (!name) return;
    setLists((p) => [
      {
        id: uid("list"),
        name,
        ownerId: CURRENT_USER_ID,
        memberIds: [CURRENT_USER_ID],
        status: "active",
        items: [],
      },
      ...p,
    ]);
  }

  const visible = hideArchived
    ? lists.filter((l) => l.status !== "archived")
    : lists;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-5 py-8 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold">Shopping lists</h1>
          <div className="flex items-center gap-2">
            <button onClick={addList} className="px-3 py-1.5 rounded-lg border bg-white">
              Add
            </button>
            <button
              onClick={() => setHideArchived((v) => !v)}
              className="px-3 py-1.5 rounded-lg border bg-white"
            >
              {hideArchived ? "Show archived" : "Hide archived"}
            </button>
          </div>
        </header>

        <div className="grid gap-4">
          {visible.map((l) => (
            <ShoppingListCard
              key={l.id}
              list={l}
              onArchive={(id) =>
                setLists((p) => p.map((x) => (x.id === id ? { ...x, status: "archived" } : x)))
              }
              onUnarchive={(id) =>
                setLists((p) => p.map((x) => (x.id === id ? { ...x, status: "active" } : x)))
              }
              onDelete={(id) => setLists((p) => p.filter((x) => x.id !== id))}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
