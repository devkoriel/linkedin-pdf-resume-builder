import { buildResumeHtml } from "@/lib/resume/html";
import { renderResumePdf } from "@/lib/resume/pdf";
import { safeParseResume } from "@/lib/resume/schema";

export const runtime = "nodejs";

function makeAttachmentName(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug || "resume"}.pdf`;
}

async function getCloudflareBrowserBinding() {
  try {
    const cloudflare = await import("@opennextjs/cloudflare");
    const context = cloudflare.getCloudflareContext();

    return (context.env as { BROWSER?: unknown }).BROWSER;
  } catch {
    return undefined;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { resume?: unknown };
    const validation = safeParseResume(body.resume ?? body);

    if (!validation.success) {
      const issue = validation.error.issues[0]?.message ?? "Resume JSON is invalid.";

      return Response.json({ error: issue }, { status: 400 });
    }

    const html = buildResumeHtml(validation.data);
    const browserBinding = await getCloudflareBrowserBinding();
    const pdf = await renderResumePdf(html, browserBinding);
    const attachmentName = makeAttachmentName(validation.data.basics.name);

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Disposition": `attachment; filename="${attachmentName}"`,
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error while generating the PDF.";

    return Response.json({ error: message }, { status: 500 });
  }
}
