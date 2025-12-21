import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongo";
import { CURRENT_USER_ID, AWID } from "@/lib/constants";

type ShoppingListDb = {
  _id: ObjectId;
  awid: string;
  ownerId: string;
  name: string;
  members: string[];
  isArchived: boolean;
  createdAt: Date;
};

type ListInput = {
  ownedOnly: boolean;
  includeArchived: boolean;
  pageIndex: number;
  pageSize: number;
  name?: string; // substring (case-insensitive)
  memberId?: string; // list contains this member
};

export async function create(input: {
  ownerId: string;
  name: string;
  members: string[];
}) {
  const db = await getDb();
  const col = db.collection<ShoppingListDb>("shoppingList");

  const now = new Date();

  const doc: Omit<ShoppingListDb, "_id"> = {
    awid: AWID,
    ownerId: input.ownerId,
    name: input.name,
    members: input.members,
    isArchived: false,
    createdAt: now,
  };

  const res = await col.insertOne(doc as any);

  return {
    awid: AWID,
    id: res.insertedId.toString(),
    ownerId: input.ownerId,
    name: input.name,
    members: input.members,
    isArchived: false,
    createdAt: now.toISOString(),
  };
}

export async function get(input: { id: string }) {
  const db = await getDb();
  const col = db.collection<ShoppingListDb>("shoppingList");

  let _id: ObjectId;
  try {
    _id = new ObjectId(input.id);
  } catch {
    return null;
  }

  const doc = await col.findOne({ _id, awid: AWID });
  if (!doc) return null;

  return {
    awid: doc.awid,
    id: doc._id.toString(),
    ownerId: doc.ownerId,
    name: doc.name,
    members: doc.members,
    isArchived: doc.isArchived,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function list(input: ListInput) {
  const db = await getDb();
  const col = db.collection<ShoppingListDb>("shoppingList");

  const filter: Record<string, any> = { awid: AWID };

  // ownership filter
  if (input.ownedOnly) {
    filter.ownerId = CURRENT_USER_ID;
  }

  // archived filter
  if (!input.includeArchived) {
    filter.isArchived = false;
  }

  // name filter (case-insensitive substring)
  if (input.name && input.name.trim()) {
    filter.name = { $regex: input.name.trim(), $options: "i" };
  }

  // member filter (member contained in members array)
  if (input.memberId && input.memberId.trim()) {
    filter.members = input.memberId.trim();
  }

  const total = await col.countDocuments(filter);

  const docs = await col
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(input.pageIndex * input.pageSize)
    .limit(input.pageSize)
    .toArray();

  const itemList = docs.map((d) => ({
    awid: d.awid,
    id: d._id.toString(),
    ownerId: d.ownerId,
    name: d.name,
    members: d.members,
    isArchived: d.isArchived,
    createdAt: d.createdAt.toISOString(),
  }));

  return { itemList, total };
}

export async function remove(input: { id: string }): Promise<boolean> {
  const db = await getDb();
  const col = db.collection("shoppingList");

  let _id: ObjectId;
  try {
    _id = new ObjectId(input.id);
  } catch {
    return false;
  }

  const res = await col.deleteOne({ _id, awid: AWID });
  return res.deletedCount === 1;
}

export async function addMember(input: { listId: string; memberId: string }) {
  const db = await getDb();
  const col = db.collection<ShoppingListDb>("shoppingList");

  let _id: ObjectId;
  try {
    _id = new ObjectId(input.listId);
  } catch {
    return null;
  }

  const upd = await col.updateOne(
    { _id, awid: AWID },
    { $addToSet: { members: input.memberId } }
  );

  if (upd.matchedCount === 0) return null;

  const doc = await col.findOne({ _id, awid: AWID });
  if (!doc) return null;

  return {
    awid: doc.awid,
    id: doc._id.toString(),
    ownerId: doc.ownerId,
    name: doc.name,
    members: doc.members,
    isArchived: doc.isArchived,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function removeMember(input: { listId: string; memberId: string }) {
  const db = await getDb();
  const col = db.collection<ShoppingListDb>("shoppingList");

  let _id: ObjectId;
  try {
    _id = new ObjectId(input.listId);
  } catch {
    return null;
  }

  const upd = await col.updateOne(
    { _id, awid: AWID },
    { $pull: { members: input.memberId } }
  );

  if (upd.matchedCount === 0) return null;

  const doc = await col.findOne({ _id, awid: AWID });
  if (!doc) return null;

  return {
    awid: doc.awid,
    id: doc._id.toString(),
    members: doc.members,
  };
}

function makeIdFilter(id: string) {
  const idAsObjectId = ObjectId.isValid(id) ? new ObjectId(id) : null;
  return {
    awid: AWID,
    $or: [...(idAsObjectId ? [{ _id: idAsObjectId }] : []), { id }],
  } as any;
}

function toIso(d: any) {
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toISOString();
}

function mapOut(doc: any) {
  return {
    awid: doc.awid ?? AWID,
    id: doc._id?.toString?.() ?? doc.id,
    ownerId: doc.ownerId,
    name: doc.name,
    members: doc.members ?? [],
    isArchived: !!doc.isArchived,
    createdAt: toIso(doc.createdAt),
  };
}

export async function updateName(input: { id: string; name: string }) {
  const db = await getDb();
  const col = db.collection<ShoppingListDb>("shoppingList");

  const filter = {
    ...makeIdFilter(input.id),
    ownerId: CURRENT_USER_ID, // jen owner
  };

  const res = await col.findOneAndUpdate(
    filter,
    { $set: { name: input.name } },
    { returnDocument: "after" }
  );

  const doc = (res as any)?.value ?? res;
  if (!doc) throw new Error("Shopping list not found");

  return mapOut(doc);
}

export async function updateStatus(input: { id: string; isArchived: boolean }) {
  const db = await getDb();
  const col = db.collection<ShoppingListDb>("shoppingList");

  const filter = {
    ...makeIdFilter(input.id),
    ownerId: CURRENT_USER_ID, // jen owner
  };

  const res = await col.findOneAndUpdate(
    filter,
    { $set: { isArchived: input.isArchived } },
    { returnDocument: "after" }
  );

  const doc = (res as any)?.value ?? res;
  if (!doc) throw new Error("Shopping list not found");

  return mapOut(doc);
}
