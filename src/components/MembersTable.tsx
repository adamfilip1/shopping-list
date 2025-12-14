"use client";

import { useState } from "react";
import { USERS, CURRENT_USER_ID } from "@/lib/data";
import { api } from "@/lib/api-client";

export default function MembersTable({
  listId,
  ownerId,
  memberIds,
  canManage,
  canLeave,
  onChanged,
}: {
  listId: string;
  ownerId: string;
  memberIds: string[];
  canManage: boolean; // owner & !archived
  canLeave: boolean;  // member & !archived
  onChanged: () => void; // parent refresh
}) {
  const [loading, setLoading] = useState(false);

  const options = USERS.filter((u) => !memberIds.includes(u.id));

  const addMember = async (userId: string) => {
    if (!userId || loading) return;
    setLoading(true);
    try {
      await api.shoppingList.addMember({ listId, memberId: userId });
      onChanged();
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (userId: string) => {
    if (!userId || loading) return;
    setLoading(true);
    try {
      await api.shoppingList.removeMember({ listId, memberId: userId });
      onChanged();
    } finally {
      setLoading(false);
    }
  };

  const leaveList = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await api.shoppingList.removeMember({ listId, memberId: CURRENT_USER_ID });
      onChanged();
    } finally {
      setLoading(false);
    }
  };

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
            {memberIds.map((id) => {
              const u = USERS.find((x) => x.id === id);
              if (!u) return null;

              const role = id === ownerId ? "Owner" : "Member";
              const removable = canManage && id !== ownerId;

              return (
                <tr key={id} className="border-t">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{role}</td>
                  <td className="px-4 py-2 text-right">
                    {removable && (
                      <button
                        disabled={loading}
                        onClick={() => removeMember(id)}
                        className="text-red-600 disabled:opacity-50"
                      >
                        Remove
                      </button>
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
          <select
            disabled={loading}
            className="bg-white border rounded-xl px-3 py-2 disabled:opacity-50"
            defaultValue=""
            onChange={(e) => {
              const v = e.target.value;
              if (v) addMember(v);
              e.currentTarget.value = "";
            }}
          >
            <option value="">Add member…</option>
            {options.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        )}

        {canLeave && CURRENT_USER_ID !== ownerId && (
          <button
            disabled={loading}
            onClick={leaveList}
            className="px-3 py-2 rounded-xl border bg-white disabled:opacity-50"
          >
            Leave list
          </button>
        )}
      </div>
    </div>
  );
}
