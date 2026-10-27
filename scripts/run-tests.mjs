import { prepararPruebas } from "./build-tests.mjs";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const { Server, config: karmaConfig } = require("karma");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (!process.env.CHROME_BIN) {
  const candidatos =
    process.platform === "win32"
      ? [
          `${process.env.PROGRAMFILES}/Google/Chrome/Application/chrome.exe`,
          `${process.env["PROGRAMFILES(X86)"]}/Microsoft/Edge/Application/msedge.exe`,
          `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
        ]
      : [
          "/usr/bin/google-chrome",
          "/usr/bin/chromium",
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        ];
  process.env.CHROME_BIN = candidatos.find((p) => fs.existsSync(p)) || "";
}
if (!process.env.CHROME_BIN && !process.argv.includes("--manual")) {
  console.error(
    "Instala Chrome o Edge, o define CHROME_BIN con la ruta del navegador.",
  );
  process.exit(1);
}
await prepararPruebas();
const opciones = {
  singleRun: !process.argv.includes("--watch"),
  ...(process.argv.includes("--manual") ? { browsers: [] } : {}),
};
const configuracion = await karmaConfig.parseConfig(
  path.join(root, "karma.conf.cjs"),
  opciones,
  { promiseConfig: true, throwErrors: true },
);
new Server(configuracion, (codigo) => {
  process.exitCode = codigo;
}).start();
