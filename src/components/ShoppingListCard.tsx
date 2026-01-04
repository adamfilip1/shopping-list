"use client";

import Link from "next/link";
import { CURRENT_USER_ID, USERS } from "@/lib/data";
import { getRole } from "@/lib/utils";
import { ShoppingList } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import RoleBadge from "./RoleBadge";
import ListActions from "./ListActions";
import { useI18n } from "@/contexts/I18nContext";

export default function ShoppingListCard({
  list,
  onArchive,
  onUnarchive,
  onDeleted,
}: {
  list: ShoppingList;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDeleted: () => void;
}) {
  const { t } = useI18n();
  const role = getRole(list, CURRENT_USER_ID);
  const ownerName = USERS.find((u) => u.id === list.ownerId)?.name ?? "—";
  const isOwner = role === "owner";

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border dark:border-gray-700 p-4 flex flex-col sm:flex-row items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <Link
          href={`/shopping-lists/${list.id}`}
          className="font-semibold hover:underline text-gray-900 dark:text-gray-100 break-words"
        >
          {list.name}
        </Link>

        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {t("detail.owner")}: {ownerName} • {t("members.members")}: {list.memberIds.length}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={list.status} />
          <RoleBadge role={role} />
        </div>
      </div>

      <div className="w-full sm:w-auto">
        <ListActions
          isOwner={isOwner}
          status={list.status}
          listId={list.id}
          onArchive={() => onArchive(list.id)}
          onUnarchive={() => onUnarchive(list.id)}
          onDeleted={onDeleted}
        />
      </div>
    </div>
  );
}
