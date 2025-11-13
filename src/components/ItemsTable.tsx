import React from "react";
import { ShoppingListItem } from "@/lib/types";

type Props = {
  items: ShoppingListItem[];
  disabled?: boolean;

  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onClear: () => void;

  onEdit?: (id: string) => void;
  onBulkResolve?: (ids: string[]) => void;
  onBulkDelete?: (ids: string[]) => void;
};

export default function ItemsTable({
  items,
  disabled = false,
  selected,
  onToggleSelect,
  onClear,
  onEdit,
  onBulkResolve,
  onBulkDelete,
}: Props) {
  const selCount = selected.size;
  const ids = React.useMemo(() => Array.from(selected), [selected]);
  const singleId = selCount === 1 ? ids[0] : null;

  return (
    <div className="space-y-3">
      {/* Akční lišta – jen když je něco vybrané */}
      {selCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-white px-3 py-2">
          <span className="text-sm text-gray-600">
            {selCount} selected
          </span>

          <div className="ml-auto flex items-center gap-2">
            {singleId && (
              <button
                disabled={disabled}
                onClick={() => onEdit?.(singleId)}
                className="px-3 py-1.5 rounded-lg border bg-white text-sm"
              >
                Edit item
              </button>
            )}

            <button
              disabled={disabled}
              onClick={() => onBulkResolve?.(ids)}
              className="px-3 py-1.5 rounded-lg border bg-white text-sm"
            >
              Mark as completed
            </button>

            <button
              disabled={disabled}
              onClick={() => onBulkDelete?.(ids)}
              className="px-3 py-1.5 rounded-lg border bg-white text-sm text-red-600"
            >
              Delete
            </button>

            <button
              onClick={onClear}
              className="px-3 py-1.5 rounded-lg border bg-white text-sm"
            >
              Unselect all
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-2 w-28">Quantity</th>
              <th className="px-4 py-2">Product name</th>
              <th className="px-4 py-2 w-32">Resolved</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => {
              const isSel = selected.has(i.id);
              const rowCls =
                "cursor-pointer border-t transition-colors " +
                (isSel ? "bg-indigo-50/70 hover:bg-indigo-50"
                       : "hover:bg-gray-50");
              return (
                <tr
                  key={i.id}
                  aria-selected={isSel}
                  className={rowCls + (disabled ? " opacity-60" : "")}
                  onClick={() => onToggleSelect(i.id)}
                >
                  <td className="px-4 py-2 align-middle">{i.quantity}</td>
                  <td className="px-4 py-2 align-middle">{i.name}</td>
                  <td className="px-4 py-2 align-middle">
                    {i.state === "done" ? "✓" : ""}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-gray-500">
                  No items yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
