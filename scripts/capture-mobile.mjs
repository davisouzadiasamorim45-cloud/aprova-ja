import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "screenshots");
mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto("http://localhost:3000/login");
await page.fill('input[name="email"]', "marcosapolo511+aprovaja@gmail.com");
await page.fill('input[name="password"]', "SenhaTeste123!");
await page.click('button[type="submit"]');
await page.waitForURL("http://localhost:3000/dashboard", { timeout: 15000 });
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(OUT_DIR, "dashboard-mobile.png") });

await browser.close();
console.log("salvo: dashboard-mobile");
