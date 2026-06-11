import React, { useState, useEffect } from "react";
import { api } from "../api";
import { Shield, UserPlus, Trash2, Database, Globe, Key, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

export default function AdminSettings() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "admin" });

  const loadUsers = async () => {
    try {
      const data = await fetch("/api/users").then(res => res.json());
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    });
    setNewUser({ username: "", password: "", role: "admin" });
    loadUsers();
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Remove this user's access?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    loadUsers();
  };

  return (
    <div className="space-y-6 text-left font-sans">
      <div className="border-b border-[#E5E1D8] pb-5">
        <h1 className="font-display font-black text-2xl text-[#2D3E50] tracking-tight uppercase flex items-center gap-2">
          <Shield className="h-6 w-6 text-[#C5A059]" />
          System Administration
        </h1>
        <p className="text-xs text-[#636E72] font-semibold mt-1">
          Manage system access roles and monitor backend service integration status.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Management */}
        <div className="bg-white border border-[#E5E1D8] rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#2D3E50] flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-[#C5A059]" />
            Access Control List
          </h3>

          <form onSubmit={handleAddUser} className="grid gap-3 pt-2">
            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={e => setNewUser({...newUser, username: e.target.value})}
              className="h-9 rounded-lg border border-[#E5E1D8] px-3 text-xs outline-none focus:border-[#C5A059]"
              required
            />
            <input
              type="password"
              placeholder="Initial Password"
              value={newUser.password}
              onChange={e => setNewUser({...newUser, password: e.target.value})}
              className="h-9 rounded-lg border border-[#E5E1D8] px-3 text-xs outline-none focus:border-[#C5A059]"
              required
            />
            <button type="submit" className="h-9 bg-[#2D3E50] text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#1e2a36] transition cursor-pointer">
              Create Account
            </button>
          </form>

          <div className="divide-y divide-neutral-50 pt-2">
            {loading ? (
              <p className="text-[10px] text-center py-4">Loading accounts...</p>
            ) : (
              users.map(user => (
                <div key={user.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#2D3E50]">{user.username}</p>
                    <p className="text-[10px] text-neutral-400 font-semibold uppercase">{user.role}</p>
                  </div>
                  <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-neutral-300 hover:text-rose-500 transition cursor-pointer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="space-y-6">
          <div className="bg-[#FDFCF8] border border-[#E5E1D8] rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#2D3E50] flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              Backend Infrastructure
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-500 font-semibold uppercase">Database Engine</span>
                <span className="font-mono font-bold text-[#2D3E50]">SQLite 3.x (Local)</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-500 font-semibold uppercase">Environment</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Development
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-500 font-semibold uppercase">SMS Gateway</span>
                <span className="font-bold text-[#C5A059]">TalkSasa (Active)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#2D3E50] text-[#E5E1D8] rounded-2xl p-5 space-y-4 shadow-md relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <Globe className="h-20 w-20" />
             </div>
             <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <Key className="h-4 w-4 text-[#C5A059]" />
              Configuration Keys
            </h3>
            <div className="space-y-3 relative z-10">
              <div className="space-y-1">
                <span className="text-[9px] text-neutral-400 font-bold uppercase">TalkSasa API Key</span>
                <div className="bg-black/20 p-2 rounded-lg font-mono text-[10px] break-all border border-white/5">
                  ••••••••••••••••••••••••••••••••
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-neutral-400 font-bold uppercase">TalkSasa Sender ID</span>
                <div className="bg-black/20 p-2 rounded-lg font-mono text-[10px] border border-white/5">
                  PROCALL
                </div>
              </div>
              <p className="text-[9px] text-neutral-400 italic pt-2">
                Keys are masked for security. Modify these in your .env file to update gateway behavior.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}