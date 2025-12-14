import { NextRequest, NextResponse } from "next/server";
import { buildUnsupportedKeysMap, isObject } from "@/lib/dto";
import { shoppingListDao } from "@/dao/shoppingListDaoRouter";

export async function POST(req: NextRequest) {
  let dtoIn: unknown;

  try {
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

    const allowedKeys = ["id", "name"];
    const uuAppErrorMap = buildUnsupportedKeysMap(dtoIn, allowedKeys);

    const idOk = typeof dtoIn.id === "string" && dtoIn.id.trim().length > 0;
    const nameOk = typeof dtoIn.name === "string" && dtoIn.name.trim().length > 0;

    if (!idOk || !nameOk) {
      return NextResponse.json(
        { code: "invalidDtoIn", message: "DtoIn is not valid.", uuAppErrorMap },
        { status: 400 }
      );
    }

    try {
      const dtoOut = await shoppingListDao.updateName({
        id: dtoIn.id.trim(),
        name: dtoIn.name.trim(),
      });

      return NextResponse.json({ ...dtoOut, uuAppErrorMap }, { status: 200 });
    } catch (e: any) {
      return NextResponse.json(
        { code: "shoppingListNotFound", message: "Shopping list does not exist.", uuAppErrorMap },
        { status: 404 }
      );
    }
  } catch (err) {
    console.error("shoppinglist/updateName failed:", err);
    return NextResponse.json(
      { code: "internalServerError", message: "Internal server error.", uuAppErrorMap: {} },
      { status: 500 }
    );
  }
}
