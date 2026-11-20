// main.ts — entry for make.fun competition news-image-20261120.
//
// Copies the finished front page (entry.png, sitting next to this file)
// into the output directory and writes a canonical build dossier
// (dossier.json) describing it. Node 22, standard library only.
//
//   MAKEFUN_OUTPUT_DIR=/some/dir node main.ts
//   # or, when MAKEFUN_OUTPUT_DIR is unset, output goes to /output
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || "/output";

/** Canonical dossier bytes for this build (sorted keys, stable text). */
export function buildDossier(): Uint8Array {
  const png = readFileSync(join(HERE, "entry.png"));
  const dossier = {
    bytes: png.length,
    competition: "news-image-20261120",
    entry: "entry.png",
    sha256: createHash("sha256").update(png).digest("hex"),
    title: "The World Today — 20 November 2026 in one image",
  };
  const text = JSON.stringify(dossier, Object.keys(dossier).sort(), 2) + "\n";
  return new TextEncoder().encode(text);
}

function main(): void {
  const src = join(HERE, "entry.png");
  if (!existsSync(src)) {
    throw new Error("entry.png not found next to main.ts");
  }
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const dest = join(OUTPUT_DIR, "entry.png");
  copyFileSync(src, dest);
  // Verify the copy is byte-identical to the source before reporting success.
  const srcHash = createHash("sha256").update(readFileSync(src)).digest("hex");
  const destHash = createHash("sha256").update(readFileSync(dest)).digest("hex");
  if (srcHash !== destHash) {
    throw new Error(`entry.png copy mismatch: ${srcHash} != ${destHash}`);
  }
  writeFileSync(join(OUTPUT_DIR, "dossier.json"), buildDossier());
  console.log(
    `entry.png (${readFileSync(src).length} bytes, sha256 ${srcHash}) -> ${resolve(dest)}`,
  );
}

main();
