import "server-only";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { dataDir } from "./data-dir";

/**
 * Writes JSON so a reader never sees a half-written file: to a temp file, then renamed over.
 * On Windows the rename fails while another request has the file open, so it's retried
 * briefly and, as a last resort, the file is written in place.
 */
export async function writeJsonFile(file: string, data: unknown, options: { private?: boolean } = {}) {
  await mkdir(path.dirname(file), { recursive: true });
  const body = JSON.stringify(data, null, 2);
  const mode = options.private ? 0o600 : undefined;
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, body, { mode });
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await rename(tmp, file);
      return;
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code !== "EPERM" && code !== "EBUSY" && code !== "EACCES") throw err;
      await new Promise((r) => setTimeout(r, 50 * (attempt + 1)));
    }
  }
  await writeFile(file, body, { mode });
  await unlink(tmp).catch(() => {});
}

/**
 * One JSON file in the data folder. Until the admin panel saves it the first time,
 * read() returns the defaults written in lib/ (so the site works out of the box).
 */
export function jsonStore<T>(name: string, defaults: () => T) {
  const file = () => path.join(dataDir(), name);
  return {
    file,
    async read(): Promise<T> {
      try {
        return JSON.parse(await readFile(file(), "utf8")) as T;
      } catch {
        return defaults();
      }
    },
    async write(value: T) {
      await writeJsonFile(file(), value);
    },
  };
}
