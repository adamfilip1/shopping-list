export type Role = "owner" | "member" | "viewer";
export type ShoppingListStatus = "active" | "archived";
export type ItemState = "open" | "done";

export interface User {
  id: string;
  name: string;
  email?: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  state: ItemState;
}

export interface ShoppingList {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];      //Včetně vlastníka - jednodušší kontrola členství
  status: ShoppingListStatus;
  items: ShoppingListItem[];
}
