"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";
import { useI18n } from "@/contexts/I18nContext";

export default function ItemAddForm({
  listId,
  disabled,
  onAdded,
}: {
  listId: string;
  disabled?: boolean;
  onAdded?: () => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  const add = async () => {
    const n = name.trim();
    if (!n || qty <= 0 || loading || disabled) return;

    setLoading(true);
    try {
      await api.item.add({ listId, name: n, quantity: qty });
      setName("");
      setQty(1);
      onAdded?.();
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = disabled || loading;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
      <input
        disabled={isDisabled}
        className="flex-1 bg-white dark:bg-[#0a0a0a] border dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-gray-100"
        placeholder={t("items.productNamePlaceholder")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && add()}
      />
      <input
        disabled={isDisabled}
        type="number"
        min={1}
        className="w-full sm:w-24 bg-white dark:bg-[#0a0a0a] border dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-gray-100"
        value={qty}
        onChange={(e) => setQty(Number(e.target.value))}
      />
      <button
        disabled={isDisabled}
        onClick={add}
        className="px-4 py-2 rounded-xl bg-green-600 dark:bg-green-700 text-white disabled:opacity-50 whitespace-nowrap"
      >
        {loading ? t("items.adding") : t("items.addItem")}
      </button>
    </div>
  );
}
