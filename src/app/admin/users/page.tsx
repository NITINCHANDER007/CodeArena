"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Trash2,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  isVerified: boolean;
  isBanned: boolean;
  banReason?: string | null;
  createdAt: string;
  _count: {
    submissions: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Ban Modal state
  const [banModalUser, setBanModalUser] = useState<AdminUser | null>(null);
  const [banReasonInput, setBanReasonInput] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleRoleChange = async (userId: string, newRole: "USER" | "ADMIN") => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        alert(data.error || "Failed to update role");
      }
    } catch {
      alert("Error updating role");
    }
  };

  const handleBanToggle = async () => {
    if (!banModalUser) return;
    const willBan = !banModalUser.isBanned;

    try {
      const res = await fetch(`/api/admin/users/${banModalUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isBanned: willBan,
          banReason: willBan ? banReasonInput : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === banModalUser.id
              ? { ...u, isBanned: willBan, banReason: willBan ? banReasonInput : null }
              : u
          )
        );
        setBanModalUser(null);
        setBanReasonInput("");
      } else {
        alert(data.error || "Failed to update ban status");
      }
    } catch {
      alert("Network error");
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to permanently delete user @${username}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch {
      alert("Network error while deleting user");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="pb-4 border-b border-[#243042]">
        <h1 className="text-2xl font-bold text-white tracking-tight">Users Management</h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Manage user accounts, assign roles, ban/unban violators, and view submission volume.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-[#10151d] border border-[#243042] rounded-xl px-4 py-2.5">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by username, full name, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-white text-sm placeholder-gray-500 focus:outline-none w-full"
        />
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[#10151d] border border-[#243042] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#161e2a] text-xs uppercase font-semibold text-gray-400 border-b border-[#243042]">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submissions</th>
                  <th className="py-3.5 px-4">Joined</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#243042]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#161e2a]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                          {u.username.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{u.name}</p>
                          <p className="text-xs text-gray-400">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300 text-xs">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as "USER" | "ADMIN")}
                        className={`text-xs font-bold rounded-lg px-2 py-1 border bg-[#0d1117] ${
                          u.role === "ADMIN"
                            ? "text-rose-400 border-rose-500/40"
                            : "text-gray-300 border-[#243042]"
                        }`}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isBanned ? (
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          Banned
                        </span>
                      ) : u.isVerified ? (
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                          Verified
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-300 font-mono">
                      {u._count.submissions}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setBanModalUser(u);
                            setBanReasonInput(u.banReason || "Violated CodeArena rules");
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.isBanned
                              ? "text-emerald-400 hover:bg-emerald-500/20"
                              : "text-amber-400 hover:bg-amber-500/20"
                          }`}
                          title={u.isBanned ? "Unban User" : "Ban User"}
                        >
                          {u.isBanned ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/30 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ban / Unban Modal */}
      {banModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#10151d] border border-[#243042] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#243042] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                {banModalUser.isBanned ? `Unban @${banModalUser.username}` : `Ban @${banModalUser.username}`}
              </h3>
              <button
                onClick={() => setBanModalUser(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              {banModalUser.isBanned
                ? "This will restore the user's login access and enable submitting code."
                : "This will immediately revoke user sessions and prevent logging into the platform."}
            </p>

            {!banModalUser.isBanned && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Ban Reason (Optional)
                </label>
                <input
                  type="text"
                  value={banReasonInput}
                  onChange={(e) => setBanReasonInput(e.target.value)}
                  placeholder="e.g. Plagiarism or harassment"
                  className="w-full px-3 py-2 bg-[#161e2a] border border-[#243042] rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[#243042]">
              <button
                onClick={() => setBanModalUser(null)}
                className="px-4 py-2 text-xs text-gray-400 hover:text-white bg-[#161e2a] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleBanToggle}
                className={`px-4 py-2 text-xs font-bold rounded-lg ${
                  banModalUser.isBanned
                    ? "bg-emerald-500 text-gray-950 hover:bg-emerald-400"
                    : "bg-rose-600 text-white hover:bg-rose-500"
                }`}
              >
                {banModalUser.isBanned ? "Confirm Unban" : "Confirm Ban"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
