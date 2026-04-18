const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

export function validatePdfUpload(file: File) {
  if (!(file instanceof File)) {
    throw new Error("A PDF file is required.");
  }

  if (file.size === 0) {
    throw new Error("The uploaded PDF is empty.");
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    throw new Error("The uploaded PDF exceeds the 10 MB size limit.");
  }

  const fileName = file.name.toLowerCase();
  const isPdfMime = file.type === "application/pdf";
  const isPdfExtension = fileName.endsWith(".pdf");

  if (!isPdfMime || !isPdfExtension) {
    throw new Error("Only PDF uploads are supported.");
  }

  return {
    fileName: file.name,
    size: file.size,
  };
}

