export default function RoleBadge({ role }: { role: "owner"|"member"|"viewer" }) {
  const map = {
    owner:  "bg-purple-100 text-purple-700",
    member: "bg-blue-100 text-blue-700",
    viewer: "bg-gray-100 text-gray-600",
  } as const;
  return <span className={`text-xs px-2 py-1 rounded ${map[role]}`}>{role}</span>;
}
