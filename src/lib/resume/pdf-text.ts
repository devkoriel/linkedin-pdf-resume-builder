import { PDFParse } from "pdf-parse";
import { WorkerMessageHandler } from "pdfjs-dist/legacy/build/pdf.worker.mjs";

let pdfWorkerConfigured = false;

type PdfJsWorkerGlobal = typeof globalThis & {
  pdfjsWorker?: {
    WorkerMessageHandler: typeof WorkerMessageHandler;
  };
};

function ensurePdfWorker() {
  if (pdfWorkerConfigured) {
    return;
  }

  (globalThis as PdfJsWorkerGlobal).pdfjsWorker = { WorkerMessageHandler };
  pdfWorkerConfigured = true;
}

export async function extractPdfText(buffer: Buffer): Promise<string> {
  ensurePdfWorker();

  const parser = new PDFParse({ data: buffer });

  try {
    const textResult = await parser.getText();

    return textResult.text.trim();
  } finally {
    await parser.destroy();
  }
}
