"use client";

export default function RoleBadge({ role }: { role: "owner"|"member"|"viewer" }) {
  const map = {
    owner:  "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    member: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    viewer: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  } as const;
  return <span className={`text-xs px-2 py-1 rounded ${map[role]}`}>{role}</span>;
}
