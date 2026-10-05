import "server-only";
import path from "node:path";

/**
 * The folder for everything the owner adds from the admin panel: settings, categories,
 * brands, questions, photos, requests, the trash and backups. It's outside the app folder
 * (DATA_DIR, or "mackine-data" next to it) so a new deploy never wipes it.
 */
export function dataDir() {
  return process.env.DATA_DIR || path.resolve(process.cwd(), "..", "mackine-data");
}
