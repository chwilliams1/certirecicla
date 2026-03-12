# Evaluacion: Migracion de contenido blog a MDX

**Fecha:** 2026-03-12
**Estado actual:** Contenido almacenado como strings HTML en TypeScript (content-part1.ts, content-part2.ts)
**Stack:** Next.js 14.2, TypeScript, Tailwind CSS + @tailwindcss/typography

---

## Estado actual

```
src/lib/blog/
  articles.ts       → Metadatos (slug, title, keywords, date, etc.)
  content.ts         → Agregador que importa parts y exporta getArticleContent()
  content-part1.ts   → 4 articulos (~530 lineas de HTML en template literals)
  content-part2.ts   → 6 articulos (~650 lineas de HTML en template literals)
```

**Problemas del enfoque actual:**
1. HTML embebido en TypeScript = sin syntax highlighting, dificil de editar
2. Archivos crecen linealmente — cada 4-5 articulos necesitan un nuevo `content-partN.ts`
3. No-devs no pueden contribuir contenido
4. No hay frontmatter estandar — metadatos separados del contenido
5. No se puede reusar componentes interactivos dentro del contenido

---

## Opcion A: MDX con next-mdx-remote (Recomendada)

### Como funciona
- Articulos como archivos `.mdx` en `src/content/blog/`
- Frontmatter YAML con metadatos (titulo, keywords, fecha, etc.)
- Contenido en Markdown con componentes React embebidos
- `next-mdx-remote` compila MDX en el servidor (compatible con App Router)

### Estructura propuesta
```
src/content/blog/
  que-es-certificado-de-reciclaje.mdx
  ley-rep-chile-guia-completa.mdx
  ...

src/lib/blog/
  mdx.ts              → Funciones para leer, parsear y listar articulos
  components.ts        → Componentes custom para MDX (Callout, Table, CTA)

src/app/blog/
  [slug]/page.tsx      → Renderiza MDX con next-mdx-remote
```

### Ejemplo de articulo MDX
```mdx
---
title: "Que es un certificado de reciclaje"
description: "Guia completa..."
date: "2026-03-01"
updatedDate: "2026-03-12"
readingTime: 8
category: "Certificados"
keywords:
  - certificado de reciclaje
  - certificado de valorizacion
---

## Que es un certificado de reciclaje?

Un **certificado de reciclaje** es un documento oficial...

<Callout type="info">
  En Chile, la Ley REP exige trazabilidad verificable.
</Callout>

| Material | Factor CO2 |
|----------|-----------|
| Carton   | 0.95      |

<CalculadoraCta />
```

### Paquetes necesarios
```bash
npm install next-mdx-remote gray-matter
```

### Pros
- Markdown es editable por cualquiera (no-devs, copywriters)
- Frontmatter + contenido en un solo archivo
- Componentes React dentro del contenido (CTAs, calculadoras, tablas interactivas)
- Syntax highlighting nativo en editores
- Compatible con CMS headless futuro (Contentlayer, Keystatic, Notion)
- Facil de migrar — cada articulo se convierte individualmente

### Contras
- Requiere migrar 15 articulos existentes (2-3 horas de trabajo)
- next-mdx-remote tiene overhead de compilacion (minimo en SSG)
- Configuracion inicial de mdx.ts (~50 lineas)

### Esfuerzo estimado
- Setup inicial: 1-2 horas
- Migracion de 15 articulos: 2-3 horas
- Total: ~4 horas

---

## Opcion B: @next/mdx (plugin oficial)

### Como funciona
- Configura next.config.mjs para tratar `.mdx` como paginas
- Cada `.mdx` en `src/app/blog/` se convierte en una ruta

### Pros
- Cero dependencias extra (viene con Next.js)
- Paginas MDX son automaticamente rutas

### Contras
- Frontmatter requiere workarounds
- Menos flexible que next-mdx-remote para contenido dinamico
- No soporta bien `generateStaticParams` ni metadata dinamica
- Dificil de mantener lista de articulos para el index

**Veredicto:** No recomendada para blogs con listado dinamico.

---

## Opcion C: CMS Headless (Contentlayer / Keystatic / Notion)

### Pros
- UI visual para editar contenido
- Validacion de schema
- Colaboracion multi-usuario

### Contras
- Dependencia externa
- Contentlayer esta semi-abandonado
- Keystatic requiere configuracion significativa
- Notion API tiene latencia y limites de rate
- Overengineering para 15-30 articulos

**Veredicto:** Considerar cuando haya +50 articulos o multiples editores.

---

## Recomendacion

**Migrar a MDX con next-mdx-remote cuando lleguen a 20+ articulos.**

Por ahora (15 articulos), el sistema actual funciona. La prioridad es:

1. **Corto plazo (ahora):** Seguir con TypeScript + HTML, pero crear `content-part3.ts` para nuevos articulos
2. **Mediano plazo (20+ articulos):** Migrar a MDX con next-mdx-remote
3. **Largo plazo (50+ articulos o equipo editorial):** Evaluar CMS headless

### Trigger para migrar
- Mas de 20 articulos
- Un no-dev necesita editar contenido
- Necesidad de componentes interactivos dentro de articulos
- Cualquiera de estos triggers justifica las ~4 horas de migracion

---

## Pasos de migracion cuando sea el momento

1. `npm install next-mdx-remote gray-matter`
2. Crear `src/content/blog/` con archivos `.mdx`
3. Crear `src/lib/blog/mdx.ts` con funciones de lectura/parseo
4. Migrar `[slug]/page.tsx` para usar MDX renderer
5. Crear componentes MDX custom (Callout, CTA, Table)
6. Convertir cada articulo: extraer frontmatter + convertir HTML a Markdown
7. Eliminar `content-part*.ts` y `articles.ts`
8. Actualizar `blog/page.tsx` para listar desde archivos MDX
