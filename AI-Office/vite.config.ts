import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
function loopbackPort(value: string | undefined, fallback: number): number {
  const port = value === undefined ? fallback : Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("A fixed loopback port is required");
  return port;
}
const uiPort = loopbackPort(process.env.AI_OFFICE_WEB_PORT, 43124);
const backendPort = loopbackPort(process.env.AI_OFFICE_PORT, 43123);

const boundary: Plugin = {
  name: "ai-office-local-boundary",
  configureServer(server) {
    // Runs before proxy/static middleware. Never trust or rewrite a foreign
    // browser Origin into an authorized origin. No forwarded-host authority.
    server.middlewares.use((request, response, next) => {
      const host = `127.0.0.1:${uiPort}`;
      const names = request.rawHeaders.filter((_, index) => index % 2 === 0).map((name) => name.toLowerCase());
      if (request.socket.remoteAddress !== "127.0.0.1" || request.headers.host !== host ||
          names.filter((name) => name === "host").length !== 1 || names.filter((name) => name === "origin").length > 1 ||
          (request.headers.origin !== undefined && request.headers.origin !== `http://${host}`) ||
          Object.keys(request.headers).some((name) => name.startsWith("x-forwarded-") || name === "forwarded") ||
          (request.headers["sec-fetch-site"] !== undefined && !["same-origin", "none"].includes(String(request.headers["sec-fetch-site"])))) {
        response.writeHead(403, { "Cache-Control": "no-store" }); response.end("Local origin required"); return;
      }
      response.setHeader("Cache-Control", "no-store");
      const pathname = new URL(request.url ?? "/", `http://${host}`).pathname;
      const permitted = ["/", "/index.html", "/@vite/client", "/@react-refresh"].includes(pathname) ||
        ["/api/", "/src/web/", "/src/contracts/", "/node_modules/.vite/", "/node_modules/vite/dist/client/"].some((prefix) => pathname.startsWith(prefix));
      if (!permitted || /%|\\|\0/.test(pathname)) { response.writeHead(404); response.end("Not found"); return; }
      next();
    });
  },
};

export default defineConfig({ root, plugins: [boundary, react()],
  server: { host: "127.0.0.1", port: uiPort, strictPort: true, allowedHosts: ["127.0.0.1"], cors: false,
    hmr: false, fs: { strict: true, allow: [root] },
    proxy: { "/api/": { target: `http://127.0.0.1:${backendPort}`, changeOrigin: true, xfwd: false } } },
  build: { outDir: "tests/e2e/artifacts/build", emptyOutDir: true, sourcemap: false },
});
