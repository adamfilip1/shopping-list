"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";
import { useI18n } from "@/contexts/I18nContext";

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
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  if (!isOwner) return null;

  const handleDelete = async () => {
    if (loading) return;
    if (!confirm("Delete this list?")) return;
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
          className="px-3 py-1.5 rounded-lg border dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 disabled:opacity-50 text-sm"
        >
          {t("detail.archive")}
        </button>
      ) : (
        <button
          disabled={loading}
          onClick={onUnarchive}
          className="px-3 py-1.5 rounded-lg border dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 disabled:opacity-50 text-sm"
        >
          {t("detail.unarchive")}
        </button>
      )}

      <button
        disabled={loading}
        onClick={handleDelete}
        className="px-3 py-1.5 rounded-lg border dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-red-600 dark:text-red-400 disabled:opacity-50 text-sm"
      >
        {loading ? "Deleting…" : t("items.delete")}
      </button>
    </div>
  );
}
