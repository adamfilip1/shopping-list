"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";

export default function ItemAddForm({
  listId,
  disabled,
  onAdded,
}: {
  listId: string;
  disabled?: boolean;
  onAdded?: () => void;
}) {
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
    <div className="flex items-center gap-2">
      <input
        disabled={isDisabled}
        className="flex-1 bg-white border rounded-xl px-3 py-2"
        placeholder="Product name…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && add()}
      />
      <input
        disabled={isDisabled}
        type="number"
        min={1}
        className="w-24 bg-white border rounded-xl px-3 py-2"
        value={qty}
        onChange={(e) => setQty(Number(e.target.value))}
      />
      <button
        disabled={isDisabled}
        onClick={add}
        className="px-4 py-2 rounded-xl bg-green-600 text-white disabled:opacity-50"
      >
        {loading ? "Adding…" : "Add item"}
      </button>
    </div>
  );
}
