export function GET() {
  return Response.json({
    service: "linkedin-pdf-resume-builder",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
