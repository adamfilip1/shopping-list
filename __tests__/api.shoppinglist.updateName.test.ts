import { setupApiTest, makeReq } from "./testUtils/api";

describe("/api/shoppinglist/updateName", () => {
  beforeEach(async () => {
    await setupApiTest();
  });

  it("happy day: změní name", async () => {
    const { POST: create } = await import("../app/api/shoppinglist/create/route");
    const createdRes = await create(
      await makeReq({ ownerId: "owner-1", name: "Old", members: [] })
    );
    expect(createdRes.status).toBe(200);
    const created = await createdRes.json();

    const { POST: upd } = await import("../app/api/shoppinglist/updateName/route");
    const res = await upd(await makeReq({ id: created.id, name: "New" }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("New");
  });

  it("alternative: neexistující id -> 404/400 (podle tvé implementace)", async () => {
    const { POST } = await import("../app/api/shoppinglist/updateName/route");
    const res = await POST(await makeReq({ id: "non-existing-id", name: "X" }));

    expect([400, 404]).toContain(res.status);
  });
});
