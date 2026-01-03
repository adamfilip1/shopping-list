import { randomUUID } from "crypto";
import { AWID, CURRENT_USER_ID } from "@/lib/constants";
import { mockDb } from "@/dao/mockDb";

type ShoppingListDto = {
  awid: string;
  id: string;
  ownerId: string;
  name: string;
  members: string[];
  isArchived: boolean;
  createdAt: string;
};

export async function create(input: {
  ownerId: string;
  name: string;
  members: string[];
}): Promise<ShoppingListDto> {
  const id = randomUUID();
  const createdAt = new Date().toISOString();

  const dtoOut: ShoppingListDto = {
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

export async function get(input: { id: string }): Promise<ShoppingListDto | null> {
  return mockDb.shoppingLists.get(input.id) ?? null;
}

export async function list(input: {
  ownedOnly: boolean;
  includeArchived: boolean;
  pageIndex: number;
  pageSize: number;
}): Promise<{ itemList: ShoppingListDto[]; total: number }> {
  let arr = Array.from(mockDb.shoppingLists.values());

  if (input.ownedOnly) {
    arr = arr.filter((l) => l.ownerId === CURRENT_USER_ID);
  }
  if (!input.includeArchived) {
    arr = arr.filter((l) => l.isArchived === false);
  }

  arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const total = arr.length;

  const start = input.pageIndex * input.pageSize;
  const end = start + input.pageSize;
  const itemList = arr.slice(start, end).map((l) => ({
    awid: l.awid,
    id: l.id,
    ownerId: l.ownerId,
    name: l.name,
    members: [...l.members],
    isArchived: l.isArchived,
    createdAt: l.createdAt,
  }));

  return { itemList, total };
}

export async function remove(input: { id: string }): Promise<boolean> {
  return mockDb.shoppingLists.delete(input.id);
}

export async function addMember(input: {
  listId: string;
  memberId: string;
}): Promise<ShoppingListDto | null> {
  const list = mockDb.shoppingLists.get(input.listId);
  if (!list) return null;

  if (!list.members.includes(input.memberId)) {
    const updated: ShoppingListDto = {
      ...list,
      members: [...list.members, input.memberId],
    };
    mockDb.shoppingLists.set(updated.id, updated);
    return updated;
  }

  return list;
}

export async function removeMember(input: {
  listId: string;
  memberId: string;
}): Promise<{ awid: string; id: string; members: string[] } | null> {
  const list = mockDb.shoppingLists.get(input.listId);
  if (!list) return null;

  const updated: ShoppingListDto = {
    ...list,
    members: list.members.filter((m) => m !== input.memberId),
  };

  mockDb.shoppingLists.set(updated.id, updated);

  return {
    awid: updated.awid,
    id: updated.id,
    members: [...updated.members],
  };
}

export async function updateName(input: { id: string; name: string }): Promise<ShoppingListDto> {
  const list = mockDb.shoppingLists.get(input.id);
  if (!list) throw new Error("Shopping list not found");
  if (list.ownerId !== CURRENT_USER_ID) throw new Error("Not owner");

  const updated: ShoppingListDto = { ...list, name: input.name };
  mockDb.shoppingLists.set(updated.id, updated);
  return updated;
}

export async function updateStatus(input: {
  id: string;
  isArchived: boolean;
}): Promise<ShoppingListDto> {
  const list = mockDb.shoppingLists.get(input.id);
  if (!list) throw new Error("Shopping list not found");
  if (list.ownerId !== CURRENT_USER_ID) throw new Error("Not owner");

  const updated: ShoppingListDto = { ...list, isArchived: input.isArchived };
  mockDb.shoppingLists.set(updated.id, updated);
  return updated;
}
