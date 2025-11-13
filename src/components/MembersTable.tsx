import { USERS, CURRENT_USER_ID } from "@/lib/data";

export default function MembersTable({
  ownerId, memberIds, canManage, canLeave, onAdd, onRemove, onLeave,
}: {
  ownerId: string;
  memberIds: string[];
  canManage: boolean;                // owner & !archived
  canLeave: boolean;                 // member & !archived
  onAdd: (userId:string)=>void;
  onRemove: (userId:string)=>void;   // only non-owner
  onLeave: ()=>void;
}) {
  const options = USERS.filter(u => !memberIds.includes(u.id));

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {memberIds.map(id => {
              const u = USERS.find(x=>x.id===id);
              if (!u) return null;
              const role = id === ownerId ? "Owner" : "Member";
              const removable = canManage && id !== ownerId;
              return (
                <tr key={id} className="border-t">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{role}</td>
                  <td className="px-4 py-2 text-right">
                    {removable && (
                      <button onClick={()=>onRemove(id)} className="text-red-600">Remove</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2">
        {canManage && (
          <>
            <select className="bg-white border rounded-xl px-3 py-2" defaultValue=""
                    onChange={e => e.target.value && onAdd(e.target.value)}>
              <option value="">Add member…</option>
              {options.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </>
        )}
        {canLeave && CURRENT_USER_ID !== ownerId && (
          <button onClick={onLeave} className="px-3 py-2 rounded-xl border bg-white">
            Leave list
          </button>
        )}
      </div>
    </div>
  );
}
