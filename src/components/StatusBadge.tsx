"use client";

import { useI18n } from "@/contexts/I18nContext";

export default function StatusBadge({ status }: { status: "active"|"archived" }) {
  const { t } = useI18n();
  const label = status === "archived" ? t("overview.filterArchived") : t("overview.filterActive");
  return status === "archived"
    ? <span className="text-xs px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">{label}</span>
    : <span className="text-xs px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">{label}</span>;
}
