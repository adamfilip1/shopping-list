import { setupApiTest, makeReq } from "./testUtils/api";

describe("/api/shoppinglist/create", () => {
  beforeEach(async () => {
    await setupApiTest();
  });

  it("happy day: vytvoří list", async () => {
    const { POST } = await import("../app/api/shoppinglist/create/route");
    const res = await POST(
      await makeReq({ ownerId: "owner-1", name: "Groceries", members: ["owner-1"] })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBeTruthy();
    expect(body.name).toBe("Groceries");
  });

  it("alternative: prázdné name -> 400", async () => {
    const { POST } = await import("../app/api/shoppinglist/create/route");
    const res = await POST(await makeReq({ ownerId: "owner-1", name: "", members: [] }));

    expect(res.status).toBe(400);
  });
});
