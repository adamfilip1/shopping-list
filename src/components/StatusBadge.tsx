export default function StatusBadge({ status }: { status: "active"|"archived" }) {
  return status === "archived"
    ? <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">Archived</span>
    : <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700">Active</span>;
}
