"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";

export default function ListActions({
  isOwner,
  status,
  listId,
  onArchive,
  onUnarchive,
  onDeleted,
}: {
  isOwner: boolean;
  status: "active" | "archived";
  listId: string;
  onArchive: () => void;
  onUnarchive: () => void;
  onDeleted?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  if (!isOwner) return null;

  const handleDelete = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await api.shoppingList.delete({ id: listId });
      onDeleted?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {status === "active" ? (
        <button
          disabled={loading}
          onClick={onArchive}
          className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-50"
        >
          Archive
        </button>
      ) : (
        <button
          disabled={loading}
          onClick={onUnarchive}
          className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-50"
        >
          Unarchive
        </button>
      )}

      <button
        disabled={loading}
        onClick={handleDelete}
        className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-50"
      >
        {loading ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
