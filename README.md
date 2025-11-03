# Portfolio Web

Modern personal site built with Vite + React + TypeScript, featuring fluid motion design, Lenis smooth scrolling, 3D hero scenes, and GSAP-enhanced typography.

## Getting Started

```bash
npm install
npm run dev
```

### Core Scripts

- `npm run dev` – start the Vite dev server with HMR.
- `npm run build` – create a production build.
- `npm run preview` – preview the production output locally.
- `npm run lint` – run ESLint across the project.
- `npm run typecheck` – run the TypeScript compiler without emitting files.
- `npm run mcp:shadcn` – launch the shadcn Model Context Protocol server defined in `.vscode/mcp.json`.

## MCP Integration

- `.vscode/mcp.json` registers the `shadcn` MCP server so compatible editors can consume component metadata.
- Use `npm run mcp:shadcn` (or the command palette in supporting IDEs) to start the server when you need design-system scaffolding.
- Ensure `npx` is available in your shell (Bundled with Node.js ≥ 16).

## Animation Notes

- Section titles use a reusable `ScrollFloat` component (GSAP + ScrollTrigger) for staggered character reveals.
- Magic Bento project tiles support intensified tilt/magnetism for richer hover feedback.

Feel free to adapt these building blocks for additional sections or content.
