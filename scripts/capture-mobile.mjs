import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "screenshots");
mkdirSync(OUT_DIR, { recursive: true });

const BASE = process.env.APROVAJA_QA_BASE_URL ?? "http://localhost:3000";
const EMAIL = process.env.APROVAJA_QA_EMAIL;
const SENHA = process.env.APROVAJA_QA_PASSWORD;

if (!EMAIL || !SENHA) {
  console.error(
    "Defina APROVAJA_QA_EMAIL e APROVAJA_QA_PASSWORD (conta de teste já confirmada) antes de rodar este script."
  );
  process.exit(1);
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  await page.goto(`${BASE}/login`);
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', SENHA);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 15000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, "dashboard-mobile.png") });
  console.log("salvo: dashboard-mobile");
} finally {
  await browser.close();
}
