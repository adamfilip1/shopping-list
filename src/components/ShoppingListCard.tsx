import Link from "next/link";
import { CURRENT_USER_ID, USERS } from "@/lib/data";
import { getRole } from "@/lib/utils";
import { ShoppingList } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import RoleBadge from "./RoleBadge";
import ListActions from "./ListActions";

export default function ShoppingListCard({
  list,
  onArchive,
  onUnarchive,
  onDelete,
}: {
  list: ShoppingList;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const role = getRole(list, CURRENT_USER_ID);
  const ownerName =
    USERS.find((u) => u.id === list.ownerId)?.name ?? "—";
  const isOwner = role === "owner";

  return (
    <div className="bg-white rounded-2xl border p-4 flex items-start justify-between gap-4">
      <div>
        <Link
          href={`/shopping-lists/${list.id}`}
          className="font-semibold hover:underline"
        >
          {list.name}
        </Link>
        <div className="text-sm text-gray-600 mt-1">
          Owner: {ownerName} • Members: {list.memberIds.length}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <StatusBadge status={list.status} />
          <RoleBadge role={role} />
        </div>
      </div>

      <ListActions
        isOwner={isOwner}
        status={list.status}
        onArchive={() => onArchive(list.id)}
        onUnarchive={() => onUnarchive(list.id)}
        onDelete={() => onDelete(list.id)}
      />
    </div>
  );
}
