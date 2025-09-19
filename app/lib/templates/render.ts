import Handlebars from "handlebars";
import fs from "node:fs/promises";
import path from "node:path";

type Dict = Record<string, unknown>;
let cache: Record<string, Handlebars.TemplateDelegate> = {};

Handlebars.registerHelper("formatRub", (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n)
);

async function load(name: string) {
  if (cache[name]) return cache[name];
  const file = path.join(process.cwd(), "lib", "templates", `${name}.hbs`);
  const src = await fs.readFile(file, "utf8");
  const tpl = Handlebars.compile(src);
  cache[name] = tpl;
  return tpl;
}

export async function renderTemplate(name: "kp" | "invoice", ctx: Dict) {
  const tpl = await load(name);
  return tpl(ctx);
}
