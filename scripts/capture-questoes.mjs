// Uso: APROVAJA_QA_EMAIL=... APROVAJA_QA_PASSWORD=... node scripts/capture-questoes.mjs
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "screenshots");
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
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await page.goto(`${BASE}/login`);
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', SENHA);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 15000 });

  await page.goto(`${BASE}/dashboard/questoes`);
  await page.click('button:has-text("Começar a praticar")');
  await page.waitForSelector("text=/Questão 1 de/", { timeout: 10000 });
  await page.waitForTimeout(300);

  // Clica na primeira alternativa (botões com letra + texto)
  const alternativa = page.locator("button").filter({ hasText: /^[A-E]/ }).first();
  await alternativa.click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(OUT_DIR, "questoes.png") });
  console.log("salvo: questoes (respondida)");
} finally {
  await browser.close();
}
