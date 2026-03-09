# CertiRecicla — Análisis de Mercado Profundo

## Contexto

Este análisis es para la postulación a CORFO Semilla Inicia y definición de go-to-market de CertiRecicla, un SaaS B2B que permite a gestoras de residuos en Chile emitir certificados de CO₂ evitado para sus clientes generadores, con metodología GHG Protocol + ISO 14064. El diferenciador clave: la gestora es el usuario, no el generador.

---

## 1. TAMAÑO DE MERCADO (TAM / SAM / SOM)

### Gestoras de residuos en Chile — Datos verificados

| Fuente | Dato verificado | Notas |
|--------|----------------|-------|
| **MMA — Estudio oficial** | **54 empresas de valorización** identificadas | Estudio "Levantamiento de información del sector valorización de residuos", MMA |
| ANIR | **75 instalaciones** asociadas, ~250+ empresas en red | Fuente: anir.cl |
| **ReSimple** (GRANSIC #1) | **31 gestoras** + 17 cooperativas contratadas | resimple.cl |
| **GIRO** (GRANSIC neumáticos) | **194 productores** en sistema | giro.cl |
| **ProREP** (GRANSIC aceites) | **25 empresas** participantes | prorep.cl |
| **CampoLimpio** (GRANSIC envases fitosanitarios) | Activo, sin dato público de gestoras | campolimpio.cl |
| **Infraestructura reciclaje MMA** | **216 centros de reciclaje** + **7.186 puntos verdes** a nivel nacional | MMA datos públicos |
| SINADER (obligatorio >12 ton/año) | **No hay registro público centralizado** — requiere solicitud formal al MMA | Umbral: >12 ton no peligrosos/año |
| Estimación triangulada | **1.500–2.500 gestoras activas** incluyendo informales | Basado en: 54 verificadas MMA × factor fragmentación + 216 centros + informales |

**Dato crítico:** No existe un registro público consolidado de gestoras en Chile. El dato más duro es **54 empresas de valorización** (MMA), pero esto solo cubre valorizadoras formales. Sumando las redes GRANSIC (ReSimple 31, GIRO 194 productores, ProREP 25) y los 216 centros de reciclaje, la estimación de 1.500-2.500 gestoras totales es consistente.

**Para CORFO:** Citar "54 empresas de valorización verificadas por MMA" como dato duro, complementado con "estimación de mercado de 1.500-2.500 gestoras activas basada en estructura fragmentada del sector".

**Composición estimada del mercado de gestoras:**
- **~75-100 medianas-grandes** (>50 empleados, asociadas a ANIR, trabajan con GRANSIC)
- **~300-500 PyMEs formales** (5-50 empleados, declarantes en SINADER, operan localmente)
- **~1.000-1.500 micro/informales** (<5 empleados, muchas no declarantes)

### Cálculo TAM / SAM / SOM Chile

```
TAM Chile (toda gestora que podría usar el software):
  1.900 gestoras estimadas × USD 69/mes (plan Profesional promedio) × 12 = USD 1.573.200/año

SAM Chile (gestoras formales PyME con dolor real de certificación):
  500 gestoras formales PyME × USD 69/mes × 12 = USD 414.000/año

SOM Año 1 (objetivo realista con venta directa desde La Serena):
  15 gestoras × USD 55/mes (precio promedio con early-adopter discount) × 12 = USD 9.900/año

SOM Año 3 (expansión nacional + producto maduro):
  80 gestoras × USD 85/mes (mix de planes) × 12 = USD 81.600/año
```

### Mercado LATAM (Fase 2) — Datos verificados

| País | Gestoras verificadas | Fuente | Tasa reciclaje | Madurez REP | TAM potencial |
|------|---------------------|--------|---------------|-------------|---------------|
| **Perú** | **1.067 EO-RS** registradas (MINAM, enero 2022) + **522 infraestructuras de valorización** (OEFA) | D.L. 1278, MINAM, OEFA | **1.9%** | Baja — D.L. 1278 (2016) pero implementación lenta | USD 883.000/año |
| **Colombia** | **306+ empresas** en SUI (Sistema Único de Información) | SUI, Decreto 670/2025 | **17%** | Media — Decreto 670 (2025) recién formaliza REP | USD 350.000/año |
| **México** | ~2.000-4.000 (estimación, mercado 5x Chile) | SEMARNAT | ~12% | Baja — sin REP formal | USD 2.000.000/año |

**TAM LATAM total (Chile + Perú + Colombia + México):** ~USD 5.2M/año

#### Perú — Detalle
- **1.067 EO-RS** (Empresas Operadoras de Residuos Sólidos) registradas ante MINAM al 2022
- **522 infraestructuras de valorización** registradas (OEFA — Organismo de Evaluación y Fiscalización Ambiental)
- Sistema de registro: **SIGERSOL** (Sistema de Información para la Gestión de Residuos Sólidos)
- Tasa de reciclaje: solo **1.9%** — enorme espacio de crecimiento pero mercado inmaduro
- **Oportunidad:** Muchas EO-RS, pero baja digitalización. CertiRecicla podría entrar cuando Perú madure su REP (2-3 años)
- **Riesgo:** Baja WTP por inmadurez del mercado regulatorio

#### Colombia — Detalle
- **306+ empresas** registradas en SUI para gestión de residuos
- **Decreto 670 de 2025**: recién formalizó esquema REP — el mercado está en punto de inflexión
- Tasa de reciclaje: **17%** — más alta que Perú pero sin obligatoriedad consolidada
- **Oportunidad:** Timing excelente — entrar justo cuando la regulación REP se implementa (similar a Chile 2016-2020)
- **Riesgo:** Competidores locales podrían surgir rápido con regulación nueva

#### Tabla de madurez regulatoria LATAM

| Dimensión | Chile | Perú | Colombia |
|-----------|-------|------|----------|
| Ley REP | Ley 20.920 (2016), operativa | D.L. 1278 (2016), implementación parcial | Decreto 670 (2025), recién iniciando |
| Registro obligatorio | SINADER (activo) | SIGERSOL (activo) | SUI (activo) |
| Tasa reciclaje | ~22% | ~1.9% | ~17% |
| GRANSIC/sistemas colectivos | 4 activos (ReSimple, GIRO, ProREP, CampoLimpio) | Incipientes | En formación |
| NCG ESG/carbono | NCG 519 (dic 2026) | No | No |
| **Ventana de entrada** | **Ahora** | **2-3 años** | **1-2 años** |

### Mercado de software de gestión de residuos

| Métrica | Dato | Fuente |
|---------|------|--------|
| Software gestión residuos LATAM 2024 | USD 815.6M | Credence Research |
| LATAM 2032 proyección | USD 1.548.3M (CAGR 8.4%) | Credence Research |
| Chile específico 2025 | USD 4.87M | Cognitive Market Research |
| Chile CAGR | 3.4% | Cognitive Market Research |
| Cloud-based share | 63% del mercado | Credence Research 2024 |
| **Chile SaaS total 2023** | **USD 608M** → USD 1.57B (2030) | Market research |
| **PyMEs chilenas invirtiendo en digitalización** | **98%** planea invertir (2024) | Encuesta digitalización PyME 2024 |
| **PyMEs con >10% presupuesto en tech** | **55%** | Encuesta digitalización PyME 2024 |

### Contexto regulatorio como acelerador de demanda

| Regulación | Efecto en demanda | Timeline |
|-----------|-------------------|----------|
| **CORFO Programas Tecnológicos 2025** | Lanzó programa específico de "Valorización de Residuos" — señal de prioridad estatal | 2025 activo |
| **Ley REP metas 2025-2030** | Metas de reciclaje crecientes obligan a más gestoras a formalizarse | Escalonado |
| **NCG 519** | Empresas CMF deben reportar Scope 3 → clientes de gestoras necesitan certificados | Dic 2026 |
| **NDC 3.0** | Meta 40% reciclaje al 2030 → duplicar capacidad actual | 2030 |

---

## 2. ANÁLISIS DE COMPETENCIA REAL

### Mapa competitivo — Quién apunta a quién

| Competidor | Target principal | ¿Compite con CertiRecicla? | Certificados CO₂ | En Chile |
|-----------|-----------------|----------------------------|-------------------|----------|
| **Recylink** | Empresas grandes (mining, retail, construcción) | Indirecto — target diferente | No específicamente | Sí — $2.4M ARR, 22 personas |
| **Circular Waste** (cwaste.cl) | Generadores + valorizadores (marketplace) | Indirecto — marketplace, no gestión | No | Sí — 100+ empresas |
| **Reciclapp** | Consumidores (B2C recolección) | No | No | Sí — 132 ciudades LATAM |
| **Kyklos** | Empresas grandes (consultoría + servicios) | No — es consultora, no SaaS | No | Sí |
| **TriCiclos/ReSimple** | CPG companies (software de reciclabilidad de packaging) | No — producto diferente | No | Sí |
| **AMCS** | Operadores grandes municipales/industriales | No — enterprise pricing prohibitivo | No específicamente | No presente en Chile |
| **Rubicon** | Haulers EE.UU. ($190/truck/mes) | No — sin presencia LATAM | No | No |
| **Greenly** | Empresas medianas-grandes (carbon accounting) | Tangencial — solo CO₂, no gestión de residuos | Sí (genérico) | No — Europa |
| **Teixo/Teimas** (España) | Gestoras de residuos España (ERP completo) | **Competidor más similar** — pero solo en España | Parcial | No — España (900+ centros) |
| **Rebits** (rebits.cl) | Gestoras/valorizadoras en Chile | Directo parcial — trazabilidad de residuos, sin certificados CO₂ | No | Sí — startup chilena |
| **Excel + Word + WhatsApp** | **90%+ de gestoras PyME** | **SÍ — competidor real #1** | No | Ubicuo |

### Análisis detallado de los más relevantes

#### Recylink — El más financiado en Chile
- **URL:** recylink.com
- **Revenue:** USD 2.4M (2025, Getlatka)
- **Team:** 22 personas
- **Funding:** 100x Impact Accelerator, ChileGlobal Ventures, Fundación Chile, Katapult, Google for Startups
- **Target:** Empresas grandes industriales (minería, retail, construcción)
- **Features:** Trazabilidad de residuos, compliance REP, marketplace residuo-valor, 100+ tipos de residuos
- **Pricing:** No público — custom/enterprise
- **Debilidad explotable:** NO apunta a gestoras PyME. No emite certificados CO₂. Pricing enterprise inaccesible para PyMEs. No tiene cálculo GHG Protocol.

#### Teixo/Teimas (España) — El modelo a seguir
- **URL:** teimas.com/en/teixo
- **Traction:** 900+ centros en España
- **Target:** Gestoras de residuos como usuario principal
- **Features:** ERP completo, integración con e-SIR (registro español), documentos de traslado, facturación
- **Pricing:** ~€8-13 por documento procesado (transaction-based)
- **Debilidad:** Solo España. Sin presencia LATAM. Sin certificados CO₂.
- **Lección clave:** Teixo dominó España integrándose al registro obligatorio estatal (e-SIR). CertiRecicla debe hacer lo mismo con SINADER.

#### Rebits (rebits.cl) — Competidor local a monitorear
- **URL:** rebits.cl
- **Target:** Gestoras y valorizadoras de residuos en Chile
- **Features:** Trazabilidad de residuos, gestión operativa
- **Certificados CO₂:** No — foco en trazabilidad operativa, no en certificación ambiental
- **Debilidad explotable:** Sin cálculo GHG Protocol, sin certificados CO₂, sin portal para clientes generadores
- **Riesgo:** Es el competidor local más cercano en target. Monitorear si agregan certificación.

#### El verdadero competidor: Excel
- **"Pricing":** Gratis (pero cuesta 10-20 hrs/mes de trabajo administrativo)
- **Penetración:** >90% de gestoras PyME en Chile
- **Debilidades:** No escala, no genera certificados, no calcula CO₂, no cumple con exigencias crecientes de ReSimple/GRANSIC, no profesionaliza el servicio al cliente generador
- **Cómo vencer:** ROI claro en primer mes + trial gratuito + onboarding asistido

### Conclusión competitiva
**No existe competidor directo en Chile que:**
1. Apunte a la gestora como usuario principal
2. Emita certificados CO₂ con metodología GHG Protocol
3. Tenga pricing accesible para PyMEs (<USD 100/mes)
4. Se integre con SINADER

CertiRecicla tiene un **blue ocean real** en el nicho gestora-first + certificados CO₂.

---

## 3. BENCHMARKING DE PRICING

### Qué cobra el software similar

| Software | Mercado | Target | Precio | Modelo |
|----------|---------|--------|--------|--------|
| Rubicon | EE.UU. | Haulers | USD 190/truck/mes | Per asset |
| AMCS | Global | Enterprise waste ops | USD 5.000-15.000/mes | Per user/custom |
| Greenly | Europa | Carbon accounting SME | USD 317-1.000/mes (USD 3.800-12.000/año) | Flat tiers |
| Teixo | España | Gestoras | ~€8-13/documento | Transaction-based |
| SafetyCulture | Global | Compliance genérico | USD 24/user/mes | Per user |
| Intelex | Global | Environmental compliance | USD 49/user/mes | Per user |
| SaaS B2B Chile PyME (promedio) | Chile | PyMEs industriales | USD 260-1.040/mes (200K-800K CLP) | Mixto |

### WTP de PyMEs chilenas
- **Dato:** PyMEs chilenas gastan entre 200.000-800.000 CLP/mes (~USD 260-1.040) en software según estudios de digitalización 2024 (Telefonica Chile)
- **Contexto:** 98% de PyMEs chilenas planea invertir en digitalización
- **Barrera principal:** Limitaciones financieras + falta de talento técnico
- **Implicación:** USD 29-149/mes está **dentro del rango bajo** de WTP — posicionamiento correcto para early adoption

### Evaluación del pricing propuesto

| Plan | Precio propuesto | Evaluación |
|------|-----------------|------------|
| Starter USD 29/mes | **Bien posicionado** — baja fricción de entrada, pero podría ser demasiado barato para justificar soporte | ✅ Correcto para entry |
| Profesional USD 69/mes | **Sweet spot** — accesible para PyME, suficiente para cubrir costos | ✅ Plan ancla |
| Business USD 149/mes | **Correcto** para gestoras medianas con 100+ clientes | ✅ Upsell natural |

### Recomendación de pricing

**Modelo recomendado: Suscripción mensual por rango de clientes gestionados** (no por usuario, no por certificado)

```
Lanzamiento (primeros 6 meses):
├── Free Trial: 30 días, plan Profesional completo
├── Starter: USD 29/mes (hasta 15 clientes, 30 certificados/mes)
├── Profesional: USD 69/mes (hasta 60 clientes, certificados ilimitados)
└── Business: USD 149/mes (hasta 200 clientes, multi-usuario, exportación SINADER)

Post-validación (mes 7+):
├── Agregar: Enterprise cotización (SINADER API, white-label, SLA)
├── Agregar: Add-on certificados carbono verificables (+USD 20/mes)
└── Considerar: USD por certificado emitido como add-on (no como modelo base)
```

**Justificación contra modelos alternativos:**
- **Per user** → No funciona: gestoras PyME tienen 1-3 usuarios, ingreso muy bajo
- **Per certificado** → Riesgoso: penaliza al cliente por usar más el producto
- **Per cliente gestionado** → **Ganador**: alinea precio con valor (más clientes = más valor = más pago)
- **Transaction-based (tipo Teixo)** → Viable a futuro como add-on, no como modelo base en LATAM

---

## 4. PROYECCIÓN DE INGRESOS

### Asunciones base

| Variable | Conservador | Realista | Optimista |
|----------|------------|----------|-----------|
| Churn mensual | 5% | 3% | 2% |
| CAC (costo adquisición cliente) | USD 200 | USD 150 | USD 100 |
| ARPU mensual | USD 50 | USD 65 | USD 85 |
| LTV (a 24 meses) | USD 600 | USD 1.170 | USD 1.700 |
| LTV/CAC | 3.0x | 7.8x | 17.0x |
| Clientes nuevos/mes (promedio) | 2 | 3.5 | 6 |
| Conversion trial→pago | 15% | 25% | 35% |

### Proyección por escenario

#### Escenario Conservador
| Hito | Clientes activos | MRR | ARR |
|------|-----------------|-----|-----|
| Mes 6 | 8 | USD 400 | — |
| Mes 12 | 14 | USD 700 | USD 8.400 |
| Mes 18 | 20 | USD 1.000 | — |
| Mes 24 | 25 | USD 1.250 | USD 15.000 |
| Año 3 | 35 | USD 1.750 | USD 21.000 |

#### Escenario Realista
| Hito | Clientes activos | MRR | ARR |
|------|-----------------|-----|-----|
| Mes 6 | 12 | USD 780 | — |
| Mes 12 | 25 | USD 1.625 | USD 19.500 |
| Mes 18 | 40 | USD 2.600 | — |
| Mes 24 | 55 | USD 3.575 | USD 42.900 |
| Año 3 | 80 | USD 5.200 | USD 62.400 |

#### Escenario Optimista
| Hito | Clientes activos | MRR | ARR |
|------|-----------------|-----|-----|
| Mes 6 | 20 | USD 1.700 | — |
| Mes 12 | 42 | USD 3.570 | USD 42.840 |
| Mes 18 | 65 | USD 5.525 | — |
| Mes 24 | 90 | USD 7.650 | USD 91.800 |
| Año 3 | 140 | USD 11.900 | USD 142.800 |

### Hitos de clientes necesarios

| Milestone financiero | Clientes necesarios (a ARPU USD 65) |
|---------------------|--------------------------------------|
| MRR USD 1.000 (ramen profitability) | 16 clientes |
| MRR USD 5.000 (primer empleado) | 77 clientes |
| MRR USD 10.000 (equipo pequeño) | 154 clientes |
| ARR USD 100.000 (venture-ready) | 128 clientes |

---

## 5. CANALES DE ADQUISICIÓN

### Canales validados para B2B ambiental en Chile

| Canal | CAC estimado | Escala | Timing |
|-------|-------------|--------|--------|
| **Venta directa a ANIR members** | USD 100-200 | Baja (75 instalaciones) | Inmediato |
| **Referral de gestoras a gestoras** | USD 0-50 | Media | Mes 3+ |
| **LinkedIn outbound** | USD 150-300 | Media | Inmediato |
| **Content SEO** ("certificados CO₂ reciclaje", "declaración SINADER") | USD 50-100 (largo plazo) | Alta | Mes 6+ |
| **FISA Green Expo** (feria sustentabilidad) | USD 300-500 por lead | Baja-Media | Anual |
| **ChileCompra** (licitaciones públicas) | USD 500+ | Baja | Largo plazo |
| **Alianza con ReSimple/GRANSIC** | USD 0 (partnership) | Alta si se logra | Mes 6+ |
| **Webinars "Cómo cumplir Ley REP sin Excel"** | USD 100-200 | Media | Mes 2+ |

### ANIR como canal clave
- ANIR es la **única asociación gremial** del sector reciclaje en Chile
- Cubre: aceites, baterías, biomasa, cartón, residuos sanitarios, orgánicos, papel, plásticos, metales, neumáticos, vidrio
- Participa en: Mesa Ejecutiva de Productividad CORFO, Mesa Público-Privada de Economía Circular MMA
- **Oportunidad:** Ser "software recomendado" de ANIR o patrocinar sus eventos anuales
- **No tiene directorio público** de socios — contactar directamente anir.cl

### Eventos relevantes 2025-2026

| Evento | Fecha | Ubicación | Relevancia |
|--------|-------|-----------|------------|
| FISA Green Expo | Nov 2025 (estimado) | Santiago | Alta — pabellón dedicado a economía circular |
| EXPONOR | Jun 8-11, 2026 | Antofagasta | Media — ángulo minería circular |
| ENEXPRO | Ago 26-28, 2025 | Antofagasta/Santiago/Concepción | Media — exportación de servicios |
| Eventos ANIR anuales | Varía | Santiago | Alta — acceso directo a gestoras |

### Recomendación: Freemium vs Trial
**Trial de 30 días (plan Profesional completo) > Freemium**

Razón: Las gestoras PyME necesitan ver valor completo rápido. Un plan free limitado no demuestra el ROI. Un trial de 30 días con onboarding personalizado (15 min Zoom) convierte mejor en este segmento.

---

## 6. RIESGOS Y AMENAZAS REALES

### Riesgo 1: MMA/SINADER agrega certificados CO₂
- **Probabilidad:** Baja a mediana (2-4 años)
- **Análisis:** SINADER es un sistema de declaración de residuos, no de certificación ambiental. Agregar cálculo CO₂ con metodología GHG Protocol requiere expertise que el MMA no tiene internamente. La tendencia global es que gobiernos usan registros y el sector privado provee herramientas de valor agregado.
- **Mitigación:** Posicionarse como complemento de SINADER (no competidor). Ofrecer exportación SINADER como feature. Si el gobierno agrega algo básico, CertiRecicla será la capa profesional encima.

### Riesgo 2: Recylink o Reciclapp pivotan al nicho gestora
- **Probabilidad:** Baja-media
- **Análisis:** Recylink está enfocado en enterprise ($2.4M ARR, 22 personas) — bajar a PyME sería un downgrade estratégico. Reciclapp es B2C. Ninguno tiene certificados CO₂ con GHG Protocol.
- **Mitigación:** Velocidad de ejecución. Primeros 6 meses son clave para establecer marca en el nicho.

### Riesgo 3: Actor global (AMCS, Teixo) entra a Chile
- **Probabilidad:** Baja (1-3 años)
- **Análisis:** AMCS no tiene presencia documentada en LATAM. Teixo domina España pero no ha expandido. El mercado chileno es pequeño para justificar localización de un player global.
- **Mitigación:** Integración profunda con regulación local (SINADER, Ley REP) crea moat que globals no pueden replicar rápido.

### Riesgo 4: Regulatorio
- **Probabilidad:** Media (cambios regulatorios son constantes)
- **Análisis:** Los cambios regulatorios (NCG 519, NDC 3.0, Ley Marco de Cambio Climático) son **tailwinds, no headwinds**. Todos empujan hacia más compliance = más demanda.
- **Riesgo real:** Que los plazos de implementación de Ley REP se pospongan (reduciendo urgencia).

### Riesgo 5: Churn alto por falta de product-market fit
- **Probabilidad:** Media-alta en primeros 6 meses
- **Análisis:** El mayor riesgo es que las gestoras PyME no perciban valor suficiente para pagar mensualmente.
- **Mitigación:** Piloto gratuito con 5-10 gestoras, iterar basado en feedback antes de cobrar.

---

## 7. OPORTUNIDADES OCULTAS

### Subsidios y fondos disponibles

| Programa | Monto | Estado | Fit con CertiRecicla |
|----------|-------|--------|---------------------|
| **CORFO Semilla Inicia** | Hasta $15-17M CLP (~USD 17K) | Activo — cierre 18 dic 2025 | Alto — requiere <18 meses, cero ventas |
| **Start-Up Chile** | USD 15.000-100.000 + visa | Activo — cierre 28 nov 2025 | Alto — acepta cleantech |
| **CORFO SSAF Desafíos** | Hasta $15M CLP por idea | Activo | Alto — track "Cambio Climático y Sustentabilidad" |
| **Startup Ciencia (ANID)** | Varía | Cierre 10 sept 2025 | Medio — requiere base científica/tecnológica |
| **FIC-R Regional** | Varía por región (ej. $3.5B CLP en Valparaíso) | Activo 2025 | Medio — vía gobierno regional |
| **BID Lab** | Varía | Activo | Medio — para etapas más avanzadas |

### Mercados de carbono voluntarios

| Oportunidad | Detalle | Potencial |
|-------------|---------|-----------|
| **Verra (VCS)** | Acepta proyectos de reciclaje/residuos. 70-80% del mercado voluntario. | Alto |
| **Gold Standard** | Acepta residuos con énfasis en SDGs. | Alto |
| **Precio créditos 2025** | Promedio USD 6.34/ton; alta calidad USD 14.80/ton | Los certificados de CertiRecicla podrían tener valor de USD 5-15/tonCO₂ |
| **Chile SCE** | 4.4M tonCO₂ compensadas en 2024 (~USD 22M). Reciclaje no explícitamente confirmado como elegible — requiere verificación con MMA. | Potencial medio-alto si se confirma |
| **Precio social carbono Chile** | USD 71.1/tonCO₂ (2025, CEPAL) — en aumento hacia USD 264/ton para 2050 | Valida tendencia de precio al alza |

**Oportunidad concreta:** Si CertiRecicla puede emitir certificados que cumplan estándar Verra o Gold Standard, las gestoras podrían **monetizar** esos certificados vendiéndolos en mercado voluntario. Esto transforma CertiRecicla de "herramienta de compliance" a "generador de ingresos" para la gestora.

### Segmentos adyacentes no explorados

1. **Gestoras de residuos peligrosos** — mismo dolor, regulación más estricta (SMA fiscaliza), mayor WTP
2. **Cooperativas de recicladores base** — ReSimple trabaja con 17, necesitan formalización + certificados
3. **Municipalidades** — gestión de puntos limpios, reportería ambiental
4. **Consultoras ambientales** — necesitan herramientas para sus clientes gestoras
5. **GRANSIC (sistemas de gestión colectiva)** — ReSimple, Msur, PROREP necesitan datos de sus gestoras contratadas

### NCG 519 como acelerador (efectiva 31 dic 2026)
- Obliga a empresas reguladas por CMF a reportar emisiones Scope 1, 2 y (si material) Scope 3
- Las gestoras que provean a empresas CMF-reguladas **necesitarán** certificados verificables
- Esto convierte los certificados CO₂ de CertiRecicla en **necesidad regulatoria** para los clientes de las gestoras

---

## 8. RECOMENDACIÓN ESTRATÉGICA FINAL

### Los 3 movimientos más importantes en los próximos 90 días

**1. Piloto con 5 gestoras en Coquimbo/La Serena (Semanas 1-8)**
- Identificar 10 gestoras en la región vía contacto directo + ANIR
- Ofrecer acceso gratuito por 60 días a cambio de feedback semanal
- Objetivo: 5 gestoras activas usando el producto, 3 testimonios escritos
- KPI: ¿la gestora emite al menos 1 certificado real a un cliente real?

**2. Postular a CORFO Semilla Inicia (Semanas 1-4)**
- Deadline: 18 diciembre 2025
- Monto: hasta $17M CLP
- Requisito: <18 meses, cero ventas (estás en rango)
- Usar este análisis como base del plan de negocios

**3. Construir integración SINADER (Semanas 4-12)**
- La exportación de datos compatible con SINADER es el feature #1 que diferencia
- Teixo dominó España con la integración a e-SIR — replicar esa estrategia
- Esto convierte a CertiRecicla de "nice to have" a "must have" para gestoras que declaran mensualmente

### Segmento de enfoque (80% de la energía)

> **Gestoras PyME formales de reciclaje en Chile (300-500 empresas) que:**
> - Están registradas en SINADER
> - Tienen 10-100 clientes generadores
> - Declaran mensualmente al MMA
> - Hoy usan Excel + Word para todo
> - Necesitan certificados para cumplir con exigencias de ReSimple/GRANSIC o clientes corporativos

**NO perseguir todavía:** gestoras grandes (ya tienen sistemas), informales (no pagan software), generadores (ese es el mercado de Recylink/CWaste), mercado internacional.

### Pricing de lanzamiento recomendado

```
Trial:       30 días gratis (plan Profesional completo + onboarding 15 min)
Starter:     USD 29/mes — hasta 15 clientes, 30 certificados/mes
Profesional: USD 69/mes — hasta 60 clientes, certificados ilimitados ← PLAN ANCLA
Business:    USD 149/mes — hasta 200 clientes, multi-usuario, export SINADER
```

Early adopter: 50% descuento por 6 meses para las primeras 20 gestoras que paguen.

### La métrica más importante en fase de tracción

> **Certificados emitidos y enviados por gestora por mes**

No MRR, no churn, no NPS. Si las gestoras están **emitiendo certificados reales a sus clientes reales**, todo lo demás viene: retención, WOM, upsell. Si no emiten certificados, nada más importa.

---

## TABLA RESUMEN DE UNA PÁGINA

| Dimensión | Dato clave |
|-----------|-----------|
| **Gestoras Chile (verificado MMA)** | 54 valorizadoras verificadas; 1.500-2.500 totales estimadas; ~500 PyMEs target |
| **GRANSIC Chile** | 4 sistemas: ReSimple (31 gestoras), GIRO (194 productores), ProREP (25), CampoLimpio |
| **Gestoras Perú** | 1.067 EO-RS registradas (MINAM) + 522 infraestructuras valorización (OEFA) |
| **Gestoras Colombia** | 306+ empresas en SUI; Decreto 670/2025 recién formaliza REP |
| **TAM Chile** | USD 1.57M/año |
| **SAM Chile** | USD 414K/año |
| **SOM Año 1** | USD 9.9K/año (15 clientes) |
| **SOM Año 3** | USD 62.4K-142.8K/año (80-140 clientes) |
| **TAM LATAM** | ~USD 5.2M/año |
| **Competidor directo #1** | Excel + Word + WhatsApp (90%+ del mercado) |
| **Competidor SaaS más similar** | Teixo (España, 900+ centros) — no presente en LATAM |
| **Recylink (Chile, $2.4M ARR)** | Target diferente (enterprise), no certificados CO₂ |
| **Pricing recomendado** | USD 29 / 69 / 149 por mes (por clientes gestionados) |
| **ARPU target** | USD 65/mes |
| **Clientes para MRR $1K** | 16 |
| **Clientes para ARR $100K** | 128 |
| **CAC estimado** | USD 100-200 |
| **LTV estimado (24 meses)** | USD 1.170 |
| **LTV/CAC** | 5.9x-11.7x |
| **Churn esperado** | 3-5% mensual |
| **Fondo inmediato** | CORFO Semilla Inicia ($17M CLP, cierre dic 2025) |
| **Fondo alternativo** | Start-Up Chile (USD 15-100K, cierre nov 2025) |
| **Oportunidad carbono** | Créditos voluntarios USD 6-15/tonCO₂ (Verra/Gold Standard) |
| **Regulación aceleradora** | NCG 519 (ESG obligatorio dic 2026), NDC 3.0 (metas reciclaje 40% al 2030) |
| **Métrica #1 a optimizar** | Certificados emitidos/enviados por gestora por mes |
| **Primer movimiento** | Piloto con 5 gestoras en Coquimbo + postular CORFO Semilla Inicia |

---

### Datos que NO pude verificar (honestidad)

1. **Número exacto de gestoras en RETC/SINADER** — no hay registro público centralizado. Mejor dato: 54 valorizadoras (estudio MMA)
2. **Porcentaje de gestoras que son PyME** — no hay encuesta disponible
3. **Adopción de software en gestoras vs Excel** — no hay estudio sectorial
4. **Elegibilidad específica de reciclaje en Chile SCE** — requiere consulta al MMA
5. **Directorio de socios ANIR** — no público
6. **Pricing exacto de Recylink** — no publicado (custom quotes)
7. **Rebits.cl — tracción y pricing** — no hay datos públicos de ARR, clientes o pricing
8. **Perú: datos actualizados post-2022** — el dato de 1.067 EO-RS es de enero 2022, podría haber crecido

**Recomendación:** Para CORFO, citar "54 empresas de valorización verificadas por MMA" como dato duro + "estimación de 1.500-2.500 gestoras activas" con fuente triangulada (ANIR + GRANSIC + centros reciclaje). Solicitar dato formal al MMA como parte del proyecto.
