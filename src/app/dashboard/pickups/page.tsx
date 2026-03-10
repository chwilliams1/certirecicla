"use client";

import { useEffect, useState, useMemo } from "react";
import { MATERIAL_COLORS } from "@/lib/material-colors";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Package,
  MapPin,
  Filter,
  Truck,
  Plus,
  Upload,
  MoreHorizontal,
  User,
  Pencil,
  FileCheck,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { PermissionGate } from "@/components/permission-gate";

// Colores centralizados en src/lib/material-colors.ts

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  none: { label: "Solo retiro", className: "bg-sand-100 text-sage-800/50 border-sand-300" },
  draft: { label: "Certificado borrador", className: "bg-amber-50 text-amber-700 border-amber-200" },
  published: { label: "Certificado emitido", className: "bg-sage-50 text-sage-600 border-sage-200" },
  sent: { label: "Certificado enviado", className: "bg-blue-50 text-blue-600 border-blue-200" },
};

interface Pickup {
  key: string;
  clientId: string;
  clientName: string;
  parentClientName: string | null;
  date: string;
  location: string | null;
  materials: Array<{ material: string; quantityKg: number; co2Saved: number }>;
  totalKg: number;
  totalCo2: number;
  certStatus: "none" | "draft" | "published" | "sent";
  certId: string | null;
}

export default function PickupsPage() {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [materialFilter, setMaterialFilter] = useState<string>("all");
  const [expandedPickup, setExpandedPickup] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/pickups")
      .then((r) => r.json())
      .then(setPickups)
      .finally(() => setLoading(false));
  }, []);

  // Collect all unique materials for the filter
  const allMaterials = useMemo(() => {
    const set = new Set<string>();
    pickups.forEach((p) => p.materials.forEach((m) => set.add(m.material)));
    return Array.from(set).sort();
  }, [pickups]);

  // Filtered pickups
  const filtered = useMemo(() => {
    return pickups.filter((p) => {
      // Search
      if (search) {
        const q = search.toLowerCase();
        const displayName = p.parentClientName ? `${p.parentClientName} - ${p.clientName}` : p.clientName;
        const matchClient = displayName.toLowerCase().includes(q);
        const matchLocation = (p.location || "").toLowerCase().includes(q);
        const matchMaterial = p.materials.some((m) => m.material.toLowerCase().includes(q));
        const matchDate = p.date.includes(q);
        if (!matchClient && !matchLocation && !matchMaterial && !matchDate) return false;
      }

      // Status filter
      if (statusFilter !== "all" && p.certStatus !== statusFilter) return false;

      // Material filter
      if (materialFilter !== "all" && !p.materials.some((m) => m.material === materialFilter)) return false;

      return true;
    });
  }, [pickups, search, statusFilter, materialFilter]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: filtered.length,
      totalKg: filtered.reduce((s, p) => s + p.totalKg, 0),
      totalCo2: filtered.reduce((s, p) => s + p.totalCo2, 0),
      clients: new Set(filtered.map((p) => p.clientId)).size,
    };
  }, [filtered]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-12 w-full rounded-[14px]" />
        <div className="skeleton h-64 w-full rounded-[14px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 page-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-sage-800">Retiros</h1>
          <p className="text-sm text-sage-800/40">Historial completo de retiros de reciclaje</p>
        </div>
        <div className="flex gap-2">
          <PermissionGate permission="pickups:create">
            <Link href="/dashboard/upload" className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full sm:w-auto"><Upload className="h-4 w-4 mr-1" /> Subir Excel</Button>
            </Link>
          </PermissionGate>
          <PermissionGate permission="pickups:create">
            <Link href="/dashboard/pickups/new" className="flex-1 sm:flex-none">
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-1.5" /> Registrar retiro
              </Button>
            </Link>
          </PermissionGate>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-cards">
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-4 text-center">
          <p className="text-xl font-serif text-sage-500">{stats.total}</p>
          <p className="text-xs text-sage-800/40 mt-1">Retiros</p>
        </div>
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-4 text-center">
          <p className="text-xl font-serif text-sage-500">{stats.clients}</p>
          <p className="text-xs text-sage-800/40 mt-1">Clientes</p>
        </div>
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-4 text-center">
          <p className="text-xl font-serif text-sage-500">{stats.totalKg.toLocaleString("es-CL")}</p>
          <p className="text-xs text-sage-800/40 mt-1">kg totales</p>
        </div>
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-4 text-center">
          <p className="text-xl font-serif text-sage-500">{stats.totalCo2.toLocaleString("es-CL")}</p>
          <p className="text-xs text-sage-800/40 mt-1">kg CO₂ evitado</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sage-800/30" />
          <Input
            placeholder="Buscar por cliente, ubicación, material o fecha..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-sand-50 border-sand-300 rounded-[10px] text-sm"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sage-800/30 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs bg-sand-50 border border-sand-300 rounded-[10px] text-sage-700 appearance-none cursor-pointer"
            >
              <option value="all">Todos los estados</option>
              <option value="none">Solo retiro</option>
              <option value="draft">Certificado borrador</option>
              <option value="published">Certificado emitido</option>
              <option value="sent">Certificado enviado</option>
            </select>
          </div>
          <select
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-sand-50 border border-sand-300 rounded-[10px] text-sage-700 appearance-none cursor-pointer"
          >
            <option value="all">Todos los materiales</option>
            {allMaterials.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-sand-50 border border-sand-300 rounded-[14px] p-12 text-center">
          {pickups.length === 0 ? (
            <>
              <p className="text-3xl mb-3">🌱</p>
              <p className="text-sm text-sage-600">Aún no hay retiros este mes.</p>
              <p className="text-xs text-sage-800/40 mt-1">Cada retiro es material que no llega al vertedero.</p>
              <Link href="/dashboard/pickups/new">
                <Button variant="outline" size="sm" className="mt-4">
                  <Plus className="h-4 w-4 mr-1" /> Registrar primer retiro
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
                  <th className="w-8 py-3 px-2 sm:px-3"></th>
                  <th className="text-left py-3 px-2 sm:px-3 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Fecha</th>
                  <th className="text-left py-3 px-2 sm:px-3 text-xs font-medium text-sage-800/40 uppercase tracking-wider">Cliente</th>
                  <th className="text-left py-3 px-2 sm:px-3 text-xs font-medium text-sage-800/40 uppercase tracking-wider hidden md:table-cell">Materiales</th>
                  <th className="text-right py-3 px-2 sm:px-3 text-xs font-medium text-sage-800/40 uppercase tracking-wider">kg</th>
                  <th className="text-right py-3 px-2 sm:px-3 text-xs font-medium text-sage-800/40 uppercase tracking-wider hidden sm:table-cell">CO₂</th>
                  <th className="text-right py-3 px-2 sm:px-3 text-xs font-medium text-sage-800/40 uppercase tracking-wider hidden sm:table-cell">Estado</th>
                  <th className="w-10 py-3 px-2 sm:px-3"></th>
                </tr>
              </thead>
              <tbody className="stagger-rows">
                {filtered.map((pickup) => {
                  const isExpanded = expandedPickup === pickup.key;
                  return (
                    <PickupRow
                      key={pickup.key}
                      pickup={pickup}
                      isExpanded={isExpanded}
                      onToggle={() => setExpandedPickup(isExpanded ? null : pickup.key)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function PickupRow({
  pickup,
  isExpanded,
  onToggle,
}: {
  pickup: Pickup;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const status = STATUS_CONFIG[pickup.certStatus];
  const editParams = new URLSearchParams({
    clientId: pickup.clientId,
    date: pickup.date,
    location: pickup.location || "",
  }).toString();

  return (
    <>
      <tr
        className="border-t border-sand-200 cursor-pointer hover:bg-white/50 transition-colors"
        onClick={onToggle}
      >
        <td className="py-3 px-2 sm:px-3">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-sage-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-sage-400" />
          )}
        </td>
        <td className="py-3 px-2 sm:px-3 font-medium text-sage-800 text-xs whitespace-nowrap">
          {new Date(pickup.date + "T12:00:00").toLocaleDateString("es-CL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </td>
        <td className="py-3 px-2 sm:px-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-sage-50 flex items-center justify-center flex-shrink-0 hidden sm:flex">
              <span className="text-[10px] font-medium text-sage-500">
                {pickup.clientName.charAt(0)}
              </span>
            </div>
            <span className="text-xs font-medium text-sage-800 truncate max-w-[100px] sm:max-w-[150px]">
              {pickup.parentClientName ? `${pickup.parentClientName} - ${pickup.clientName}` : pickup.clientName}
            </span>
          </div>
        </td>
        <td className="py-3 px-2 sm:px-3 hidden md:table-cell">
          <div className="flex flex-wrap gap-1">
            {pickup.materials.map((m, i) => (
              <span
                key={i}
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${
                  MATERIAL_COLORS[m.material] || "bg-sage-50 text-sage-600 border-sage-200"
                }`}
              >
                {m.material}
              </span>
            ))}
          </div>
        </td>
        <td className="py-3 px-2 sm:px-3 text-right text-xs font-medium text-sage-800 tabular-nums whitespace-nowrap">
          {pickup.totalKg.toLocaleString("es-CL")} kg
        </td>
        <td className="py-3 px-2 sm:px-3 text-right text-xs text-sage-500 tabular-nums whitespace-nowrap hidden sm:table-cell">
          {pickup.totalCo2.toLocaleString("es-CL")} kg
        </td>
        <td className="py-3 px-2 sm:px-3 text-right hidden sm:table-cell">
          <span className={`text-[10px] font-medium px-2 py-1 rounded-full border whitespace-nowrap ${status.className}`}>
            {status.label}
          </span>
        </td>
        <td className="py-3 px-2 sm:px-3 text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded-md hover:bg-sand-200 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4 text-sage-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {pickup.certStatus === "none" ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/pickups/edit?${editParams}`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar retiro
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/clients/${pickup.clientId}`}>
                      <User className="h-4 w-4 mr-2" />
                      Ver cliente
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/certificates/new?clientId=${pickup.clientId}`}>
                      <FileCheck className="h-4 w-4 mr-2" />
                      Generar certificado
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/clients/${pickup.clientId}`}>
                      <User className="h-4 w-4 mr-2" />
                      Ver cliente
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/certificates/${pickup.certId}`}>
                      <FileCheck className="h-4 w-4 mr-2" />
                      Ver certificado
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={8} className="p-0">
            <div className="bg-sand-100/50 border-t border-sand-200 px-6 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-3.5 w-3.5 text-sage-400" />
                <span className="text-xs font-medium text-sage-700">
                  Detalle del retiro — {pickup.materials.length}{" "}
                  {pickup.materials.length === 1 ? "material" : "materiales"}
                </span>
              </div>
              <div className="bg-white rounded-lg border border-sand-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-sand-50">
                      <th className="text-left py-2 px-4 font-medium text-sage-800/40">Material</th>
                      <th className="text-right py-2 px-4 font-medium text-sage-800/40">Cantidad</th>
                      <th className="text-right py-2 px-4 font-medium text-sage-800/40">CO₂ evitado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pickup.materials.map((m, i) => (
                      <tr key={i} className="border-t border-sand-100">
                        <td className="py-2 px-4">
                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                              MATERIAL_COLORS[m.material] || "bg-sage-50 text-sage-600 border-sage-200"
                            }`}
                          >
                            {m.material}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-right text-sage-800 tabular-nums">
                          {m.quantityKg.toLocaleString("es-CL")} kg
                        </td>
                        <td className="py-2 px-4 text-right text-sage-500 tabular-nums">
                          {m.co2Saved.toLocaleString("es-CL")} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-sand-200 bg-sand-50/50">
                      <td className="py-2 px-4 font-medium text-sage-700">Total</td>
                      <td className="py-2 px-4 text-right font-medium text-sage-800 tabular-nums">
                        {pickup.totalKg.toLocaleString("es-CL")} kg
                      </td>
                      <td className="py-2 px-4 text-right font-medium text-sage-500 tabular-nums">
                        {pickup.totalCo2.toLocaleString("es-CL")} kg
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-sage-800/40">
                {pickup.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />
                    {pickup.location}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className={`text-[10px] ${STATUS_CONFIG[pickup.certStatus].className}`}>
                    {STATUS_CONFIG[pickup.certStatus].label}
                  </Badge>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
