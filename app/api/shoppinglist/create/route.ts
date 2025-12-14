import { NextRequest, NextResponse } from "next/server";
import { CURRENT_USER_ID } from "@/lib/constants";
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

    const allowedKeys = ["name", "members"];
    const uuAppErrorMap = buildUnsupportedKeysMap(dtoIn, allowedKeys);

    const nameOk = typeof dtoIn.name === "string" && dtoIn.name.trim().length > 0;

    const membersArr = Array.isArray(dtoIn.members) ? dtoIn.members : [];
    const membersOk = membersArr.every(
      (x: unknown) => typeof x === "string" && x.trim().length > 0
    );

    if (!nameOk || !membersOk) {
      return NextResponse.json(
        { code: "invalidDtoIn", message: "DtoIn is not valid.", uuAppErrorMap },
        { status: 400 }
      );
    }

    const cleanedMembers = Array.from(
      new Set(
        membersArr
          .map((m: any) => String(m).trim())
          .filter((m: string) => m.length > 0)
      )
    );

    // owner musí být vždy člen
    const membersWithOwner = Array.from(
      new Set([CURRENT_USER_ID, ...cleanedMembers])
    );

    const dtoOut = await shoppingListDao.create({
      ownerId: CURRENT_USER_ID,
      name: (dtoIn.name as string).trim(),
      members: membersWithOwner,
    });

    return NextResponse.json({ ...dtoOut, uuAppErrorMap }, { status: 200 });
  } catch (err) {
    console.error("shoppinglist/create failed:", err);
    return NextResponse.json(
      {
        code: "internalServerError",
        message: "Internal server error.",
        uuAppErrorMap: {},
      },
      { status: 500 }
    );
  }
}
