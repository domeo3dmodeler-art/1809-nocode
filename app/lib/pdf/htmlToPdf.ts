// lib/pdf/htmlToPdf.ts
import puppeteer from "puppeteer-core";

/**
 * Преобразует HTML в PDF.
 * Для контейнеров/CI может понадобиться старт с флагами --no-sandbox/--disable-setuid-sandbox.
 */
export async function htmlToPdfBuffer(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "14mm", right: "12mm", bottom: "16mm", left: "12mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
