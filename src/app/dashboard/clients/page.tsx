"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Users, Upload, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PermissionGate } from "@/components/permission-gate";

interface Client {
  id: string;
  name: string;
  rut: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  contactName: string | null;
  parentClientId: string | null;
  parentClient?: { id: string; name: string } | null;
  branches?: Client[];
  pickupCount: number;
  _count: { records: number; certificates: number };
}

function getMissingFields(c: Client): string[] {
  const missing: string[] = [];
  if (!c.email) missing.push("email");
  if (!c.rut) missing.push("RUT");
  return missing;
}

function hasIncompleteData(c: Client): boolean {
  return !c.email || !c.rut;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    const res = await fetch("/api/clients");
    const data = await res.json();
    setClients(data);
    setLoading(false);
  }

  const matchesSearch = (c: Client) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.rut?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase());

  // Build parent-child grouping: top-level clients with their branches
  const topLevelClients = clients.filter((c) => !c.parentClientId);
  const branchesByParent = clients.reduce<Record<string, Client[]>>((acc, c) => {
    if (c.parentClientId) {
      if (!acc[c.parentClientId]) acc[c.parentClientId] = [];
      acc[c.parentClientId].push(c);
    }
    return acc;
  }, {});

  // Attach branches to their parents
  const groupedClients = topLevelClients.map((parent) => ({
    ...parent,
    branches: branchesByParent[parent.id] || parent.branches || [],
  }));

  // Count clients with incomplete critical data (across all clients, including branches)
  const incompleteClients = clients.filter((c) => hasIncompleteData(c));
  const incompleteCount = incompleteClients.length;

  // Filter: show parent if it matches OR if any of its branches match
  const filtered = groupedClients
    .map((parent) => {
      const parentMatches = matchesSearch(parent);
      const matchingBranches = (parent.branches || []).filter(matchesSearch);

      if (parentMatches) return parent; // show parent with all branches
      if (matchingBranches.length > 0)
        return { ...parent, branches: matchingBranches }; // show parent with matching branches only
      return null;
    })
    .filter((c) => c !== null) as (Client & { branches: Client[] })[];

  return (
    <div className="space-y-6 page-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-sage-800">Clientes</h1>
          <p className="text-sm text-sage-800/40">{clients.length} clientes registrados</p>
        </div>
        <div className="flex gap-2">
          <PermissionGate permission="clients:create">
            <Link href="/dashboard/clients/upload">
              <Button variant="outline"><Upload className="h-4 w-4 mr-1" /> Importar</Button>
            </Link>
          </PermissionGate>
          <PermissionGate permission="clients:create">
            <Link href="/dashboard/clients/new">
              <Button><Plus className="h-4 w-4 mr-1" /> Nuevo cliente</Button>
            </Link>
          </PermissionGate>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sage-800/30" />
        <Input
          placeholder="Buscar por nombre, RUT o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {!loading && incompleteCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-[14px] p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                {incompleteCount} {incompleteCount === 1 ? "cliente con" : "clientes con"} datos pendientes
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Faltan datos necesarios para emitir certificados (email o RUT). Haz click en cada cliente para completar su información.
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-sand-50 border border-sand-300 rounded-[14px] p-6">
              <div className="skeleton h-5 w-48 rounded mb-2" />
              <div className="skeleton h-4 w-32 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((client) => (
            <div key={client.id} className="space-y-1">
              {/* Parent / standalone client card */}
              <Link href={`/dashboard/clients/${client.id}`}>
                <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-4 sm:p-5 card-hover">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="h-10 w-10 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-sage-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sage-800 truncate">{client.name}</p>
                        {(client.branches?.length ?? 0) > 0 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {client.branches!.length} {client.branches!.length === 1 ? "sucursal" : "sucursales"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-sage-800/40">
                        {client.contactName && `${client.contactName} · `}
                        {client.email || "Sin email"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-2 ml-[52px] sm:ml-[56px]">
                    {hasIncompleteData(client) && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 border border-amber-200 whitespace-nowrap flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {getMissingFields(client).join(", ")}
                      </span>
                    )}
                    <Badge variant="secondary">
                      {client.pickupCount + (client.branches?.reduce((s, b) => s + b.pickupCount, 0) || 0)} retiros
                    </Badge>
                    <Badge variant="outline">
                      {client._count.certificates + (client.branches?.reduce((s, b) => s + b._count.certificates, 0) || 0)} certificados
                    </Badge>
                  </div>
                </div>
              </Link>

              {/* Branch cards */}
              {client.branches?.map((branch) => (
                <Link key={branch.id} href={`/dashboard/clients/${branch.id}`}>
                  <div className="ml-4 sm:ml-8 relative bg-sand-50 border border-sand-300 rounded-[14px] p-3 sm:p-4 card-hover">
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 border-t border-sand-300 hidden sm:block" />
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-sage-100/60 flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-sage-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-sage-800 truncate">{branch.name}</p>
                        <p className="text-xs text-sage-800/40">
                          {branch.contactName && `${branch.contactName} · `}
                          {branch.email || "Sin email"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-2 ml-11">
                      {hasIncompleteData(branch) && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 border border-amber-200 whitespace-nowrap flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {getMissingFields(branch).join(", ")}
                        </span>
                      )}
                      <Badge variant="secondary" className="text-xs">{branch.pickupCount} retiros</Badge>
                      <Badge variant="outline" className="text-xs">{branch._count.certificates} certificados</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ))}
          {filtered.length === 0 && !search && (
            <div className="text-center py-12">
              <p className="text-3xl mb-3">🤝</p>
              <p className="text-sm text-sage-600">Tu red de reciclaje empieza aquí.</p>
              <p className="text-xs text-sage-800/40 mt-1">Agrega tu primer cliente para comenzar a medir impacto.</p>
              <Link href="/dashboard/clients/new">
                <Button variant="outline" size="sm" className="mt-4">
                  <Plus className="h-4 w-4 mr-1" /> Agregar cliente
                </Button>
              </Link>
            </div>
          )}
          {filtered.length === 0 && search && (
            <div className="text-center py-12">
              <p className="text-3xl mb-3">🔍</p>
              <p className="text-sm text-sage-600">Nada por aquí con esos filtros.</p>
              <p className="text-xs text-sage-800/40 mt-1">Prueba ampliando la búsqueda.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
