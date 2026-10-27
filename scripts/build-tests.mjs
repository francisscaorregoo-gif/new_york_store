import { build } from "esbuild";
import babel from "@babel/core";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export async function prepararPruebas() {
  await fs.mkdir(path.join(root, ".test-build"), { recursive: true });
  await build({
    absWorkingDir: root,
    entryPoints: ["tests/tienda.spec.jsx"],
    outfile: ".test-build/tests.js",
    bundle: true,
    format: "iife",
    platform: "browser",
    sourcemap: "inline",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"development"' },
    loader: { ".css": "empty" },
    plugins: [
      {
        name: "cobertura-fuentes",
        setup(builder) {
          builder.onLoad(
            { filter: /src[\/\\].*\.(jsx|js)$/ },
            async ({ path: archivo }) => {
              const codigo = await fs.readFile(archivo, "utf8");
              // Las comunas y el catálogo son datos del anexo, no lógica a instrumentar.
              const instrumentar = !/[\/\\](zonas|products)\.js$/.test(archivo);
              const resultado = await babel.transformAsync(codigo, {
                filename: archivo,
              cwd: root,
                presets: [["@babel/preset-react", { runtime: "automatic" }]],
                plugins: instrumentar
                  ? [
                      [
                        "babel-plugin-istanbul",
                        {
                          cwd: root,
                          include: ["src/**/*.js", "src/**/*.jsx"],
                          exclude: ["src/main.jsx"],
                        },
                      ],
                    ]
                  : [],
                sourceMaps: "inline",
                babelrc: false,
                configFile: false,
              });
              return { contents: resultado.code, loader: "js" };
            },
          );
        },
      },
    ],
  });
}

