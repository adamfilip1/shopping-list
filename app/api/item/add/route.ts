import { NextRequest, NextResponse } from "next/server";
import { itemDao } from "@/dao/itemDaoRouter";

export async function POST(req: NextRequest) {
  const dtoIn = await req.json();
  const uuAppErrorMap: any = {};

  const allowedKeys = ["listId", "name", "quantity"];
  const unsupported = Object.keys(dtoIn).filter((k) => !allowedKeys.includes(k));
  if (unsupported.length) {
    uuAppErrorMap.unsupportedKeys = { unsupportedKeyList: unsupported };
  }

  if (!dtoIn.listId || typeof dtoIn.listId !== "string") {
    return NextResponse.json(
      { code: "invalidDtoIn", message: "DtoIn is not valid.", uuAppErrorMap },
      { status: 400 }
    );
  }
  if (!dtoIn.name || typeof dtoIn.name !== "string") {
    return NextResponse.json(
      { code: "invalidDtoIn", message: "DtoIn is not valid.", uuAppErrorMap },
      { status: 400 }
    );
  }
  if (typeof dtoIn.quantity !== "number" || dtoIn.quantity <= 0) {
    return NextResponse.json(
      { code: "invalidDtoIn", message: "DtoIn is not valid.", uuAppErrorMap },
      { status: 400 }
    );
  }

  const dtoOut = await itemDao.add({
    listId: dtoIn.listId,
    name: dtoIn.name,
    quantity: dtoIn.quantity,
  });

  return NextResponse.json({
    ...dtoOut,
    uuAppErrorMap,
  });
}
