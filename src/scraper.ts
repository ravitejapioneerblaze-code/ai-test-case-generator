import { chromium } from 'playwright';

export interface PageData {
  url: string;
  title: string;
  forms: FormData[];
  buttons: string[];
  links: string[];
  headings: string[];
  inputs: InputData[];
}

export interface FormData {
  action: string;
  method: string;
  fields: string[];
}

export interface InputData {
  type: string;
  name: string;
  placeholder: string;
  required: boolean;
}

export async function scrapePage(url: string): Promise<PageData> {
  //const browser = await chromium.launch();
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const data = await page.evaluate(() => {
      const forms = Array.from(document.querySelectorAll('form')).map(f => ({
        action: f.action || '',
        method: f.method || 'get',
        fields: Array.from(f.querySelectorAll('input,select,textarea'))
          .map(el => (el as HTMLInputElement).name).filter(Boolean)
      }));

      const buttons = Array.from(document.querySelectorAll('button, [role="button"]'))
        .map(b => b.textContent?.trim() || '').filter(Boolean);

      const links = Array.from(document.querySelectorAll('a[href]'))
        .map(a => (a as HTMLAnchorElement).href).slice(0, 20);

      const headings = Array.from(document.querySelectorAll('h1,h2,h3'))
        .map(h => h.textContent?.trim() || '').filter(Boolean);

      const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
        type: i.type || 'text',
        name: i.name || '',
        placeholder: i.placeholder || '',
        required: i.required
      }));

      return { title: document.title, forms, buttons, links, headings, inputs };
    });

    return { url, ...data };
  } finally {
    await browser.close();
  }
}