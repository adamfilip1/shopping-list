import { setupApiTest, makeReq } from "./testUtils/api";

describe("/api/shoppinglist/delete", () => {
  beforeEach(async () => {
    await setupApiTest();
  });

  it("happy day: smaže existující list", async () => {
    const { POST: create } = await import("../app/api/shoppinglist/create/route");
    const createdRes = await create(
      await makeReq({ ownerId: "owner-1", name: "Temp", members: [] })
    );
    expect(createdRes.status).toBe(200);
    const created = await createdRes.json();

    const { POST: del } = await import("../app/api/shoppinglist/delete/route");
    const res = await del(await makeReq({ id: created.id }));

    // u tebe to má být ok scénář – předtím to bylo 400 kvůli jiné instanci DB
    expect(res.status).toBe(200);
  });

  it("alternative: neexistující id -> 400 (u tebe)", async () => {
    const { POST } = await import("../app/api/shoppinglist/delete/route");
    const res = await POST(await makeReq({ id: "non-existing-id" }));

    expect(res.status).toBe(400);
  });
});
