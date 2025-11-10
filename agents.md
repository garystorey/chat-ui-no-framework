# Development Guide

## 1. Introduction

**Purpose:**

Define standards and practices for writing reliable, maintainable, and accessible client-side code, with a strong preference for TypeScript.

**Scope:**

Covers modules, coding standards, async patterns, DOM interaction, accessibility, performance, testing, and security for browser-based applications.

**Audience:**

Frontend developers, reviewers, QA, and tech leads.

**References:**

- ECMAScript Language Spec (ES202x)  
- TypeScript Handbook  
- MDN Web Docs (APIs, DOM, Web Platform)  
- WAI-ARIA Authoring Practices  

---

## 2. Core Principle

**Rule 0: Prefer TypeScript.**

- Write new code in **TypeScript** (`.ts` / `.tsx`).  
- Enable **strict mode** (`"strict": true` in `tsconfig.json`).  
- If plain JS is unavoidable, add **JSDoc types** and enable `@ts-check`.  

---

## 3. Project Structure

- `src/` → application code by domain/feature  
- `src/utils/` → shared utilities (pure functions, no DOM side effects)  
- `src/components/` → UI components
- `src/hooks/` → React hooks (for React projects)
- `src/features/` → UI features
- `src/types/` → custom types and interfaces
- `tests/` → unit and integration tests mirroring `src`  

Use **ES modules**. Prefer **named exports** for utilities and components.

---

## 4. Coding Standards

- Use `const` by default; `let` when reassignment is required; never `var`.  
- Use strict equality (`===` / `!==`).  
- Prefer immutability (copy, don’t mutate).  
- camelCase for variables and functions.  
- PascalCase for classes and types.  
- No `any` in production; use `unknown` with narrowing.  
- Model API payloads with **types and runtime validation**.  
- Prefer a validation library like Zod, Valibot or ArkType over standard validation.
- ESLint + Prettier or Biome enforced in CI.  
- Prefer types over interfaces.  Use interface when client facing or creating a library.
- Extend from base line elements when possible.

---

## 5. Modules, Dependencies, and Boundaries

- Keep **pure utilities** (`utils/`) separate from **side-effectful code** (DOM, network).  
- Wrap third-party libraries in **adapters** to isolate change.  
- Prefer **native Web APIs** before adding dependencies.  

---

## 6. Async, Data Fetching, and Cancellation

- Use `async/await` with `try/catch`.  
- Support **cancellation** with `AbortController`.  
- Use **timeouts** to prevent indefinite requests.  
- Distinguish timeout, abort, and HTTP errors.  
- Honor caller-provided signals; make timeout configurable.  

---

## 7. DOM, Events, and Accessibility

- Use **event delegation** for dynamic content.  
- Never use `innerHTML` with untrusted content.  
- Manage **focus** explicitly on dialogs, modals, and navigation changes.  
- Keep ARIA attributes in sync with state (`aria-expanded`, `aria-hidden`, etc.).  

---

## 8. Errors, Logging, and User Feedback

- Fail fast in development; fail gracefully in production.  
- Centralize error handling and logging.  
- Provide user-friendly messages; never expose internals.  
- Do not swallow errors silently.  

---

## 9. Performance

- Batch DOM reads/writes to avoid layout thrashing.  
- Debounce/throttle event handlers.  
- Use lazy loading and code splitting.  
- Memoize hot-path computations when justified.  

---

## 10. Security

- Treat all external input as untrusted.  
- Escape or sanitize before inserting into DOM.  
- Never use `eval`, `Function`, or dynamic code execution.  
- Enforce CSP; avoid inline scripts.  
- Do not leak sensitive information in logs or errors.  

---

## 11. Testing

- Write **unit tests** for utilities.  
- Write **integration tests** for DOM interactions.  
- Use **E2E tests** for flows (e.g., Playwright).  
- Assert accessibility (focus, ARIA states) in tests.  

---

## 12. Tooling & Configuration

- `tsconfig.json`: strict mode and safe compiler options.  
- ESLint: enforce TypeScript rules, no-floating-promises.  
- Prettier: consistent formatting.
- Alternatively, use Biome for linting and formatting.
- CI: run typecheck, lint, test, and bundle-size checks.  

---

## 13. Governance & Review

- PRs must pass typecheck, lint, and tests.  
- Reviewers enforce TypeScript-first and proper module boundaries.  
- Major design changes (API contracts, state management) require architecture review.  

## 1. CSS Introduction

**Purpose:**

This guide defines standards and practices for writing consistent, scalable, and maintainable CSS.

**Scope:**

Applies to all styling in projects that use plain CSS, regardless of whether a preprocessor or framework is later introduced.

**Audience:**

Frontend developers, UX designers, and QA engineers.

**References:**

- [MDN CSS Reference](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [W3C CSS Standard](https://www.w3.org/Style/CSS/)
- [WCAG 2.1 Accessibility Guidelines](https://www.w3.org/TR/WCAG21/)

---

## 2. System Overview

CSS provides the **presentation layer** for web applications. It controls visual design, layout, and responsiveness while keeping structure (HTML) and behavior (JS) separate.

---

## 3. Design Principles & Goals

- **Separation of concerns:** Keep HTML semantic and CSS focused only on styling.
- **Maintainability:** Ensure CSS is easy to read, debug, and refactor.
- **Consistency:** Use a unified style system (design tokens/variables).
- **Performance:** Minimize unused CSS; avoid overly deep selector nesting.
- **Accessibility:** Maintain contrast ratios, readable text, and visible focus indicators.
- **Responsiveness:** Mobile-first design that scales up gracefully.

---

## 4. Architecture & Patterns

### 4.1 CSS Organization

Use a **modular structure**:

- `base/` → resets, global styles, typography
- `components/` → buttons, forms, cards
- `layouts/` → grids, flex containers, wrappers
- `utils/` → helpers like `.visually-hidden`, `.sr-only`
- when using a framework, refer to the framework document for more precise information.

### 4.3 Layout Patterns

- Use **Flexbox** for one-dimensional layouts (navbars, toolbars, alignment).
- Use **CSS Grid** for two-dimensional layouts (page grids, dashboards).
- Avoid table-based layouts for non-tabular data.

### 4.4 Responsive Design

- **Mobile-first:** Start with base styles; enhance with min-width media queries.
- Prefer **responsive units** (`rem`, `em`, `%`, `vh`, `vw`, `ch`). Use `px` only when the value is **< 8px** (e.g., 1px borders).
- Define standard breakpoints (example—adjust to your design system):

```css
@media (min-width: 36rem) { /* ~576px if root is 16px */ }
@media (min-width: 48rem) { /* ~768px */ }
@media (min-width: 62rem) { /* ~992px */ }
@media (min-width: 75rem) { /* ~1200px */ }
```

### 4.5 Theming & Variables

- Use **CSS Custom Properties** for design tokens:
- Use `background-color` for single-property color application. Use `background` **only** for true shorthand cases (e.g., image + position + size).
- Ensure light-dark() settings are set.
- Ensure system settings for dark light mode are enforced.

```css
:root {
  --color-primary: #1e90ff;
  --color-secondary: #ff9800;
  --color-surface: #ffffff;
  --color-text: #333333;
  --color-background: #f7f7f8;

  --font-family-base: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-size-base: 1rem;
  --line-height-base: 1.5;

  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 1rem;     /* 16px */
  --radius-1: 0.25rem; /* 4px */
}
```

---

## 5. Coding Standards & Guidelines

- **Indentation:** 2 spaces.
- **Selectors:** Prefer classes; avoid IDs for styling. Keep selectors short and intention-revealing (`.nav-item`, not `header ul li a`).
- **Specificity:** Keep specificity low; never use `!important` unless specifically directed. Otherwise, use modern CSS techniques to manage specificity.
- **Property order (recommended):** layout → box-model → typography → visual → effects → transitions.
- **Units:**  
  - Use **responsive units by default** (`rem`, `em`, `%`, `vh`, `vw`, `ch`).  
  - Use `px` **only** when the value is **under 8px** (e.g., borders, hairlines, fine shadows).  
  - Use **unitless** `line-height` for readability and scaling.
- **Background properties:**  
  - Use `background-color` when setting only color.  
  - Use `background` shorthand **only** when combining multiple properties.
- **Comments:** Document intent and non-obvious decisions with concise comments.
- Always prefer modern CSS syntax.

Example ordering and units:

```css
.card {
  display: grid;                            /* layout */

  max-width: 40rem;                         /* box-model */
  padding: var(--space-3);
  border-radius: var(--radius-1);

  color: var(--color-text);                 /* typography */
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);

  background-color: var(--color-surface);   /* visual */
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.08);

  transition: box-shadow 150ms ease;        /* effects/transitions */
}
```

---

## 6. UI/UX Guidelines

- **Contrast:** Maintain at least 4.5:1 for body text; 3:1 for large text.
- **Focus:** Always provide visible focus states for interactive elements.
- **Color semantics:** Don’t rely solely on color to convey meaning; use icons/labels.
- **Color tokens:** All colors in component CSS **must come from tokens** (`--color-*`). Do not use raw hex, RGB, or HSL values in component styles.
- **Typography:** Use a consistent scale (`h1` > `h2` > `h3`), unitless line-height `1.4–1.6`.
- **Spacing:** Use tokenized spacing (`--space-*`) in `rem`. Avoid arbitrary one-off values.

---

## 7. Non-Functional Requirements

- **Performance:** Remove unused CSS (e.g., build-time purging). Keep critical CSS lean.
- **Accessibility:** Adhere to WCAG 2.1 AA for contrast and focus as a strict minimum. Strive for AAA where possible.
- **Scalability:** New components must compose existing tokens without redefining globals.

---

## 8. Tooling & Environment

- **Linters:** Stylelint with a shared config (naming conventions, unit rules).
- **Formatter:** Prettier (respecting CSS formatting).
- **Testing:** Cross-browser (Chrome, Firefox, Safari, Edge). Use responsive mode in dev tools.
- **Debugging:** Use dev tools for Grid/Flex overlays and accessibility checks.

---

## 9. Governance & Review

- **Code review:** Validate naming, specificity, token usage, accessibility.
- **Documentation:** Each component should include examples/states (default, hover, active, disabled, focus).
- **Change control:** Token changes (colors, spacing, typography) require design sign-off.

---

## 10. Appendices

### Example Base CSS

```css
/* Base & tokens */
:root {
  --color-primary: #1e90ff;
  --color-secondary: #ff9800;
  --color-surface: #ffffff;
  --color-text: #333333;
  --color-background: #f7f7f8;

  --font-family-base: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-size-base: 1rem;
  --line-height-base: 1.5;

  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 1rem;     /* 16px */
  --radius-1: 0.25rem; /* 4px */
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  /* Users can change base size; rem scales accordingly */
  font-size: 100%;
}

body {
  margin: 0;
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  color: var(--color-text);
  background-color: var(--color-background);
}

/* Layout container */
.container {
  width: min(100%, 72rem);
  margin-inline: auto;
  padding-inline: var(--space-3);
}

/* Button component */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);

  padding: calc(var(--space-1) + 0.125rem) var(--space-3);
  border: 0; /* borders may use px if < 8px */
  border-radius: var(--radius-1);

  font-weight: 600;
  line-height: 1;

  color: var(--color-surface);
  background-color: var(--color-primary);

  transition: filter 150ms ease;
}

.button:hover {
  filter: brightness(1.05);
}

.button:focus-visible {
  outline: 2px solid currentColor; /* 2px allowed (< 8px) */
  outline-offset: 0.125rem;
}

.button--secondary {
  background-color: var(--color-secondary);
}

/* Card component */
.card {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-1);
  background-color: var(--color-surface);
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.08);
}

/* Media utility */
.media-cover {
  /* Correct shorthand usage: multiple background properties together */
  background: url("banner.jpg") no-repeat center / cover;
}
```

## 1. HTML Introduction

**Purpose:**  
This guide defines standards and practices for writing consistent, accessible, and maintainable HTML code.  

**Scope:**  
Applies to all web pages and UI components built with HTML before layering CSS, JavaScript, or frameworks.  

**Audience:**  
Frontend developers, UX designers, QA engineers, and technical reviewers.  

**References:**

- [MDN HTML Reference](https://developer.mozilla.org/en-US/docs/Web/HTML)  
- [W3C HTML Standard](https://html.spec.whatwg.org/)  
- [WCAG 2.1 Accessibility Guidelines](https://www.w3.org/TR/WCAG21/)  

---

## 2. HTML System Overview  

The HTML layer forms the **structural foundation** of the frontend. It provides semantic meaning to content, enabling:  

- Accessibility (screen readers, assistive tech).  
- SEO optimization.  
- Consistency across browsers and devices.  

---

## 3. HTML Design Principles & Goals  

- **Semantic HTML first:** Always use the most appropriate HTML element for content.  
- **Separation of concerns:** Keep structure (HTML), presentation (CSS), and behavior (JS) distinct.  
- **Accessibility:** Follow ARIA and WCAG standards. Follow the Rules of Aria.
- **Performance:** Use minimal markup, avoid unnecessary wrappers.  
- **Maintainability:** Code should be readable, consistent, and validated.  

---

## 4. HTML Architecture & Patterns

### 4.1 Document Structure  

- Always start with a `<!DOCTYPE html>` declaration.  
- Use `<html lang="en">` to specify language.  
- Define metadata in `<head>` (title, description, charset, viewport).  
- Organize `<body>` content with semantic elements:  
  - `<header>` – site or section header  
  - `<nav>` – primary navigation  
  - `<main>` – unique page content  
  - `<section>` – grouped related content  
  - `<article>` – standalone content item  
  - `<aside>` – supplementary content  
  - `<footer>` – site or section footer  

### 4.2 Accessibility Patterns  

- Every page must have **one `<h1>`**.  
- Use headings (`<h2>…<h6>`) in **logical nesting order**.  
- Provide **alt text** for images.  
- Use **labels** with form inputs.  
- Use **landmark roles** (`role="navigation"`, `role="main"`) sparingly (only when native HTML isn’t sufficient).  

### 4.3 Common Components  

- **Navigation:** Use `<nav>` with an unordered list `<ul><li><a></a></li></ul>`.  
- **Forms:** Use `<form>`, `<label for="">`, and appropriate input types (`email`, `tel`, `date`).  Make sure descriptions are linked via aria-describedby.
- **Tables:** Use `<thead>`, `<tbody>`, `<tfoot>`, and `<th scope="col|row">`.  

---

## 5. HTML Coding Standards & Guidelines  

- **Indentation:** 2 spaces.  
- **Attributes:** Lowercase, quoted values (`<input type="text" name="username">`).  
- **IDs and classes:**  
  - IDs must be unique per page and used sparingly.
  - Classes should be meaningful (`.btn-primary` not `.blue-button`).  
- **Comments:** Use `<!-- -->` for sectioning, keep them concise.  

---

## 6. HTML UI/UX Guidelines

- **Content-first:** Use HTML that makes sense even without CSS/JS.  
- **Responsive layout base:** Use `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.  
- **Media elements:**  
  - Always provide `<track>` captions in `<video>`.  
  - Provide fallback text inside `<audio>`.  

---

## 7. HTML Non-Functional Requirements  

- **Accessibility:** Minimum WCAG 2.1 Level AA compliance while striving for AAA when possible.
- **Performance:** HTML files should be lean (minify in production).  
- **SEO:** Use semantic tags, meta descriptions, Open Graph tags.  

---

## 8. HTML Tooling & Environment

- **Validation:** Use [W3C HTML Validator](https://validator.w3.org/).  
- **Linters:** HTMLHint or built-in IDE extensions.  
- **Editor Settings:** Enforce auto-formatting (Prettier, EditorConfig).  

---

## 9. HTML Governance & Review

- **Code Review:** Validate semantic correctness and accessibility compliance.  
- **Documentation:** Each HTML template/component should include comments explaining its role.  
- **Change Management:** Updates to guidelines require review by lead developer/architect.  

---

## 10. Example Appendices  

### Example Base HTML Template  

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Frontend Development Guide Example" />
    <title>Sample Page</title>
  </head>
  <body>
    <header>
      <h1>Frontend Development Guide</h1>
      <nav>
        <ul>
          <li><a href="#principles">Principles</a></li>
          <li><a href="#patterns">Patterns</a></li>
        </ul>
      </nav>
    </header>
    <main id="content">
      <section id="principles">
        <h2>Design Principles</h2>
        <p>Use semantic HTML for clarity and accessibility.</p>
      </section>
      <section id="patterns">
        <h2>Common Patterns</h2>
        <article>
          <h3>Forms</h3>
          <form>
            <label for="email">Email:</label>
            <input id="email" type="email" name="email" required />
            <button type="submit">Submit</button>
          </form>
        </article>
      </section>
    </main>
    <footer>
      <p>&copy; 2025 Frontend Team</p>
    </footer>
  </body>
</html>
```

## 1. React Introduction

**Purpose:**

Define standards and practices for building reliable, maintainable, and accessible React applications with TypeScript.
See also: ReactComponents.md, ReactHooks.md, TypeScript.md

**Scope:**

Covers component architecture, state and data flow, routing, accessibility, styling integration, performance, testing, and security.

**Audience:**

Frontend developers, reviewers, QA, and tech leads.

**References:**

- React (current stable)
- TypeScript (strict mode)
- MDN Web Docs (Web Platform, ARIA)
- WCAG 2.1

---

## 2. Core Principles

- **Prefer TypeScript** (`.tsx`) with `"strict": true`.
- **One-way data flow**: props down, events up.
- **Functional components** + React Hooks; no class components.
- **Minimal shared state**: lift only when necessary; colocate otherwise.
- **Accessibility by default**: semantic elements, ARIA only to fill gaps.
- **Performance awareness**: render only what’s needed; measure before optimizing.

---

## 3. Example Project Structure

- `src/` → feature-oriented folders (domain first)
- `src/components/` → reusable UI components (stateless where possible)
- `src/pages/` or `src/routes/` → route-level views
- `src/hooks/` → reusable hooks (pure, framework-safe)
- `src/utils/` → pure utilities (no DOM side effects)
- `src/types/` → shared TypeScript types
- `src/styles/` → global CSS tokens/themes
- `tests/` → mirrors `src/`

**Naming:**

- Components/Hooks: PascalCase (`UserCard`), `useCamelCase` (`useUser`)
- Props/variables: camelCase
- One component per file; named exports

---

## 4. Component Standards

- Keep components **small and focused**; a component = one responsibility.
- **Props are typed** (explicit interfaces). Avoid `any`; use exact, readonly shapes.
- **Children** typing uses `PropsWithChildren` only when children are required.
- **No side effects during render**. Use effects carefully and with stable deps.
- Avoid **implicit state** in closures; rely on state setters and refs as needed.
- **Keys** are stable, deterministic, and not array indices (unless static).

---

## 5. State & Data Flow

- Prefer **local state** for UI concerns; avoid global state by default.
- **Context** sparingly for cross-cutting concerns (theme, auth session, i18n).
- For server data, prefer **fetch-on-render with suspense-ready patterns** or a thin data layer (e.g., tanstack-query/ react-query) that supports caching, revalidation, and **AbortController**.
- Derive state (don’t duplicate); compute from source when feasible.

---

## 6. Async & Data Fetching

- Use `async/await` in event handlers and custom hooks; **never** in render.
- **Cancellation** with `AbortController`; abort on unmount or param change.
- **Timeouts** are configurable; differentiate timeout, abort, and HTTP errors.
- Centralize fetch utilities in `src/utils/` (typed responses + runtime guards).
- Avoid waterfalls: parallelize independent requests; stream or paginate lists.

---

## 7. Routing & Navigation

- Route components are **thin**: compose feature components and hooks.
- Use **loader-like patterns** or dedicated hooks to fetch route data.
- Scroll/focus management: restore focus on route changes for accessibility.
- Handle **not found / unauthorized** at the routing boundary.

---

## 8. Accessibility (A11y)

- Prefer **native elements** (`button`, `a`, `label`, `input`) over divs.
- ARIA only when necessary; keep attributes **in sync with state**.
- Maintain **focus order** and **visible focus indicators**.
- Form controls have explicit labels; error text is programmatically associated. description text should be associated.
- Dynamic content announces changes (live regions) when appropriate.

---

## 9. Styling Integration

- Follow the **CSS Foundation** rules:
  - All colors via **tokens/custom properties**; no hard-coded colors in components.
  - Use `background-color` (not shorthand) unless combining properties.
  - Responsive units by default; `px` only if `< 8px`.
- Components accept **className** to allow composition/overrides.
- Avoid leaking styling details via props; prefer semantic variants (e.g., `variant="primary"`).

---

## 10. Performance

- Prevent **unnecessary re-renders**:
  - Stabilize callbacks/values passed to children (`useCallback`, `useMemo` when it measurably helps).
  - Memoize pure presentational components (`React.memo`) when hot.
- **List virtualization** for large lists; paginate where feasible.
- Defer non-critical work with `requestIdleCallback` or transitions (when applicable).
- Measure with React DevTools Profiler before optimizing.

---

## 11. Error Handling & Boundaries

- Use **error boundaries** around routes and complex trees.
- Distinguish UX errors (validation) from system errors (network).
- Provide **retry** affordances for recoverable failures.
- Log errors with context (feature, action, params), redacting sensitive data.

---

## 12. Forms

- Keep inputs **controlled** where validation and sync matter; uncontrolled is fine for simple cases.
- Validation: prefer **schema-based** (sync/async) at submit and on blur as needed (zod, valibot, ArkType, etc).
- Show inline, accessible errors; prevent submission on invalid state.
- Avoid excessive re-renders by isolating field state where appropriate.

---

## 13. Testing

- **React Testing Library** for component tests; test behavior, not internals.
- Mock network boundaries; don’t mock React APIs.
- Include accessibility assertions (roles, names, focus).
- E2E (e.g., Playwright) for critical flows and cross-page behaviors.

---

## 14. Security

- Never render unsanitized HTML; avoid `dangerouslySetInnerHTML`.
- Escape/encode untrusted data before interpolation.
- Avoid storing secrets in front-end code or environment variables shipped to clients.
- Respect CSP; avoid inline scripts and event handlers.

---

## 15. Tooling & Configuration

- TypeScript: strict mode, noImplicitOverride, exactOptionalPropertyTypes, noUncheckedIndexedAccess.
- ESLint: React + TypeScript rules; disallow `any`, floating promises, implicit `any`, unused vars.
- Prettier: consistent formatting.
- CI: typecheck, lint, test, and bundle size thresholds on PRs.

---

## 16. Governance & Review

- PRs must pass typecheck, lint, tests.
- Reviewers enforce **TypeScript-first**, accessibility, and performance guidelines.
- Introduce new dependencies only with justification (size, maintenance, need).
- Architectural changes (state model, data layer, routing) require design review.
