export function mockNextResponseJson() {
  jest.doMock("next/server", () => {
    return {
      NextResponse: {
        json: (body: any, init?: { status?: number }) => {
          return {
            status: init?.status ?? 200,
            json: async () => body,
          };
        },
      },
    };
  });
}

export async function setupApiTest() {
  process.env.USE_MOCK_DATA = "true";

  jest.resetModules();

  mockNextResponseJson();

  const { resetMockDb } = await import("@/dao/mockDb");
  resetMockDb();
}

export async function makeReq(body: any) {
  return {
    json: async () => body,
  } as any;
}
