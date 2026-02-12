import type { Plugin } from "vite";
import fs from "node:fs";
import path from "node:path";

export function accidentsApi(): Plugin {
  return {
    name: "accidents-api",
    configureServer(server) {
      server.middlewares.use("/api/accidents", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let body = "";
        req.on("data", (chunk: Buffer) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const newAccident = JSON.parse(body);
            const filePath = path.resolve(
              import.meta.dirname,
              "public/data/accidents.json",
            );
            const existing = JSON.parse(fs.readFileSync(filePath, "utf-8"));
            existing.push(newAccident);
            fs.writeFileSync(filePath, JSON.stringify(existing, null, 2) + "\n");
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 201;
            res.end(JSON.stringify(newAccident));
          } catch (e) {
            res.statusCode = 500;
            res.end(
              JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
            );
          }
        });
      });
    },
  };
}
