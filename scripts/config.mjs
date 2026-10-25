import { readFile } from "node:fs/promises";
import vm from "node:vm";
export const dist = new URL("../dist/", import.meta.url);
export async function readConfig() {
  const context = vm.createContext({ window: {} });
  vm.runInContext(await readFile(new URL("config.js", dist), "utf8"), context, { timeout: 1000 });
  return context.window.WEDDING_CONFIG;
}
