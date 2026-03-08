# Impacto Vivo — Rediseño UI/UX de ReciclaIA

## Contexto

ReciclaIA tiene una base visual limpia (sage/sand, serif/sans, cards con hover) pero carece de personalidad propia. Se siente como un template bien ejecutado. El objetivo es transformarla en una experiencia cálida y humana donde cada dato cuente una historia con peso emocional.

**Usuario principal:** Gerentes/dueños de empresas de reciclaje que quieren sentir orgullo de su impacto.
**Tono:** Datos con alma. Los números hablan con contexto humano. Sin exclamaciones excesivas, con peso emocional.
**Referencia de personalidad:** Notion — cálida, invitante, estados vacíos que guían.
**Elementos visuales:** Íconos animados (micro-animaciones CSS) + emojis con intención.
**Restricción:** La paleta sage/sand se mantiene. No se agregan librerías externas de animación.

---

## 1. Nueva paleta de gráficos

Los gráficos actuales usan variaciones de sage que se confunden. Se reemplazan las CSS variables `--chart-1` a `--chart-8` con colores de alto contraste:

| Slot | Color | Hex | Uso ejemplo |
|------|-------|-----|-------------|
| 1 | Azul profundo | `#3b82f6` | Plástico PET |
| 2 | Ámbar cálido | `#f59e0b` | Cartón |
| 3 | Esmeralda | `#10b981` | Vidrio |
| 4 | Coral | `#f97316` | Aluminio |
| 5 | Violeta | `#8b5cf6` | Papel |
| 6 | Rosa seco | `#ec4899` | Madera |
| 7 | Cyan | `#06b6d4` | Electrónicos |
| 8 | Slate | `#64748b` | RAE |

Se definen en `globals.css` y se aplican en los gráficos de Recharts del dashboard.

---

## 2. Dashboard narrativo (4 actos)

Reemplazar la estructura actual (greeting → actions → KPIs → gráficos → equivalencias → tabla) por una narrativa:

### Acto 1: "Tu impacto" (hero)
- Número grande animado (count-up desde 0, ~1.5s, ease-out) con el total de CO2 evitado del mes
- Debajo, equivalencia rotativa con crossfade cada 5 segundos:
  1. "🌳 {n} árboles que siguen en pie"
  2. "🚗 {n} km que un auto no recorrió"
  3. "🏠 {n} hogares con energía limpia por un día"
  4. "💧 {n} litros de agua limpia preservados"
- Dots indicadores abajo. Hover/click pausa la rotación.
- Comparación vs mes anterior: "↑ 23% vs julio"

### Acto 2: "La historia de tus materiales"
- Donut chart con la nueva paleta (centro muestra total kg)
- Barras horizontales rankeadas del más al menos reciclado
- Cada material con su emoji identificador

### Acto 3: "Tu ritmo"
- Gráfico de área mensual con gradiente más marcado
- Línea de tendencia
- Indicador textual: "📈 3 meses consecutivos creciendo"

### Acto 4: "Acciones rápidas + últimos movimientos"
- Quick actions con íconos animados al hover
- Tabla de movimientos recientes

---

## 3. Micro-animaciones

Todas implementadas con CSS animations/transitions + un componente `<CountUp>` en React puro.

### Count-up
- Componente reutilizable que anima un número de 0 al valor final
- Duración: ~1.5s, easing: ease-out
- Se usa en: hero del dashboard, KPIs, stats de retiros, stats de clientes

### Logo que respira
- Pulse suave cada 3 segundos en la hoja del sidebar (scale 1 → 1.1 → 1, opacity 0.8 → 1)
- Al hover sobre el logo: rotación leve (15deg) como viento

### Hover con intención
- Quick action cards: ícono sube 2px al hover
- Botones primarios: escala 1.02 al hover
- Filas de tablas: transición de fondo actual se mantiene

### Checks animados
- CheckCircle aparece con scale 0 → 1 + rebote (spring) al completar acciones
- Se aplica en las pantallas de éxito existentes (antes de reemplazarlas por toasts)

### Transiciones de página
- Fade-in al montar cada página del dashboard (opacity 0→1, translateY 8→0)
- Duración: 300ms, una sola vez

---

## 4. Estados vacíos con alma

Cada tabla/lista vacía muestra emoji + mensaje con contexto + CTA.

| Página | Mensaje |
|--------|---------|
| Retiros | 🌱 "Aún no hay retiros este mes. Cada retiro es material que no llega al vertedero." + [Registrar primer retiro] |
| Certificados | 📄 "Sin certificados todavía. Cuando estés listo, convierte tus retiros en impacto documentado." + [Crear certificado] |
| Clientes | 🤝 "Tu red de reciclaje empieza aquí. Agrega tu primer cliente." + [Agregar cliente] |
| Retiros (filtrados sin resultados) | 🔍 "Nada por aquí con esos filtros. Prueba ampliando la búsqueda." |
| Detalle cliente sin retiros | 🌿 "Este cliente aún no tiene retiros. Registra el primero y empieza a medir su impacto." + [Registrar retiro] |
| Chat sin mensajes | 💬 "Pregúntame sobre el impacto de tus clientes, tendencias de reciclaje, o cómo va el mes." |

**Patrón visual:** Emoji grande (32px) → texto principal sage-600 → subtexto sage-800/40 → botón outline.

---

## 5. Toasts celebratorios

Reemplazan las pantallas de éxito. Acción → toast → redirect automático a la lista.

| Acción | Toast |
|--------|-------|
| Registrar retiro | 🌳 "Retiro registrado. {totalKg} kg más lejos del vertedero." |
| Crear certificado | 📄 "Certificado creado. El impacto de {clientName} está documentado." |
| Enviar certificado | ✉️ "Certificado enviado a {clientName}. Impacto compartido." |
| Editar retiro | ✅ "Retiro actualizado correctamente." |
| Eliminar retiro | 🗑️ "Retiro eliminado." |
| Guardar cliente | 🤝 "Datos de {clientName} actualizados." |
| Subir Excel | 📊 "{count} registros importados. {totalKg} kg de impacto sumados." |

**Comportamiento:** Abajo a la derecha, 4 segundos, slide-in suave, fondo sand-50 con borde sage-200. Se usa el `<Toaster>` existente.

---

## 6. Equivalencias rotativas

### En el hero del dashboard
- Una equivalencia grande, centrada, rota cada 5s con crossfade
- Dots indicadores (mini carousel)
- Hover/click pausa la rotación
- 4 equivalencias: árboles, km, hogares, agua

### En detalle de cliente
- Mini versión: una línea con la equivalencia más impactante (mayor número)
- "🌳 El impacto de este cliente equivale a 12 árboles preservados"
- Sin rotación

---

## 7. Sidebar vivo

### Logo animado
- Hoja con pulse de respiración (3s ciclo)
- Hover: rotación leve como viento (15deg ida y vuelta)

### Nav activo
- Barra vertical 3px sage-500 al lado izquierdo del item activo (estilo Linear)
- Transición suave al cambiar de página

### Indicadores de actividad
- Retiros: dot verde si hay retiros registrados hoy
- Certificados: badge numérico con borradores pendientes de enviar

### Footer — mini impacto
- Línea sobre el perfil del usuario: "🌱 {totalKg} kg este mes"
- Texto pequeño sage-400, recordatorio constante del propósito

---

## Archivos principales a modificar

| Archivo | Cambios |
|---------|---------|
| `globals.css` | Nuevas CSS variables de chart, animaciones (count-up, breathe, fade-in, spring-check) |
| `dashboard/page.tsx` | Rediseño completo: 4 actos, hero con count-up, equivalencias rotativas, nueva paleta en gráficos |
| `dashboard/layout.tsx` | Sidebar: logo animado, barra activa, indicadores, footer de impacto |
| `dashboard/pickups/page.tsx` | Estado vacío, toast en acciones |
| `dashboard/pickups/new/page.tsx` | Toast reemplaza pantalla de éxito |
| `dashboard/pickups/edit/page.tsx` | Toast reemplaza pantalla de éxito |
| `dashboard/clients/page.tsx` | Estado vacío |
| `dashboard/clients/[id]/page.tsx` | Mini equivalencia, estado vacío, toast en acciones |
| `dashboard/certificates/page.tsx` | Estado vacío, toast en acciones |
| `dashboard/certificates/new/page.tsx` | Toast reemplaza pantalla de éxito |
| `dashboard/chatbot/page.tsx` | Estado vacío inicial |
| Nuevo: `components/count-up.tsx` | Componente CountUp reutilizable |
| Nuevo: `components/rotating-equivalence.tsx` | Componente de equivalencias rotativas |

---

## Decisiones de diseño

- **Sin librerías de animación externas.** Todo con CSS transitions/animations + React puro.
- **Paleta sage/sand intacta.** Solo se cambian los colores de gráficos.
- **Emojis nativos.** Sin ilustraciones custom ni SVGs decorativos.
- **Toasts sobre pantallas de éxito.** Flujo más rápido: acción → feedback → de vuelta al trabajo.
- **Animaciones sutiles.** Dan vida sin distraer. Nunca más de 300ms excepto el count-up.
