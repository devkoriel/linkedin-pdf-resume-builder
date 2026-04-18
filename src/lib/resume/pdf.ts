type BrowserLike = {
  close: () => Promise<void>;
  newPage: () => Promise<PageLike>;
};

type PageLike = {
  emulateMediaType: (type: "screen") => Promise<void>;
  pdf: (options: PdfOptions) => Promise<ArrayBuffer | Buffer | Uint8Array>;
  setContent: (html: string, options: { waitUntil: "networkidle0" }) => Promise<void>;
  setViewport: (options: ViewportOptions) => Promise<void>;
};

type PdfOptions = {
  format: "A4";
  margin: {
    bottom: string;
    left: string;
    right: string;
    top: string;
  };
  printBackground: boolean;
};

type ViewportOptions = {
  deviceScaleFactor: number;
  height: number;
  width: number;
};

async function launchBrowser(browserBinding?: unknown): Promise<BrowserLike> {
  if (browserBinding) {
    const cloudflarePuppeteer = await import("@cloudflare/puppeteer");

    return (await cloudflarePuppeteer.default.launch(browserBinding as never)) as BrowserLike;
  }

  const puppeteer = await import("puppeteer");

  return (await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })) as BrowserLike;
}

function toNodeBuffer(value: ArrayBuffer | Buffer | Uint8Array): Buffer {
  if (value instanceof ArrayBuffer) {
    return Buffer.from(new Uint8Array(value));
  }

  return Buffer.from(value);
}

export async function renderResumePdf(html: string, browserBinding?: unknown): Promise<Buffer> {
  const browser = await launchBrowser(browserBinding);

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1195,
      height: 1684,
      deviceScaleFactor: 1,
    });
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.emulateMediaType("screen");

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
      printBackground: true,
    });

    return toNodeBuffer(pdfBuffer);
  } finally {
    await browser.close();
  }
}
