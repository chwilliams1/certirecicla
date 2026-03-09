"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Users, Plus, Trash2, Shield, Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS } from "@/lib/roles";
import { getPlanConfig } from "@/lib/plans";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const ROLE_BADGE_STYLES: Record<string, string> = {
  admin: "bg-sage-100 text-sage-700 border-sage-300",
  operator: "bg-blue-50 text-blue-700 border-blue-200",
  viewer: "bg-sand-100 text-sand-700 border-sand-300",
};

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [companyPlan, setCompanyPlan] = useState<string>("trial");

  // New user form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("operator");

  const planConfig = getPlanConfig(companyPlan);
  const maxUsers = planConfig.maxUsers;
  const atLimit = maxUsers !== -1 && users.length >= maxUsers;

  useEffect(() => {
    fetchUsers();
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => { if (d?.plan) setCompanyPlan(d.plan); })
      .catch(() => {});
  }, []);

  async function fetchUsers() {
    const res = await fetch("/api/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
      }),
    });

    if (res.ok) {
      const user = await res.json();
      setUsers((prev) => [...prev, user]);
      setDialogOpen(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("operator");
    } else {
      const data = await res.json();
      setError(data.error || "Error al crear usuario");
    }

    setCreating(false);
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setEditingId(userId);
    const res = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });

    if (res.ok) {
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    }
    setEditingId(null);
  }

  async function handleDelete(userId: string) {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) return;

    setDeletingId(userId);
    const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });

    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
    setDeletingId(null);
  }

  if (session?.user?.role !== "admin") {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-sage-300 mx-auto mb-3" />
        <p className="text-sm text-sage-600">No tienes permisos para ver esta pagina.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl page-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-sage-800">Usuarios</h1>
          <p className="text-sm text-sage-800/40">
            Gestiona el equipo de tu empresa
            {!loading && (
              <span className="ml-2 font-medium">
                ({users.length}/{maxUsers === -1 ? "∞" : maxUsers})
              </span>
            )}
          </p>
        </div>

        {atLimit ? (
          <div className="text-right">
            <Button disabled>
              <Plus className="h-4 w-4 mr-1" /> Nuevo usuario
            </Button>
            <p className="text-xs text-amber-600 mt-1">
              Limite alcanzado. Actualiza tu plan.
            </p>
          </div>
        ) : (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1" /> Nuevo usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif text-sage-800">
                Agregar usuario
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">Nombre</Label>
                <Input
                  id="new-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nombre completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="usuario@empresa.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Contrasena</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-role">Rol</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="operator">Operador</SelectItem>
                    <SelectItem value="viewer">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-sage-800/40">
                  {newRole === "admin" && "Acceso completo: usuarios, configuracion, clientes, retiros y certificados."}
                  {newRole === "operator" && "Puede gestionar clientes, retiros y certificados. Sin acceso a configuracion ni usuarios."}
                  {newRole === "viewer" && "Solo lectura: puede ver dashboard, clientes, retiros y certificados."}
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Plus className="h-4 w-4 mr-1" />
                )}
                Crear usuario
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-sand-50 border border-sand-300 rounded-[14px] p-6"
            >
              <div className="skeleton h-5 w-48 rounded mb-2" />
              <div className="skeleton h-4 w-32 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => {
            const isSelf = user.id === session?.user?.id;
            const roleLabel =
              ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role;
            const badgeStyle = ROLE_BADGE_STYLES[user.role] || "";

            return (
              <div
                key={user.id}
                className="bg-sand-50 border border-sand-300 rounded-[14px] p-5 flex items-center gap-4"
              >
                <div className="h-10 w-10 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-sage-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sage-800 truncate">
                      {user.name}
                    </p>
                    {isSelf && (
                      <span className="text-xs text-sage-800/40">(Tu)</span>
                    )}
                  </div>
                  <p className="text-xs text-sage-800/40">{user.email}</p>
                </div>

                <div className="flex items-center gap-2">
                  {isSelf ? (
                    <Badge
                      variant="outline"
                      className={`text-xs ${badgeStyle}`}
                    >
                      {roleLabel}
                    </Badge>
                  ) : (
                    <Select
                      value={user.role}
                      onValueChange={(val) => handleRoleChange(user.id, val)}
                      disabled={editingId === user.id}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="operator">Operador</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  {!isSelf && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(user.id)}
                      disabled={deletingId === user.id}
                    >
                      {deletingId === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-sage-300 mx-auto mb-3" />
              <p className="text-sm text-sage-600">
                No hay usuarios registrados.
              </p>
              <p className="text-xs text-sage-800/40 mt-1">
                Agrega el primer miembro de tu equipo.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
