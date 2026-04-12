import { AsyncLocalStorage } from "node:async_hooks";
import { RequestContext } from "./types";

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}
