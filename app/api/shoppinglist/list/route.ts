import { NextRequest, NextResponse } from "next/server";
import { buildUnsupportedKeysMap, isObject } from "@/lib/dto";
import { shoppingListDao } from "@/dao/shoppingListDaoRouter";

export async function POST(req: NextRequest) {
  let dtoIn: unknown;

  try {
    dtoIn = await req.json();
  } catch {
    return NextResponse.json(
      { code: "invalidDtoIn", message: "DtoIn is not valid.", uuAppErrorMap: {} },
      { status: 400 }
    );
  }

  if (!isObject(dtoIn)) {
    return NextResponse.json(
      { code: "invalidDtoIn", message: "DtoIn is not valid.", uuAppErrorMap: {} },
      { status: 400 }
    );
  }

  const allowedKeys = ["ownedOnly", "includeArchived"];
  const uuAppErrorMap = buildUnsupportedKeysMap(dtoIn, allowedKeys);

  const ownedOnlyOk = typeof dtoIn.ownedOnly === "boolean";
  const includeArchivedOk = typeof dtoIn.includeArchived === "boolean";

  if (!ownedOnlyOk || !includeArchivedOk) {
    return NextResponse.json(
      { code: "invalidDtoIn", message: "DtoIn is not valid.", uuAppErrorMap },
      { status: 400 }
    );
  }

  try {
    const pageIndex = 0;
    const pageSize = 50;

    const { itemList, total } = await shoppingListDao.list({
      ownedOnly: dtoIn.ownedOnly,
      includeArchived: dtoIn.includeArchived,
      pageIndex,
      pageSize,
    });

    return NextResponse.json(
      {
        awid: itemList[0]?.awid ?? "shoppinglist-main",
        itemList: itemList.map(({ awid, ...rest }) => rest), // dtoOut nemá awid u itemů
        pageInfo: { pageIndex, pageSize, total },
        uuAppErrorMap,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("shoppinglist/list failed:", err);
    return NextResponse.json(
      { code: "internalServerError", message: "Internal server error.", uuAppErrorMap: {} },
      { status: 500 }
    );
  }
}
