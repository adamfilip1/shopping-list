import * as mongoDao from "@/dao/itemDao";
import * as mockDao from "@/dao/itemMockDao";

/**
 * MOCK is default:
 * - undefined -> mock
 * - "true" -> mock
 * - "false" -> mongo
 */
const useMock = process.env.USE_MOCK_DATA !== "false";

export const itemDao = useMock ? mockDao : mongoDao;
