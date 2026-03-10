"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Upload, AlertTriangle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        <div className="space-y-4">
          <div className="skeleton h-12 w-full rounded-[14px]" />
          <div className="skeleton h-64 w-full rounded-[14px]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-12 text-center">
          {!search ? (
            <>
              <p className="text-3xl mb-3">🤝</p>
              <p className="text-sm text-sage-600">Tu red de reciclaje empieza aquí.</p>
              <p className="text-xs text-sage-800/40 mt-1">Agrega tu primer cliente para comenzar a medir impacto.</p>
              <Link href="/dashboard/clients/new">
                <Button variant="outline" size="sm" className="mt-4">
                  <Plus className="h-4 w-4 mr-1" /> Agregar cliente
                </Button>
              </Link>
            </>
          ) : (
            <>
              <p className="text-3xl mb-3">🔍</p>
              <p className="text-sm text-sage-600">Nada por aquí con esos filtros.</p>
              <p className="text-xs text-sage-800/40 mt-1">Prueba ampliando la búsqueda.</p>
            </>
          )}
        </div>
      ) : (
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sand-100">
                  <th className="text-left py-3 px-3 sm:px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Cliente</th>
                  <th className="text-left py-3 px-3 sm:px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider hidden md:table-cell">Contacto</th>
                  <th className="text-left py-3 px-3 sm:px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="text-right py-3 px-3 sm:px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Retiros</th>
                  <th className="text-right py-3 px-3 sm:px-4 text-xs font-medium text-sage-800/40 uppercase tracking-wider hidden sm:table-cell">Certificados</th>
                  <th className="w-10 py-3 px-2"></th>
                </tr>
              </thead>
              <tbody className="stagger-rows">
                {filtered.map((client) => (
                  <ClientRows key={client.id} client={client} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientRow({ client, isBranch }: { client: Client; isBranch?: boolean }) {
  const totalRetiros = isBranch
    ? client.pickupCount
    : client.pickupCount + (client.branches?.reduce((s, b) => s + b.pickupCount, 0) || 0);
  const totalCerts = isBranch
    ? client._count.certificates
    : client._count.certificates + (client.branches?.reduce((s, b) => s + b._count.certificates, 0) || 0);

  return (
    <tr className={`border-t border-sand-200 hover:bg-white/50 transition-colors ${isBranch ? "bg-sand-50/50" : ""}`}>
      <td className="py-3 px-3 sm:px-4">
        <Link href={`/dashboard/clients/${client.id}`} className="flex items-center gap-2">
          {isBranch && (
            <span className="ml-3 mr-0.5 text-sage-300 flex-shrink-0">
              <svg width="12" height="16" viewBox="0 0 12 16" className="text-sage-300">
                <path d="M1 0V10C1 12 3 12 5 12H12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          )}
          <div className={`${isBranch ? "h-5 w-5" : "h-6 w-6"} rounded-full ${isBranch ? "bg-sage-50 border border-sage-200" : "bg-sage-100"} flex items-center justify-center flex-shrink-0`}>
            <span className={`${isBranch ? "text-[9px]" : "text-[10px]"} font-medium text-sage-500`}>
              {client.name.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <span className={`font-medium text-sage-800 truncate block ${isBranch ? "text-xs" : "text-sm"}`}>
              {client.name}
            </span>
            {hasIncompleteData(client) && (
              <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                <AlertTriangle className="h-2.5 w-2.5" />
                {getMissingFields(client).join(", ")}
              </span>
            )}
          </div>
          {!isBranch && (client.branches?.length ?? 0) > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sage-50 text-sage-500 border border-sage-200 whitespace-nowrap">
              {client.branches!.length} suc.
            </span>
          )}
        </Link>
      </td>
      <td className="py-3 px-3 sm:px-4 text-xs text-sage-800/60 hidden md:table-cell">
        {client.contactName || "—"}
      </td>
      <td className="py-3 px-3 sm:px-4 text-xs text-sage-800/60 truncate max-w-[180px] hidden sm:table-cell">
        {client.email || <span className="text-sage-800/30">Sin email</span>}
      </td>
      <td className="py-3 px-3 sm:px-4 text-right text-xs font-medium text-sage-800 tabular-nums">
        {totalRetiros}
      </td>
      <td className="py-3 px-3 sm:px-4 text-right text-xs text-sage-500 tabular-nums hidden sm:table-cell">
        {totalCerts}
      </td>
      <td className="py-3 px-2 text-center">
        <Link href={`/dashboard/clients/${client.id}`}>
          <ChevronRight className="h-4 w-4 text-sage-300" />
        </Link>
      </td>
    </tr>
  );
}

function ClientRows({ client }: { client: Client & { branches: Client[] } }) {
  return (
    <>
      <ClientRow client={client} />
      {client.branches?.map((branch) => (
        <ClientRow key={branch.id} client={branch} isBranch />
      ))}
    </>
  );
}
