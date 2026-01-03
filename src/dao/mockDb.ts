import { randomUUID } from "crypto";

/**
 * simple in-memory databáze pro MOCK DAO
 * Používá se v unit testech a při USE_MOCK_DATA !== "false"
 */

export const AWID = "mock-awid";
export const CURRENT_USER_ID = "6770b0cd123456789000001";

export type ShoppingListRecord = {
  awid: string;
  id: string;
  ownerId: string;
  name: string;
  members: string[];
  isArchived: boolean;
  createdAt: string;
};

export type ShoppingListItemRecord = {
  awid: string;
  id: string;
  listId: string;
  name: string;
  quantity: number;
  status: "open" | "done";
  createdBy: string;
  completedBy: string | null;
  createdAt: string;
  completedAt: string | null;
};

/**
 * Vlastní "DB"
 */
export const mockDb = {
  shoppingLists: new Map<string, ShoppingListRecord>(),
  items: new Map<string, ShoppingListItemRecord>(),
};

/**
 * Pomocná funkce – ISO timestamp
 */
function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Seedne DB výchozími daty
 * - používá se při startu aplikace
 * - používá se v testech po resetu
 */
export function seedMockDb() {
  const listId = randomUUID();

  mockDb.shoppingLists.set(listId, {
    awid: AWID,
    id: listId,
    ownerId: CURRENT_USER_ID,
    name: "BBQ party",
    members: [
      CURRENT_USER_ID,
      "6770b0cd123456789000002",
      "6770b0cd123456789000003",
    ],
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

  return {
    listId,
    itemId,
  };
}

/**
 * RESET databáze – KLÍČOVÉ PRO UNIT TESTY
 * - vyčistí DB
 * - znovu seedne výchozí data
 */
export function resetMockDb() {
  mockDb.shoppingLists.clear();
  mockDb.items.clear();
  return seedMockDb();
}

/**
 * Zachová původní chování aplikace:
 * při importu souboru se DB automaticky seedne
 */
seedMockDb();
