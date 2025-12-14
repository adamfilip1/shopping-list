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

  const allowedKeys = ["listId", "memberId"];
  const uuAppErrorMap = buildUnsupportedKeysMap(dtoIn, allowedKeys);

  const listIdOk = typeof dtoIn.listId === "string" && dtoIn.listId.trim().length > 0;
  const memberIdOk = typeof dtoIn.memberId === "string" && dtoIn.memberId.trim().length > 0;

  if (!listIdOk || !memberIdOk) {
    return NextResponse.json(
      { code: "invalidDtoIn", message: "DtoIn is not valid.", uuAppErrorMap },
      { status: 400 }
    );
  }

  try {
    const dtoOut = await shoppingListDao.addMember({
      listId: dtoIn.listId.trim(),
      memberId: dtoIn.memberId.trim(),
    });

    if (!dtoOut) {
      return NextResponse.json(
        { code: "shoppingListNotFound", message: "Shopping list does not exist.", uuAppErrorMap },
        { status: 400 }
      );
    }

    return NextResponse.json({ ...dtoOut, uuAppErrorMap }, { status: 200 });
  } catch (err) {
    console.error("shoppinglist/addMember failed:", err);
    return NextResponse.json(
      { code: "internalServerError", message: "Internal server error.", uuAppErrorMap: {} },
      { status: 500 }
    );
  }
}
