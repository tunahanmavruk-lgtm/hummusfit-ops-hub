const express = require("express");
const path = require("path");

const app = express();

// Fixed port — must match the "target port" set in Railway's
// Settings → Networking → Generate Domain (set to 3000).
const PORT = 3000;

// ---- Simple password gate ----
// Set OPS_HUB_USERNAME and OPS_HUB_PASSWORD as environment variables in
// Railway to require a login before anyone can see the hub. If either
// variable is unset, the hub stays open (no login required) — useful
// while testing.
const AUTH_USER = process.env.OPS_HUB_USERNAME;
const AUTH_PASS = process.env.OPS_HUB_PASSWORD;

if (AUTH_USER && AUTH_PASS) {
  app.use((req, res, next) => {
    const header = req.headers.authorization;
    if (!header) {
      res.set("WWW-Authenticate", 'Basic realm="Hummus Fit Ops Hub"');
      return res.status(401).send("Login required.");
    }
    const [scheme, encoded] = header.split(" ");
    if (scheme !== "Basic" || !encoded) {
      res.set("WWW-Authenticate", 'Basic realm="Hummus Fit Ops Hub"');
      return res.status(401).send("Login required.");
    }
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    const sepIndex = decoded.indexOf(":");
    const user = decoded.slice(0, sepIndex);
    const pass = decoded.slice(sepIndex + 1);
    if (user === AUTH_USER && pass === AUTH_PASS) {
      return next();
    }
    res.set("WWW-Authenticate", 'Basic realm="Hummus Fit Ops Hub"');
    return res.status(401).send("Invalid login.");
  });
}

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Ops Hub running on port ${PORT}`);
});
