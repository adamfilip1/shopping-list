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
  const readOnly = disabled;

  // když je readOnly, akce i výběr úplně vypneme
  const selCount = readOnly ? 0 : selected.size;
  const ids = React.useMemo(
    () => (readOnly ? [] : Array.from(selected)),
    [selected, readOnly]
  );
  const singleId = selCount === 1 ? ids[0] : null;

  const hasActions =
    !readOnly && (onEdit || onBulkResolve || onBulkDelete) !== undefined;

  // drobný upgrade: nerezolvnute položky nahoře
  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.state === b.state) return a.name.localeCompare(b.name);
      return a.state === "done" ? 1 : -1;
    });
  }, [items]);

  return (
    <div className="space-y-3">
      {/* Akční lišta – jen když je něco vybrané a tabulka není readOnly */}
      {hasActions && selCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-white px-3 py-2">
          <span className="text-sm text-gray-600">{selCount} selected</span>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {singleId && onEdit && (
              <button
                type="button"
                disabled={readOnly}
                onClick={() => onEdit(singleId)}
                className="rounded-lg border bg-white px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                Edit item
              </button>
            )}

            {onBulkResolve && (
              <button
                type="button"
                disabled={readOnly}
                onClick={() => onBulkResolve(ids)}
                className="rounded-lg border bg-white px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                Mark as completed
              </button>
            )}

            {onBulkDelete && (
              <button
                type="button"
                disabled={readOnly}
                onClick={() => onBulkDelete(ids)}
                className="rounded-lg border bg-white px-3 py-1.5 text-sm text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Delete
              </button>
            )}

            <button
              type="button"
              onClick={onClear}
              className="rounded-lg border bg-white px-3 py-1.5 text-sm"
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
              <th className="w-28 px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Product name</th>
              <th className="w-32 px-4 py-2">Resolved</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((i) => {
              const isSel = !readOnly && selected.has(i.id);

              const interactiveRow =
                "border-t transition-colors " +
                (isSel
                  ? "cursor-pointer bg-indigo-50/70 hover:bg-indigo-50"
                  : "cursor-pointer hover:bg-gray-50");

              const readOnlyRow = "border-t opacity-60";

              return (
                <tr
                  key={i.id}
                  aria-selected={isSel}
                  aria-disabled={readOnly}
                  className={readOnly ? readOnlyRow : interactiveRow}
                  onClick={() => {
                    if (readOnly) return;
                    onToggleSelect(i.id);
                  }}
                >
                  <td className="px-4 py-2 align-middle">{i.quantity}</td>
                  <td className="px-4 py-2 align-middle">{i.name}</td>
                  <td className="px-4 py-2 align-middle">
                    {i.state === "done" ? (
                      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
                        Done
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}

            {sortedItems.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
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
