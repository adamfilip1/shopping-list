import { AWID, CURRENT_USER_ID } from "@/lib/constants";
import { randomUUID } from "crypto";
import { mockDb, ensureSeed } from "@/dao/mockDb";

type ItemStatus = "open" | "completed";

export async function listByListId(input: { listId: string }) {
  ensureSeed();

  const items = Array.from(mockDb.items.values()).filter(
    (i) => i.awid === AWID && i.listId === input.listId
  );

  items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return items.map((i) => ({
    awid: i.awid,
    id: i.id,
    listId: i.listId,
    name: i.name,
    quantity: i.quantity,
    status: i.status as ItemStatus,
    createdBy: i.createdBy,
    completedBy: i.completedBy,
    createdAt: i.createdAt,
    completedAt: i.completedAt,
  }));
}

export async function add(input: { listId: string; name: string; quantity: number }) {
  ensureSeed();

  const now = new Date().toISOString();
  const id = randomUUID();

  const item = {
    awid: AWID,
    id,
    listId: input.listId,
    name: input.name,
    quantity: input.quantity,
    status: "open" as const,
    createdBy: CURRENT_USER_ID,
    completedBy: null,
    createdAt: now,
    completedAt: null,
  };

  mockDb.items.set(id, item);
  return item;
}

export async function update(input: { id: string; name: string; quantity: number }) {
  ensureSeed();

  const item = mockDb.items.get(input.id);
  if (!item || item.awid !== AWID) {
    throw new Error("Item not found");
  }

  item.name = input.name;
  item.quantity = input.quantity;

  mockDb.items.set(item.id, item);

  return {
    awid: item.awid,
    id: item.id,
    listId: item.listId,
    name: item.name,
    quantity: item.quantity,
    status: item.status,
    createdBy: item.createdBy,
    completedBy: item.completedBy,
    createdAt: item.createdAt,
    completedAt: item.completedAt,
  };
}

export async function remove(input: { id: string }) {
  ensureSeed();

  const item = mockDb.items.get(input.id);
  if (!item || item.awid !== AWID) {
    throw new Error("Item not found");
  }

  mockDb.items.delete(input.id);

  return {
    awid: AWID,
    id: input.id,
  };
}

export async function markComplete(input: { id: string; completed: boolean }) {
  ensureSeed();

  const item = mockDb.items.get(input.id);
  if (!item || item.awid !== AWID) {
    throw new Error("Item not found");
  }

  const now = new Date().toISOString();

  if (input.completed) {
    item.status = "completed";
    item.completedBy = CURRENT_USER_ID;
    item.completedAt = now;
  } else {
    item.status = "open";
    item.completedBy = null;
    item.completedAt = null;
  }

  mockDb.items.set(item.id, item);

  return {
    awid: item.awid,
    id: item.id,
    listId: item.listId,
    name: item.name,
    quantity: item.quantity,
    status: item.status,
    createdBy: item.createdBy,
    completedBy: item.completedBy,
    createdAt: item.createdAt,
    completedAt: item.completedAt,
    uuAppErrorMap: {},
  };
}
