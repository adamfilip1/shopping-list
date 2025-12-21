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

  const allowedKeys = ["ownedOnly", "includeArchived", "name", "memberId", "pageInfo"];
  const uuAppErrorMap = buildUnsupportedKeysMap(dtoIn, allowedKeys);

  // defaults
  const ownedOnly = dtoIn.ownedOnly ?? false;
  const includeArchived = dtoIn.includeArchived ?? false;

  // optional filters
  const name = dtoIn.name;
  const memberId = dtoIn.memberId;

  // pagination defaults
  const pageInfoIn = isObject(dtoIn.pageInfo) ? dtoIn.pageInfo : undefined;
  const pageIndex = pageInfoIn?.pageIndex ?? 0;
  const pageSizeRaw = pageInfoIn?.pageSize ?? 50;
  const pageSize = Math.min(pageSizeRaw, 200);

  // validation
  const ownedOnlyOk = typeof ownedOnly === "boolean";
  const includeArchivedOk = typeof includeArchived === "boolean";

  const nameOk = name === undefined || (typeof name === "string" && name.trim().length > 0);
  const memberIdOk = memberId === undefined || (typeof memberId === "string" && memberId.trim().length > 0);

  const pageIndexOk = Number.isInteger(pageIndex) && pageIndex >= 0;
  const pageSizeOk = Number.isInteger(pageSizeRaw) && pageSizeRaw >= 1 && pageSizeRaw <= 200;

  const pageInfoTypeOk = dtoIn.pageInfo === undefined || isObject(dtoIn.pageInfo);

  if (
    !ownedOnlyOk ||
    !includeArchivedOk ||
    !nameOk ||
    !memberIdOk ||
    !pageInfoTypeOk ||
    !pageIndexOk ||
    !pageSizeOk
  ) {
    return NextResponse.json(
      { code: "invalidDtoIn", message: "DtoIn is not valid.", uuAppErrorMap },
      { status: 400 }
    );
  }

  try {
    const { itemList, total } = await shoppingListDao.list({
      ownedOnly,
      includeArchived,
      name: name?.trim(),
      memberId: memberId?.trim(),
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
