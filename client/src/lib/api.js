// ===========================================================================
// api.js — one place that knows where the backend is
// ---------------------------------------------------------------------------
// The frontend and the backend are deployed as two separate Render services,
// so client calls are cross-origin and need an absolute URL in production.
// That URL was written out by hand in ten different files, which has two
// costs: moving or renaming the backend means editing ten call sites and
// missing one, and nothing can be run or tested locally, because every call
// goes to the live production server no matter where the page is served from.
// A test suite that silently talks to production is worse than no test suite.
//
// Resolution order:
//   1. VITE_API_BASE, if set at build time — the escape hatch for a staging
//      backend or a renamed service, with no code change.
//   2. Same origin when the page is served from localhost — covers both the
//      Vite dev server and the Express server serving the built client.
//   3. The production backend otherwise.
//
// Production behaviour is unchanged: a page served from the Render frontend
// falls through to the same absolute URL it used before.
// ===========================================================================

const ENV_BASE = typeof import.meta !== "undefined" ? import.meta.env?.VITE_API_BASE : undefined;
const PRODUCTION_BACKEND = "https://mindfulfinance1-3-server.onrender.com";

function resolveBase() {
  if (ENV_BASE) return String(ENV_BASE).replace(/\/+$/, "");
  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    if (h === "localhost" || h === "127.0.0.1" || h === "" || h === "[::1]") return "";
  }
  return PRODUCTION_BACKEND;
}

export const API_BASE = resolveBase();

/** api("/api/response") → the full URL to call. */
export const api = (path) => `${API_BASE}${path}`;
