import { parseLinkedInProfileText } from "@/lib/resume/linkedin-parser";
import { extractPdfText } from "@/lib/resume/pdf-text";
import { validatePdfUpload } from "@/lib/resume/upload-validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "Attach a PDF file in the `file` field." }, { status: 400 });
    }

    validatePdfUpload(file);

    const buffer = Buffer.from(await file.arrayBuffer());
    const extractedText = await extractPdfText(buffer);

    if (!extractedText) {
      return Response.json(
        { error: "The uploaded PDF did not contain extractable text." },
        { status: 400 },
      );
    }

    const parsed = parseLinkedInProfileText(extractedText);

    return Response.json({
      data: {
        extractedText: parsed.normalizedText,
        fileName: file.name,
        resume: parsed.resume,
        warnings: parsed.warnings,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error while parsing the PDF.";

    return Response.json({ error: message }, { status: 500 });
  }
}
