"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Plus, FileCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { calculateEquivalencies } from "@/lib/co2-calculator";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: {
    type: string;
    step: string;
    data?: Record<string, unknown>;
  };
  createdAt: string;
}

interface WizardState {
  step: string;
  clientId?: string;
  clientName?: string;
  periodStart?: string;
  periodEnd?: string;
  materials?: Record<string, { kg: number; co2: number }>;
  totalKg?: number;
  totalCo2?: number;
  certificateId?: string;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [wizardState, setWizardState] = useState<WizardState>({ step: "IDLE" });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startNewSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function startNewSession() {
    const res = await fetch("/api/chatbot/sessions", { method: "POST" });
    const session = await res.json();
    setSessionId(session.id);
    setMessages(session.messages || []);
    setWizardState(session.context ? JSON.parse(session.context) : { step: "IDLE" });
  }

  async function sendMessage(text?: string, action?: Record<string, unknown>) {
    const messageText = text || input.trim();
    if (!messageText && !action) return;

    if (messageText && !action) {
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: "user",
          content: messageText,
          createdAt: new Date().toISOString(),
        },
      ]);
    }

    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: action ? undefined : messageText,
          action: action || undefined,
        }),
      });

      const data = await res.json();

      if (data.sessionId) setSessionId(data.sessionId);
      if (data.wizardState) setWizardState(data.wizardState);

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.message,
          metadata: data.metadata,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Error al procesar el mensaje. Intenta de nuevo.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectClient(clientId: string, clientName: string) {
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", content: `Selecciono: ${clientName}`, createdAt: new Date().toISOString() },
    ]);
    sendMessage(undefined, { type: "SELECT_CLIENT", payload: { clientId, clientName } });
  }

  function handleSelectPeriod(periodStart: string, periodEnd: string) {
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", content: `Período: ${periodStart} a ${periodEnd}`, createdAt: new Date().toISOString() },
    ]);
    sendMessage(undefined, { type: "SELECT_PERIOD", payload: { periodStart, periodEnd } });
  }

  function handleConfirm() {
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", content: "Confirmo, generar certificado", createdAt: new Date().toISOString() },
    ]);
    sendMessage(undefined, { type: "CONFIRM" });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl text-sage-800">Asistente CertiRecicla</h1>
          <p className="text-xs sm:text-sm text-sage-800/40">Crea certificados y consulta datos con IA</p>
        </div>
        <Button variant="outline" size="sm" onClick={startNewSession} className="self-start sm:self-auto">
          <Plus className="h-4 w-4 mr-1" /> Nueva conversación
        </Button>
      </div>

      <div className="flex-1 overflow-auto bg-sand-50 border border-sand-300 rounded-[14px] p-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-3xl mb-3">💬</p>
              <p className="text-sm text-sage-600">Pregúntame sobre el impacto de tus clientes,</p>
              <p className="text-sm text-sage-600">tendencias de reciclaje, o cómo va el mes.</p>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="h-8 w-8 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-sage-600" />
              </div>
            )}
            <div
              className={`max-w-[90%] sm:max-w-[80%] rounded-[12px] px-3 sm:px-4 py-3 ${
                msg.role === "user"
                  ? "bg-sage-500 text-white"
                  : "bg-white border border-sand-200"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

              {/* Wizard step renderers */}
              {msg.metadata?.step === "IDLE" && msg.role === "assistant" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => sendMessage(undefined, { type: "START" })}>
                    <FileCheck className="h-3 w-3 mr-1" /> Crear certificado
                  </Button>
                </div>
              )}

              {msg.metadata?.step === "SELECT_CLIENT" && msg.metadata.data && (
                <div className="mt-3 space-y-1">
                  {(msg.metadata.data.clients as Array<{ id: string; name: string }>)?.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectClient(c.id, c.name)}
                      className="block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-sage-50 transition-colors border border-sand-200"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}

              {msg.metadata?.step === "SELECT_PERIOD" && (
                <PeriodSelector onSelect={handleSelectPeriod} />
              )}

              {msg.metadata?.step === "CONFIRM" && msg.metadata.data && (
                <div className="mt-3 space-y-3">
                  <div className="bg-sage-50/50 rounded-lg p-3">
                    <p className="text-xs font-medium text-sage-600 mb-2">Materiales:</p>
                    {Object.entries(msg.metadata.data.materials as Record<string, { kg: number; co2: number }>).map(
                      ([mat, vals]) => (
                        <div key={mat} className="flex justify-between text-xs py-1">
                          <span>{mat}</span>
                          <span className="text-sage-600">{vals.kg.toLocaleString("es-CL")} kg / {vals.co2.toLocaleString("es-CL")} kg CO₂</span>
                        </div>
                      )
                    )}
                    <div className="border-t border-sand-200 mt-2 pt-2 flex justify-between text-sm font-medium">
                      <span>Total</span>
                      <span className="text-sage-600">
                        {(msg.metadata.data.totalKg as number).toLocaleString("es-CL")} kg / {(msg.metadata.data.totalCo2 as number).toLocaleString("es-CL")} kg CO₂
                      </span>
                    </div>
                  </div>
                  <EquivalenciesPreview co2={msg.metadata.data.totalCo2 as number} />
                  <Button size="sm" onClick={handleConfirm} className="w-full">
                    Confirmar y generar certificado
                  </Button>
                </div>
              )}

              {msg.metadata?.step === "DONE" && msg.metadata.data && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/dashboard/certificates/${(msg.metadata.data as { certificateId: string }).certificateId}`}>
                    <Button size="sm" variant="outline">Ver certificado</Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={startNewSession}>
                    <Plus className="h-3 w-3 mr-1" /> Nuevo certificado
                  </Button>
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="h-8 w-8 rounded-full bg-sage-500 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-sage-600" />
            </div>
            <div className="bg-white border border-sand-200 rounded-[12px] px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-sage-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Escribe un mensaje o pregunta..."
          className="flex-1"
          disabled={loading}
        />
        <Button onClick={() => sendMessage()} disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function PeriodSelector({ onSelect }: { onSelect: (start: string, end: string) => void }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const quickPeriods = [
    { label: "Último mes", start: getMonthAgo(1), end: today() },
    { label: "Últimos 3 meses", start: getMonthAgo(3), end: today() },
    { label: "Últimos 6 meses", start: getMonthAgo(6), end: today() },
    { label: `Año ${new Date().getFullYear()}`, start: `${new Date().getFullYear()}-01-01`, end: `${new Date().getFullYear()}-12-31` },
  ];

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-1">
        {quickPeriods.map((p) => (
          <Badge
            key={p.label}
            variant="outline"
            className="cursor-pointer hover:bg-sage-50"
            onClick={() => onSelect(p.start, p.end)}
          >
            {p.label}
          </Badge>
        ))}
      </div>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-xs text-sage-800/40">Desde</label>
          <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="h-8 text-xs" />
        </div>
        <div className="flex-1">
          <label className="text-xs text-sage-800/40">Hasta</label>
          <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="h-8 text-xs" />
        </div>
        <Button size="sm" onClick={() => start && end && onSelect(start, end)} disabled={!start || !end}>
          OK
        </Button>
      </div>
    </div>
  );
}

function EquivalenciesPreview({ co2 }: { co2: number }) {
  const eq = calculateEquivalencies(co2);
  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="bg-sage-50/50 rounded-lg p-2 text-center">
        <p className="font-bold text-sage-600">{eq.trees}</p>
        <p className="text-sage-800/40">árboles</p>
      </div>
      <div className="bg-sage-50/50 rounded-lg p-2 text-center">
        <p className="font-bold text-sage-600">{eq.kmNotDriven.toLocaleString("es-CL")}</p>
        <p className="text-sage-800/40">km no conducidos</p>
      </div>
      <div className="bg-sage-50/50 rounded-lg p-2 text-center">
        <p className="font-bold text-sage-600">{eq.homesEnergized.toLocaleString("es-CL")}</p>
        <p className="text-sage-800/40">días de hogar energizado</p>
      </div>
      <div className="bg-sage-50/50 rounded-lg p-2 text-center">
        <p className="font-bold text-sage-600">{eq.smartphonesCharged.toLocaleString("es-CL")}</p>
        <p className="text-sage-800/40">smartphones cargados</p>
      </div>
    </div>
  );
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function getMonthAgo(months: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}
