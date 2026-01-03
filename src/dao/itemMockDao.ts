import { AWID, CURRENT_USER_ID } from "@/lib/constants";
import { randomUUID } from "crypto";
import { mockDb } from "@/dao/mockDb";

type ItemStatus = "open" | "done";

export async function listByListId(input: { listId: string }) {
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
    completedBy: null as string | null,
    createdAt: now,
    completedAt: null as string | null,
  };

  mockDb.items.set(id, item);
  return item;
}

export async function update(input: { id: string; name: string; quantity: number }) {
  const item = mockDb.items.get(input.id);
  if (!item || item.awid !== AWID) {
    throw new Error("Item not found");
  }

  const updated = {
    ...item,
    name: input.name,
    quantity: input.quantity,
  };

  mockDb.items.set(updated.id, updated);

  return {
    awid: updated.awid,
    id: updated.id,
    listId: updated.listId,
    name: updated.name,
    quantity: updated.quantity,
    status: updated.status as ItemStatus,
    createdBy: updated.createdBy,
    completedBy: updated.completedBy,
    createdAt: updated.createdAt,
    completedAt: updated.completedAt,
  };
}

export async function remove(input: { id: string }) {
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
  const item = mockDb.items.get(input.id);
  if (!item || item.awid !== AWID) {
    throw new Error("Item not found");
  }

  const now = new Date().toISOString();

  const updated = input.completed
    ? {
        ...item,
        status: "done" as const,
        completedBy: CURRENT_USER_ID,
        completedAt: now,
      }
    : {
        ...item,
        status: "open" as const,
        completedBy: null,
        completedAt: null,
      };

  mockDb.items.set(updated.id, updated);

  return {
    awid: updated.awid,
    id: updated.id,
    listId: updated.listId,
    name: updated.name,
    quantity: updated.quantity,
    status: updated.status as ItemStatus,
    createdBy: updated.createdBy,
    completedBy: updated.completedBy,
    createdAt: updated.createdAt,
    completedAt: updated.completedAt,
    uuAppErrorMap: {},
  };
}
