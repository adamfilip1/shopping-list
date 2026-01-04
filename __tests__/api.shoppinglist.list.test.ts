import { setupApiTest, makeReq } from "./testUtils/api";

describe("/api/shoppinglist/list", () => {
  beforeEach(async () => {
    await setupApiTest();
  });

  it("happy day: vrátí itemList + total/pageInfo.total", async () => {
    const { POST } = await import("../app/api/shoppinglist/list/route");
    const res = await POST(await makeReq({ pageIndex: 0, pageSize: 10 }));

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(Array.isArray(body.itemList)).toBe(true);

    const total =
      typeof body.total === "number"
        ? body.total
        : typeof body.pageInfo?.total === "number"
          ? body.pageInfo.total
          : undefined;

    expect(typeof total).toBe("number");
  });

  it("alternative: pageIndex moc velký -> itemList prázdný (nebo aspoň array)", async () => {
    const { POST } = await import("../app/api/shoppinglist/list/route");
    const res = await POST(await makeReq({ pageIndex: 999, pageSize: 10 }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.itemList)).toBe(true);
  });
});
