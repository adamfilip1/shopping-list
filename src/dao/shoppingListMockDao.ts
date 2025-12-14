import { randomUUID } from "crypto";
import { AWID, CURRENT_USER_ID } from "@/lib/constants";
import { mockDb, ensureSeed } from "@/dao/mockDb";

export async function create(input: { ownerId: string; name: string; members: string[] }) {
  ensureSeed();

  const id = randomUUID();
  const createdAt = new Date().toISOString();

  const dtoOut = {
    awid: AWID,
    id,
    ownerId: input.ownerId,
    name: input.name,
    members: input.members,
    isArchived: false,
    createdAt,
  };

  mockDb.shoppingLists.set(id, dtoOut);
  return dtoOut;
}

export async function get(input: { id: string }) {
  ensureSeed();
  return mockDb.shoppingLists.get(input.id) ?? null;
}

export async function list(input: {
  ownedOnly: boolean;
  includeArchived: boolean;
  pageIndex: number;
  pageSize: number;
}) {
  ensureSeed();

  let arr = Array.from(mockDb.shoppingLists.values());

  if (input.ownedOnly) {
    arr = arr.filter((l) => l.ownerId === CURRENT_USER_ID);
  }
  if (!input.includeArchived) {
    arr = arr.filter((l) => l.isArchived === false);
  }

  arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const total = arr.length;

  const slice = arr.slice(
    input.pageIndex * input.pageSize,
    input.pageIndex * input.pageSize + input.pageSize
  );

  const itemList = slice.map((l) => ({
    awid: l.awid,
    id: l.id,
    ownerId: l.ownerId,
    name: l.name,
    members: l.members,
    isArchived: l.isArchived,
    createdAt: l.createdAt,
  }));

  return { itemList, total };
}

export async function remove(input: { id: string }): Promise<boolean> {
  ensureSeed();
  return mockDb.shoppingLists.delete(input.id);
}

export async function addMember(input: { listId: string; memberId: string }) {
  ensureSeed();

  const list = mockDb.shoppingLists.get(input.listId);
  if (!list) return null;

  if (!list.members.includes(input.memberId)) {
    list.members = [...list.members, input.memberId];
    mockDb.shoppingLists.set(list.id, list);
  }

  return list;
}

export async function removeMember(input: { listId: string; memberId: string }) {
  ensureSeed();

  const list = mockDb.shoppingLists.get(input.listId);
  if (!list) return null;

  list.members = list.members.filter((m) => m !== input.memberId);
  mockDb.shoppingLists.set(list.id, list);

  return {
    awid: list.awid,
    id: list.id,
    members: list.members,
  };
}

export async function updateName(input: { id: string; name: string }) {
  const list = mockDb.shoppingLists.get(input.id);
  if (!list) throw new Error("Shopping list not found");
  if (list.ownerId !== CURRENT_USER_ID) throw new Error("Not owner");

  list.name = input.name;
  mockDb.shoppingLists.set(list.id, list);
  return list;
}

export async function updateStatus(input: { id: string; isArchived: boolean }) {
  const list = mockDb.shoppingLists.get(input.id);
  if (!list) throw new Error("Shopping list not found");
  if (list.ownerId !== CURRENT_USER_ID) throw new Error("Not owner");

  list.isArchived = input.isArchived;
  mockDb.shoppingLists.set(list.id, list);
  return list;
}
