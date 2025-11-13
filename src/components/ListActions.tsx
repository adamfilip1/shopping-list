export default function ListActions({
  isOwner,
  status,
  onArchive,
  onUnarchive,
  onDelete,
}: {
  isOwner: boolean;
  status: "active"|"archived";
  onArchive: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
}) {
  if (!isOwner) return null;
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {status === "active" ? (
        <button onClick={onArchive} className="px-3 py-1.5 rounded-lg border bg-white">Archive</button>
      ) : (
        <button onClick={onUnarchive} className="px-3 py-1.5 rounded-lg border bg-white">Unarchive</button>
      )}
      <button onClick={onDelete} className="px-3 py-1.5 rounded-lg border bg-white">Delete</button>
    </div>
  );
}
