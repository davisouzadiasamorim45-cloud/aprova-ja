// Script único para capturar prints reais do app (logado) e usar na landing page.
// Uso: node scripts/capture-screenshots.mjs
// Requer o servidor rodando em http://localhost:3000 e a conta de teste já confirmada.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "screenshots");
mkdirSync(OUT_DIR, { recursive: true });

const BASE = "http://localhost:3000";
const EMAIL = "marcosapolo511+aprovaja@gmail.com";
const SENHA = "SenhaTeste123!";

async function shot(page, nome) {
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT_DIR, `${nome}.png`) });
  console.log("salvo:", nome);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

// Login
await page.goto(`${BASE}/login`);
await page.fill('input[name="email"]', EMAIL);
await page.fill('input[name="password"]', SENHA);
await page.click('button[type="submit"]');
await page.waitForURL(`${BASE}/dashboard`, { timeout: 15000 });

// 1) Dashboard (visão geral)
await shot(page, "dashboard");

// 2) Banco de questões — filtros + questão respondida
await page.goto(`${BASE}/dashboard/questoes`);
await page.waitForTimeout(500);
await page.click('button:has-text("Começar a praticar")');
await page.waitForTimeout(700);
await shot(page, "questoes-filtros"); // fallback caso a próxima falhe
try {
  const alt = page.locator("button", { hasText: /^[A-Z]\s/ }).first();
  if (await alt.count()) {
    await alt.click();
    await page.waitForTimeout(500);
  }
} catch {}
await shot(page, "questoes");

// 3) Cronograma
await page.goto(`${BASE}/dashboard/cronograma`);
await page.waitForTimeout(600);
await shot(page, "cronograma");

// 4) Flashcards
await page.goto(`${BASE}/dashboard/flashcards`);
await page.waitForTimeout(600);
await shot(page, "flashcards");

// 5) Estatísticas
await page.goto(`${BASE}/dashboard/estatisticas`);
await page.waitForTimeout(600);
await shot(page, "estatisticas");

await browser.close();
console.log("Concluído.");
