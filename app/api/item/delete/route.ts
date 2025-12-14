import { NextRequest, NextResponse } from "next/server";
import { itemDao } from "@/dao/itemDaoRouter";

export async function POST(req: NextRequest) {
  const dtoIn = await req.json();
  const uuAppErrorMap: any = {};

  const allowedKeys = ["id"];
  const unsupported = Object.keys(dtoIn).filter((k) => !allowedKeys.includes(k));
  if (unsupported.length) {
    uuAppErrorMap.unsupportedKeys = { unsupportedKeyList: unsupported };
  }

  if (!dtoIn.id || typeof dtoIn.id !== "string") {
    return NextResponse.json(
      { code: "invalidDtoIn", message: "DtoIn is not valid.", uuAppErrorMap },
      { status: 400 }
    );
  }

  try {
    const dtoOut = await itemDao.remove({ id: dtoIn.id });
    return NextResponse.json({ ...dtoOut, uuAppErrorMap });
  } catch (e: any) {
    return NextResponse.json(
      { code: "itemNotFound", message: "Item does not exist.", uuAppErrorMap },
      { status: 404 }
    );
  }
}
