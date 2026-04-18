import { describe, expect, it } from "vitest";

import { sampleResume } from "./fixtures/sample-resume";

import { buildResumeHtml } from "@/lib/resume/html";

describe("buildResumeHtml", () => {
  it("renders the exact visual conventions from the target PDF", () => {
    const html = buildResumeHtml(sampleResume);

    expect(html).toContain("Jinsoo Heo");
    expect(html).toContain("TECHNICAL SKILLS");
    expect(html).toContain("PROFESSIONAL EXPERIENCE");
    expect(html).toContain("font-family: \"Helvetica Neue\", Arial, \"Segoe UI\", sans-serif;");
    expect(html).toContain(".page { padding: 20mm; }");
    expect(html).toContain("font-size: 8.5pt;");
    expect(html).toContain("letter-spacing: 0.8pt;");
    expect(html).toContain("<strong>Container Orchestration:</strong> Kubernetes, EKS, kOps, Helm, ArgoCD");
    expect(html).toContain("Jan 2026 – Present");
    expect(html).toContain("<div class=\"entry-sub\">Web3 oracle infrastructure for DeFi protocols.</div>");
    expect(html.indexOf("TECHNICAL SKILLS")).toBeLessThan(
      html.indexOf("PROFESSIONAL EXPERIENCE"),
    );
  });

  it("escapes user-provided HTML to keep the rendered PDF safe", () => {
    const html = buildResumeHtml({
      ...sampleResume,
      basics: {
        ...sampleResume.basics,
        name: "<script>alert('x')</script>",
      },
    });

    expect(html).toContain("&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;");
    expect(html).not.toContain("<script>alert('x')</script>");
  });
});
