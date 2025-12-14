import { getDb } from "@/lib/mongo";
import { AWID, CURRENT_USER_ID } from "@/lib/constants";
import { ObjectId } from "mongodb";

type ItemStatus = "open" | "completed";

type ItemDb = {
  awid: string;
  // optional string id for legacy/mock compatibility (Mongo will still have _id)
  id?: string;

  listId: string;
  name: string;
  quantity: number;
  status: ItemStatus;

  createdBy: string;
  completedBy: string | null;

  createdAt: Date;
  completedAt: Date | null;
};

function toIso(d: any): string {
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toISOString();
}

function idFilter(id: string) {
  const idAsObjectId = ObjectId.isValid(id) ? new ObjectId(id) : null;
  return {
    awid: AWID,
    $or: [
      ...(idAsObjectId ? [{ _id: idAsObjectId }] : []),
      { id },
    ],
  } as any;
}

export async function listByListId(input: { listId: string }) {
  const db = await getDb();
  const col = db.collection<ItemDb>("item");

  const docs = await col
    .find({ awid: AWID, listId: input.listId })
    .sort({ createdAt: 1 })
    .toArray();

  return docs.map((d: any) => ({
    awid: d.awid ?? AWID,
    id: d._id?.toString?.() ?? d.id,
    listId: d.listId,
    name: d.name,
    quantity: d.quantity,
    status: d.status as ItemStatus,
    createdBy: d.createdBy,
    completedBy: d.completedBy ?? null,
    createdAt: toIso(d.createdAt),
    completedAt: d.completedAt ? toIso(d.completedAt) : null,
  }));
}

export async function add(input: { listId: string; name: string; quantity: number }) {
  const db = await getDb();
  const col = db.collection<ItemDb>("item");

  const now = new Date();

  const doc: ItemDb = {
    awid: AWID,
    listId: input.listId,
    name: input.name,
    quantity: input.quantity,
    status: "open",
    createdBy: CURRENT_USER_ID,
    completedBy: null,
    createdAt: now,
    completedAt: null,
  };

  const res = await col.insertOne(doc);

  return {
    awid: AWID,
    id: res.insertedId.toString(),
    listId: input.listId,
    name: input.name,
    quantity: input.quantity,
    status: "open" as const,
    createdBy: CURRENT_USER_ID,
    completedBy: null,
    createdAt: now.toISOString(),
    completedAt: null,
  };
}

export async function update(input: { id: string; name: string; quantity: number }) {
  const db = await getDb();
  const col = db.collection<ItemDb>("item");

  const doc = await col.findOneAndUpdate(
    idFilter(input.id),
    { $set: { name: input.name, quantity: input.quantity } },
    { returnDocument: "after" }
  );

  if (!doc) {
    throw new Error("Item not found");
  }

  return {
    awid: doc.awid,
    id: (doc as any)._id?.toString?.() ?? input.id,
    listId: doc.listId,
    name: doc.name,
    quantity: doc.quantity,
    status: doc.status,
    createdBy: doc.createdBy,
    completedBy: doc.completedBy ?? null,
    createdAt: toIso(doc.createdAt),
    completedAt: doc.completedAt ? toIso(doc.completedAt) : null,
  };
}

export async function remove(input: { id: string }) {
  const db = await getDb();
  const col = db.collection<ItemDb>("item");

  const res = await col.findOneAndDelete(idFilter(input.id));
  if (!res) {
    throw new Error("Item not found");
  }

  return {
    awid: AWID,
    id: input.id,
  };
}

export async function markComplete(input: { id: string; completed: boolean }) {
  const db = await getDb();
  const col = db.collection<ItemDb>("item");

  const now = new Date();

  const set: Partial<ItemDb> = input.completed
    ? {
        status: "completed",
        completedBy: CURRENT_USER_ID,
        completedAt: now,
      }
    : {
        status: "open",
        completedBy: null,
        completedAt: null,
      };

  const doc = await col.findOneAndUpdate(
    idFilter(input.id),
    { $set: set },
    { returnDocument: "after" }
  );

  if (!doc) {
    throw new Error("Item not found");
  }

  return {
    awid: doc.awid,
    id: (doc as any)._id?.toString?.() ?? input.id,
    listId: doc.listId,
    name: doc.name,
    quantity: doc.quantity,
    status: doc.status,
    createdBy: doc.createdBy,
    completedBy: doc.completedBy ?? null,
    createdAt: toIso(doc.createdAt),
    completedAt: doc.completedAt ? toIso(doc.completedAt) : null,
    uuAppErrorMap: {},
  };
}
