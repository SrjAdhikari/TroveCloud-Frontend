//* tests/server.ts

import { setupServer } from "msw/node";
import handlers from "./handlers";

/**
 * Shared MSW node server instance used across the test suite. `setup.ts`
 * starts it before all tests and tears it down after; individual tests
 * register per-test handlers via `server.use(...)`.
 */
const server = setupServer(...handlers);

export default server;
