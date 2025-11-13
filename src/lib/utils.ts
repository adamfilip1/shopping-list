import { ShoppingList } from "./types";

export const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

export function getRole(list: ShoppingList, userId: string) {
  if (list.ownerId === userId) return "owner" as const;
  if (list.memberIds.includes(userId)) return "member" as const;
  return "viewer" as const;
}
