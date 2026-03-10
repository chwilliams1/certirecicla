"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    const res = await fetch("/api/clients");
    const data = await res.json();
    setClients(data);
    setLoading(false);
  }

  const matchesSearch = (c: Client) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.rut?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.contactName?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
    );
  };

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
  const filtered = useMemo(() => {
    const result = groupedClients
      .map((parent) => {
        const parentMatches = matchesSearch(parent);
        const matchingBranches = (parent.branches || []).filter(matchesSearch);

        if (parentMatches) return parent;
        if (matchingBranches.length > 0)
          return { ...parent, branches: matchingBranches };
        return null;
      })
      .filter((c) => c !== null) as (Client & { branches: Client[] })[];

    // Auto-expand cards that matched via branch when searching
    if (search) {
      const autoExpand = new Set<string>();
      for (const parent of result) {
        const parentMatches = matchesSearch(parent);
        if (!parentMatches && parent.branches.length > 0) {
          autoExpand.add(parent.id);
        }
      }
      if (autoExpand.size > 0) {
        setExpanded((prev) => {
          const next = new Set(prev);
          autoExpand.forEach((id) => next.add(id));
          return next;
        });
      }
    }

    return result;
  }, [groupedClients, search]);

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
        <div className="space-y-3 stagger-cards">
          {filtered.map((client) => {
            const hasBranches = client.branches.length > 0;
            const isExpanded = expanded.has(client.id);
            const totalRetiros = client.pickupCount + (client.branches.reduce((s, b) => s + b.pickupCount, 0));
            const totalCerts = client._count.certificates + (client.branches.reduce((s, b) => s + b._count.certificates, 0));
            const anyIncomplete = hasIncompleteData(client) || client.branches.some(hasIncompleteData);

            return (
              <div
                key={client.id}
                className="bg-sand-50 border border-sand-300 rounded-[14px] overflow-hidden"
              >
                {/* Header empresa */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/40 transition-colors"
                  onClick={() => {
                    if (!hasBranches) {
                      router.push(`/dashboard/clients/${client.id}`);
                      return;
                    }
                    setExpanded((prev) => {
                      const next = new Set(prev);
                      if (next.has(client.id)) next.delete(client.id);
                      else next.add(client.id);
                      return next;
                    });
                  }}
                >
                  <div className="h-8 w-8 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-[11px] font-medium text-sage-500">{client.name.charAt(0)}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-sage-800 truncate">{client.name}</span>
                      {hasBranches && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sage-50 text-sage-500 border border-sage-200 whitespace-nowrap flex-shrink-0">
                          {client.branches.length} suc.
                        </span>
                      )}
                    </div>
                    {anyIncomplete && (
                      <span className="text-[10px] text-amber-600 flex items-center gap-0.5 mt-0.5">
                        <AlertTriangle className="h-2.5 w-2.5 flex-shrink-0" />
                        {hasIncompleteData(client)
                          ? getMissingFields(client).join(", ")
                          : "sucursal con datos pendientes"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-xs text-sage-800/60 tabular-nums">{totalRetiros} retiros</span>
                    <span className="text-xs text-sage-800/60 tabular-nums hidden md:inline">{totalCerts} cert.</span>
                    <ChevronRight
                      className={`h-4 w-4 text-sage-300 transition-transform duration-200 ${
                        hasBranches && isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Sucursales expandidas */}
                {hasBranches && isExpanded && (
                  <div className="border-t border-sand-200">
                    <div className="border-l-2 border-sage-200 ml-6">
                      {/* Link directo a la empresa */}
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="flex items-center gap-3 px-4 py-2.5 border-b border-sand-100 hover:bg-white/40 transition-colors"
                      >
                        <div className="h-5 w-5 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-[9px] font-medium text-sage-500">{client.name.charAt(0)}</span>
                        </div>
                        <span className="text-xs font-medium text-sage-600">Ver empresa</span>
                        <ChevronRight className="h-3.5 w-3.5 text-sage-300 ml-auto flex-shrink-0" />
                      </Link>
                      {client.branches.map((branch) => (
                        <Link
                          key={branch.id}
                          href={`/dashboard/clients/${branch.id}`}
                          className="flex items-center gap-3 px-4 py-3 border-b border-sand-100 last:border-b-0 hover:bg-white/40 transition-colors"
                        >
                          <div className="h-5 w-5 rounded-full bg-sage-50 border border-sage-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-[9px] font-medium text-sage-500">{branch.name.charAt(0)}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-medium text-sage-800 truncate block">{branch.name}</span>
                            {hasIncompleteData(branch) && (
                              <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                                <AlertTriangle className="h-2.5 w-2.5" />
                                {getMissingFields(branch).join(", ")}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-sage-800/40 truncate max-w-[180px] hidden sm:inline">
                            {branch.email || "sin email"}
                          </span>
                          <span className="text-xs text-sage-800/60 tabular-nums flex-shrink-0">{branch.pickupCount} retiros</span>
                          <ChevronRight className="h-3.5 w-3.5 text-sage-300 flex-shrink-0" />
                        </Link>
                      ))}
                      <PermissionGate permission="clients:create">
                        <Link
                          href={`/dashboard/clients/new?parentId=${client.id}`}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs text-sage-500 hover:text-sage-700 hover:bg-white/40 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Agregar sucursal
                        </Link>
                      </PermissionGate>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

