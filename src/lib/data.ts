import { ShoppingList } from "./types";

export const CURRENT_USER_ID = "u-2"; // Adam

export const USERS = [
  { id: "u-1", name: "Anna" },
  { id: "u-2", name: "Adam" },
  { id: "u-3", name: "Lukáš" },
  { id: "u-4", name: "Karol" },
  { id: "u-5", name: "Eva" },
  { id: "u-6", name: "Tomáš" },
];

export const INITIAL_LISTS: ShoppingList[] = [
  {
    id: "list-1",
    name: "BBQ party",
    ownerId: "u-2", // Adam (current user) = owner
    memberIds: ["u-3", "u-4", "u-5"],
    status: "active",
    items: [
      { id: "i-b-1", name: "Beef steaks", quantity: 6, state: "open" },
      { id: "i-b-2", name: "Chicken wings", quantity: 24, state: "done" },
      { id: "i-b-3", name: "BBQ sauce", quantity: 2, state: "open" },
      { id: "i-b-4", name: "Corn", quantity: 8, state: "open" },
      { id: "i-b-5", name: "Charcoal", quantity: 2, state: "done" },
      { id: "i-b-6", name: "Buns", quantity: 12, state: "open" },
    ],
  },
  {
    id: "list-2",
    name: "Groceries",
    ownerId: "u-1", // Anna = owner
    memberIds: ["u-3", "u-4", "u-6"], // Adam (u-2) NENÍ člen ale viewer
    status: "archived",
    items: [
      { id: "i-g-1", name: "Milk 1L", quantity: 4, state: "open" },
      { id: "i-g-2", name: "Yoghurt Greek", quantity: 6, state: "done" },
      { id: "i-g-3", name: "Butter", quantity: 2, state: "open" },
    ],
  },
];
