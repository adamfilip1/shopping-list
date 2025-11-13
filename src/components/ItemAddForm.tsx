"use client";
import { useState } from "react";

export default function ItemAddForm({
  disabled, onAdd,
}: { disabled?: boolean; onAdd: (name:string, quantity:number)=>void }) {
  const [name, setName] = useState("");
  const [qty, setQty]   = useState(1);
  const add = () => {
    const n = name.trim();
    if (!n || qty <= 0) return;
    onAdd(n, qty);
    setName(""); setQty(1);
  };
  return (
    <div className="flex items-center gap-2">
      <input
        disabled={disabled}
        className="flex-1 bg-white border rounded-xl px-3 py-2"
        placeholder="Product name…"
        value={name}
        onChange={e=>setName(e.target.value)}
        onKeyDown={e=>e.key==="Enter" && add()}
      />
      <input
        disabled={disabled}
        type="number" min={1}
        className="w-24 bg-white border rounded-xl px-3 py-2"
        value={qty} onChange={e=>setQty(Number(e.target.value))}
      />
      <button disabled={disabled} onClick={add}
        className="px-4 py-2 rounded-xl bg-green-600 text-white disabled:opacity-50">
        Add item
      </button>
    </div>
  );
}
