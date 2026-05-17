//* tests/handlers.ts

import type { HttpHandler } from "msw";

/**
 * Default MSW request handlers. Empty by design — tests register their own
 * handlers via `server.use(...)` so each test makes its HTTP expectations
 * explicit. Add a handler here only if every test would otherwise need it.
 */
const handlers: HttpHandler[] = [];

export default handlers;
