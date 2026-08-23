# ShadowLab

> A multi-layer CSS `box-shadow` builder with live preview and copy-ready output.

**[Live demo](https://su-shadowlab.vercel.app)**

Good shadows are almost never a single `box-shadow` value — they are two or three stacked layers with different blurs and opacities. ShadowLab gives each layer its own collapsible panel of sliders (X, Y, blur, spread, opacity, color, inset), stacks up to five of them, and renders the combined result live on a preview card. The generated CSS is shown as you edit and copies to the clipboard in one click, and ShadowLab also checks the output against Tailwind's built-in shadow scale so you know when a plain utility class would do the job instead.

## Features

- Up to 5 independent shadow layers, each with X/Y offset, blur, spread, opacity, hex color, and an inset toggle
- 10 named presets — Subtle, Medium, Strong, Floating, Inset, Neon Glow, Layered, Material, Sharp, and Dreamy
- Randomize button that generates 1-3 layers with random geometry and colors
- Live preview switchable between dark, light, and checkerboard-grid backgrounds
- Formatted `box-shadow` output with copy-to-clipboard
- Tailwind matcher that identifies when the current value is an exact match for `shadow-sm` through `shadow-2xl` or `shadow-inner`

## Stack

- Next.js 16 (App Router) with React 19, TypeScript, and Tailwind CSS v4
- Entirely client-side — no API routes, no persistence, no external services

## Running locally

```bash
npm install
npm run dev
```

---

Part of a series of 90 small web apps. [Browse them all](https://su-slopmachine.vercel.app).
