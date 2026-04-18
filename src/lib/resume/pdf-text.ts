import { getDocument } from "pdfjs-serverless";

interface PdfTextItem {
  hasEOL?: boolean;
  str?: string;
}

function normalizePageText(items: PdfTextItem[]): string {
  const chunks: string[] = [];

  for (const item of items) {
    const value = item.str ?? "";

    if (item.hasEOL) {
      if (value.trim()) {
        chunks.push(value.trim());
      }

      chunks.push("\n");
      continue;
    }

    if (!value) {
      continue;
    }

    chunks.push(value);
  }

  return chunks
    .join("")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const loadingTask = getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  });
  const document = await loadingTask.promise;

  try {
    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = normalizePageText(textContent.items as PdfTextItem[]);

      if (pageText) {
        pages.push(pageText);
      }
    }

    return pages.join("\n\n").trim();
  } finally {
    await loadingTask.destroy();
  }
}
