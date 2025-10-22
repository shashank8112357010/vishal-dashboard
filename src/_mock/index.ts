import { setupWorker } from "msw/browser";

// All mock handlers removed - using real backend for all APIs
// MSW worker kept for development mode but with no handlers
const handlers: never[] = [];
const worker = setupWorker(...handlers);

export { worker };
