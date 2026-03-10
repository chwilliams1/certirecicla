"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Bell, AlertTriangle, FileCheck, CheckCircle, Send } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface InactiveClient {
  id: string;
  name: string;
  lastPickup: string | null;
  daysSince: number;
}

interface UnsentCertificate {
  id: string;
  clientName: string;
  createdAt: string;
}

interface NotificationData {
  inactiveClients: InactiveClient[];
  pendingCertificates: number;
  unsentCertificates: UnsentCertificate[];
  savedNotifications: Array<{ id: string; title: string; message: string }>;
  threshold: number;
}

export function NotificationBell() {
  const [data, setData] = useState<NotificationData | null>(null);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setData(d);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const totalAlerts =
    (data?.inactiveClients?.length || 0) +
    (data?.pendingCertificates || 0) +
    (data?.unsentCertificates?.length || 0) +
    (data?.savedNotifications?.length || 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-[10px] text-sage-800/40 hover:text-sage-800/70 hover:bg-sand-100 transition-all">
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
          {totalAlerts > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white animate-pulse">
              {totalAlerts > 99 ? "99+" : totalAlerts}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[calc(100vw-2rem)] sm:w-80 bg-sand-50 border-sand-300 rounded-[14px] p-0 shadow-lg"
      >
        <div className="px-4 py-3 border-b border-sand-200">
          <h3 className="font-serif text-sm font-semibold text-sage-800">
            Notificaciones
          </h3>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {totalAlerts === 0 ? (
            <div className="px-4 py-8 text-center">
              <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-sm text-sage-800/50">Sin alertas pendientes</p>
            </div>
          ) : (
            <>
              {/* Inactive clients section */}
              {data && data.inactiveClients.length > 0 && (
                <div className="px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" strokeWidth={1.5} />
                    <span className="text-xs font-semibold text-sage-800/60 uppercase tracking-wider">
                      Clientes inactivos
                    </span>
                  </div>
                  <div className="space-y-1">
                    {data.inactiveClients.slice(0, 8).map((client) => (
                      <Link
                        key={client.id}
                        href={`/dashboard/clients/${client.id}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-sand-100 transition-colors group"
                      >
                        <span className="text-sm text-sage-800/70 group-hover:text-sage-800 truncate mr-2">
                          {client.name}
                        </span>
                        <span className="text-[11px] text-amber-600 font-medium whitespace-nowrap">
                          {client.daysSince === -1
                            ? "Sin retiros"
                            : `${client.daysSince}d`}
                        </span>
                      </Link>
                    ))}
                    {data.inactiveClients.length > 8 && (
                      <p className="text-[11px] text-sage-800/30 text-center py-1">
                        +{data.inactiveClients.length - 8} clientes más
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Separator */}
              {data &&
                data.inactiveClients.length > 0 &&
                data.pendingCertificates > 0 && (
                  <div className="border-t border-sand-200 mx-4" />
                )}

              {/* Pending certificates section */}
              {data && data.pendingCertificates > 0 && (
                <div className="px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <FileCheck className="h-3.5 w-3.5 text-sage-500" strokeWidth={1.5} />
                    <span className="text-xs font-semibold text-sage-800/60 uppercase tracking-wider">
                      Certificados pendientes
                    </span>
                  </div>
                  <Link
                    href="/dashboard/certificates"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-sand-100 transition-colors group"
                  >
                    <span className="text-sm text-sage-800/70 group-hover:text-sage-800">
                      Certificados en borrador
                    </span>
                    <span className="text-[11px] bg-sage-500/10 text-sage-600 px-2 py-0.5 rounded-full font-medium">
                      {data.pendingCertificates}
                    </span>
                  </Link>
                </div>
              )}

              {/* Unsent published certificates section */}
              {data && data.unsentCertificates && data.unsentCertificates.length > 0 && (
                <>
                  {((data.inactiveClients.length > 0) || (data.pendingCertificates > 0)) && (
                    <div className="border-t border-sand-200 mx-4" />
                  )}
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Send className="h-3.5 w-3.5 text-amber-500" strokeWidth={1.5} />
                      <span className="text-xs font-semibold text-sage-800/60 uppercase tracking-wider">
                        Publicados sin enviar
                      </span>
                    </div>
                    <div className="space-y-1">
                      {data.unsentCertificates.slice(0, 8).map((cert) => (
                        <Link
                          key={cert.id}
                          href={`/dashboard/certificates/${cert.id}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-sand-100 transition-colors group"
                        >
                          <span className="text-sm text-sage-800/70 group-hover:text-sage-800 truncate mr-2">
                            {cert.clientName}
                          </span>
                          <span className="text-[11px] text-amber-600 font-medium whitespace-nowrap">
                            {new Date(cert.createdAt.slice(0, 10) + "T12:00:00").toLocaleDateString("es-CL")}
                          </span>
                        </Link>
                      ))}
                      {data.unsentCertificates.length > 8 && (
                        <p className="text-[11px] text-sage-800/30 text-center py-1">
                          +{data.unsentCertificates.length - 8} más
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Saved notifications section */}
              {data && data.savedNotifications.length > 0 && (
                <>
                  <div className="border-t border-sand-200 mx-4" />
                  <div className="px-4 py-3">
                    <span className="text-xs font-semibold text-sage-800/60 uppercase tracking-wider">
                      Otras notificaciones
                    </span>
                    <div className="mt-2 space-y-1">
                      {data.savedNotifications.map((n) => (
                        <div
                          key={n.id}
                          className="py-1.5 px-2 rounded-lg hover:bg-sand-100 transition-colors"
                        >
                          <p className="text-sm font-medium text-sage-800/70">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-sage-800/40">
                            {n.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {totalAlerts > 0 && (
          <div className="px-4 py-2.5 border-t border-sand-200">
            <p className="text-[11px] text-sage-800/30 text-center">
              Umbral de inactividad: {data?.threshold || 30} días
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
