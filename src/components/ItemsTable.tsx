"use client";

import React from "react";
import { ShoppingListItem } from "@/lib/types";
import { useI18n } from "@/contexts/I18nContext";

type Props = {
  items: ShoppingListItem[];
  disabled?: boolean;

  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onClear: () => void;

  onEdit?: (id: string) => void;
  onBulkResolve?: (ids: string[]) => void;
  resolveLabel?: string;
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
  resolveLabel,
  onBulkDelete,
}: Props) {
  const { t } = useI18n();
  const readOnly = disabled;

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
      {hasActions && selCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border dark:border-gray-700 bg-white dark:bg-[#1a1a1a] px-3 py-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">{selCount} {t("items.selected")}</span>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {singleId && onEdit && (
              <button
                type="button"
                disabled={readOnly}
                onClick={() => onEdit(singleId)}
                className="rounded-lg border dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("items.editItem")}
              </button>
            )}

            {onBulkResolve && (
              <button
                type="button"
                disabled={readOnly}
                onClick={() => onBulkResolve(ids)}
                className="rounded-lg border dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resolveLabel ?? t("items.markCompleted")}
              </button>
            )}

            {onBulkDelete && (
              <button
                type="button"
                disabled={readOnly}
                onClick={() => onBulkDelete(ids)}
                className="rounded-lg border dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-red-600 dark:text-red-400 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("items.delete")}
              </button>
            )}

            <button
              type="button"
              onClick={onClear}
              className="rounded-lg border dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm"
            >
              {t("items.unselectAll")}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border dark:border-gray-700 bg-white dark:bg-[#1a1a1a] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-left">
            <tr>
              <th className="w-28 px-4 py-2 text-gray-700 dark:text-gray-300">{t("items.quantity")}</th>
              <th className="px-4 py-2 text-gray-700 dark:text-gray-300">{t("items.productName")}</th>
              <th className="w-32 px-4 py-2 text-gray-700 dark:text-gray-300">{t("items.resolved")}</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((i) => {
              const isSel = !readOnly && selected.has(i.id);

              const interactiveRow =
                "border-t dark:border-gray-700 transition-colors " +
                (isSel
                  ? "cursor-pointer bg-indigo-50/70 dark:bg-indigo-900/20 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                  : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800");

              const readOnlyRow = "border-t dark:border-gray-700 opacity-60";

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
                  <td className="px-4 py-2 align-middle text-gray-900 dark:text-gray-100">{i.quantity}</td>
                  <td className="px-4 py-2 align-middle text-gray-900 dark:text-gray-100">{i.name}</td>
                  <td className="px-4 py-2 align-middle">
                    {i.state === "done" ? (
                      <span className="inline-flex items-center rounded-full border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 text-[11px] font-medium text-green-700 dark:text-green-300">
                        {t("items.done")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                        {t("items.pending")}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}

            {sortedItems.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  {t("items.noItems")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
