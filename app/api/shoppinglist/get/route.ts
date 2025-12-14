import { NextRequest, NextResponse } from "next/server";
import { buildUnsupportedKeysMap, isObject } from "@/lib/dto";
import { shoppingListDao } from "@/dao/shoppingListDaoRouter";
import { itemDao } from "@/dao/itemDaoRouter";

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

  const allowedKeys = ["id"];
  const uuAppErrorMap = buildUnsupportedKeysMap(dtoIn, allowedKeys);

  const idOk = typeof dtoIn.id === "string" && dtoIn.id.trim().length > 0;
  if (!idOk) {
    return NextResponse.json(
      { code: "invalidDtoIn", message: "DtoIn is not valid.", uuAppErrorMap },
      { status: 400 }
    );
  }

  try {
    const list = await shoppingListDao.get({ id: dtoIn.id.trim() });

    if (!list) {
      return NextResponse.json(
        {
          code: "shoppingListNotFound",
          message: "Shopping list does not exist.",
          uuAppErrorMap,
        },
        { status: 404 }
      );
    }

    const items = await itemDao.listByListId({ listId: list.id });

    return NextResponse.json(
      {
        ...list,
        items,
        uuAppErrorMap,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("shoppinglist/get failed:", err);
    return NextResponse.json(
      { code: "internalServerError", message: "Internal server error.", uuAppErrorMap: {} },
      { status: 500 }
    );
  }
}
