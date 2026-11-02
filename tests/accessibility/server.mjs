// Local TLS keeps production upgrade-insecure-requests active in WebKit too.
// Generate throwaway material at runtime; never commit or print it.
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { request } from "node:http";
import { createServer } from "node:https";
import { tmpdir } from "node:os";
import { join } from "node:path";

const directory = mkdtempSync(join(tmpdir(), "udid-accessibility-tls-"));
const key = join(directory, "key.pem");
const cert = join(directory, "cert.pem");
const generated = spawnSync(
  "openssl",
  [
    "req",
    "-x509",
    "-newkey",
    "rsa:2048",
    "-nodes",
    "-days",
    "1",
    "-subj",
    "/CN=localhost",
    "-keyout",
    key,
    "-out",
    cert,
  ],
  { stdio: "ignore" }
);
if (generated.status !== 0) {
  rmSync(directory, { recursive: true, force: true });
  throw new Error("Could not prepare local accessibility test TLS");
}
const app = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3101"],
  {
    stdio: "ignore",
    env: { ...process.env, UDID_TOOLS_PROFILE_SIGNING_MODE: "unsigned" },
  }
);
const server = createServer(
  { key: readFileSync(key), cert: readFileSync(cert) },
  (incoming, outgoing) => {
    const proxy = request(
      {
        hostname: "127.0.0.1",
        port: 3101,
        path: incoming.url,
        method: incoming.method,
        headers: incoming.headers,
      },
      (response) => {
        outgoing.writeHead(response.statusCode ?? 502, response.headers);
        response.pipe(outgoing);
      }
    );
    proxy.on("error", () => {
      outgoing.writeHead(503);
      outgoing.end();
    });
    incoming.pipe(proxy);
  }
);
let stopped = false;
function stop() {
  if (stopped) return;
  stopped = true;
  app.kill("SIGTERM");
  server.close();
  rmSync(directory, { recursive: true, force: true });
}
process.on("SIGTERM", () => {
  stop();
  process.exit(0);
});
process.on("SIGINT", () => {
  stop();
  process.exit(0);
});
process.on("exit", stop);
app.on("exit", () => {
  stop();
  process.exit(1);
});
server.listen(3100, "127.0.0.1");
