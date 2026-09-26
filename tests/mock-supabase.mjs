// Local browser QA fixture only. Does not contact or write to Supabase.
import http from "node:http";
let requests = 0;
http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3004");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
  if (req.url === "/health") { res.end(JSON.stringify({ requests })); return; }
  if (req.method !== "POST" || req.url !== "/rest/v1/consultations") { res.writeHead(404); res.end("{}"); return; }
  let raw = "";
  req.on("data", chunk => raw += chunk);
  req.on("end", () => {
    requests++;
    const body = JSON.parse(raw);
    const item = Array.isArray(body) ? body[0] : body;
    if (item.name === "오류테스트") {
      res.writeHead(503); res.end(JSON.stringify({ message: "QA failure", code: "TEST_ERROR" })); return;
    }
    if (item.name === "시간초과테스트") return;
    res.writeHead(201); res.end();
  });
}).listen(4333, "127.0.0.1", () => console.log("Local QA Supabase fixture listening on 4333"));
