type Json = Record<string, any>;

async function post<T>(path: string, body: Json): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });


  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`API ${path} failed (${res.status}): ${text.slice(0, 120)}`);
  }

  if (!res.ok) {
    throw new Error(data?.message ?? data?.code ?? `Request failed (${res.status})`);
  }

  return data as T;
}

export const api = {
  shoppingList: {
    create: (dtoIn: { name: string; members: string[] }) =>
      post("/api/shoppinglist/create", dtoIn),

    get: (dtoIn: { id: string }) =>
      post("/api/shoppinglist/get", dtoIn),

    list: (dtoIn: { ownedOnly: boolean; includeArchived: boolean; pageIndex: number; pageSize: number }) =>
      post("/api/shoppinglist/list", dtoIn),

    delete: (dtoIn: { id: string }) =>
      post("/api/shoppinglist/delete", dtoIn),

    addMember: (dtoIn: { listId: string; memberId: string }) =>
      post("/api/shoppinglist/addMember", dtoIn),

    removeMember: (dtoIn: { listId: string; memberId: string }) =>
      post("/api/shoppinglist/removeMember", dtoIn),
    
    updateName: (dtoIn: { id: string; name: string }) =>
      post("/api/shoppinglist/updateName", dtoIn),

    updateStatus: (dtoIn: { id: string; isArchived: boolean }) =>
      post("/api/shoppinglist/updateStatus", dtoIn),

  },

  item: {
    add: (dtoIn: { listId: string; name: string; quantity: number }) =>
      post("/api/item/add", dtoIn),

    update: (dtoIn: { id: string; name: string; quantity: number }) =>
      post("/api/item/update", dtoIn),

    delete: (dtoIn: { id: string }) =>
      post("/api/item/delete", dtoIn),

    markComplete: (dtoIn: { id: string; completed: boolean }) =>
      post("/api/item/markComplete", dtoIn),
  },
};
