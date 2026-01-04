import { setupApiTest, makeReq } from "./testUtils/api";

describe("/api/shoppinglist/get", () => {
  beforeEach(async () => {
    await setupApiTest();
  });

  it("happy day: vrátí list podle id", async () => {
    const { POST: create } = await import("../app/api/shoppinglist/create/route");
    const createdRes = await create(
      await makeReq({ ownerId: "owner-1", name: "My list", members: ["owner-1"] })
    );
    expect(createdRes.status).toBe(200);
    const created = await createdRes.json();

    const { POST: get } = await import("../app/api/shoppinglist/get/route");
    const res = await get(await makeReq({ id: created.id }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).not.toBeNull();
    expect(body.id).toBe(created.id);
  });

  it("alternative: neexistující id -> 404 (u tebe)", async () => {
    const { POST } = await import("../app/api/shoppinglist/get/route");
    const res = await POST(await makeReq({ id: "non-existing-id" }));

    expect(res.status).toBe(404);
  });
});
