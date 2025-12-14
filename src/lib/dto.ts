export type UuAppErrorMap = Record<string, any>;

export function isObject(x: unknown): x is Record<string, any> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

export function buildUnsupportedKeysMap(dtoIn: Record<string, any>, allowedKeys: string[]) {
  const uuAppErrorMap: UuAppErrorMap = {};
  const unsupportedKeyList = Object.keys(dtoIn).filter((k) => !allowedKeys.includes(k));

  if (unsupportedKeyList.length > 0) {
    uuAppErrorMap.unsupportedKeys = { unsupportedKeyList };
  }

  return uuAppErrorMap;
}
