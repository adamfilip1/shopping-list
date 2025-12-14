import { randomUUID } from "crypto";
import { AWID, CURRENT_USER_ID } from "@/lib/constants";

export type ShoppingListMock = {
  awid: string;
  id: string;
  ownerId: string;
  name: string;
  members: string[];
  isArchived: boolean;
  createdAt: string;
};

export type ItemMock = {
  id: string;
  awid: string;
  listId: string;
  name: string;
  quantity: number;
  status: "open" | "completed";
  createdBy: string;
  completedBy: string | null;
  createdAt: string;
  completedAt: string | null;
};

export type MockDb = {
  shoppingLists: Map<string, ShoppingListMock>;
  items: Map<string, ItemMock>;
  __seeded?: boolean;
};

function nowIso() {
  return new Date().toISOString();
}

const g = globalThis as unknown as { __mockDb?: MockDb };

export const mockDb: MockDb =
  g.__mockDb ??
  (g.__mockDb = {
    shoppingLists: new Map<string, ShoppingListMock>(),
    items: new Map<string, ItemMock>(),
    __seeded: false,
  });

export function ensureSeed() {
  if (mockDb.__seeded) return;

  const listId = randomUUID();
  mockDb.shoppingLists.set(listId, {
    awid: AWID,
    id: listId,
    ownerId: CURRENT_USER_ID,
    name: "BBQ party",
    members: ["6770b0cd123456789000002", "6770b0cd123456789000003"],
    isArchived: false,
    createdAt: nowIso(),
  });

  const itemId = randomUUID();
  mockDb.items.set(itemId, {
    awid: AWID,
    id: itemId,
    listId,
    name: "Milk",
    quantity: 2,
    status: "open",
    createdBy: CURRENT_USER_ID,
    completedBy: null,
    createdAt: nowIso(),
    completedAt: null,
  });

  mockDb.__seeded = true;
}
