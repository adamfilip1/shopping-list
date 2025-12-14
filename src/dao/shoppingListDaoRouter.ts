import * as mongoDao from "@/dao/shoppingListDao";
import * as mockDao from "@/dao/shoppingListMockDao";

/**
 * MOCK is default:
 * - undefined -> mock
 * - "true" -> mock
 * - "false" -> mongo
 */
const useMock = process.env.USE_MOCK_DATA !== "false";

export const shoppingListDao = useMock ? mockDao : mongoDao;
