import { describe, expect, it } from "vitest";

import { validatePdfUpload } from "@/lib/resume/upload-validation";

describe("validatePdfUpload", () => {
  it("accepts a small PDF upload", () => {
    const file = new File([new Uint8Array([37, 80, 68, 70])], "profile.pdf", {
      type: "application/pdf",
    });

    expect(() => validatePdfUpload(file)).not.toThrow();
  });

  it("rejects non-PDF uploads", () => {
    const file = new File(["hello"], "profile.txt", {
      type: "text/plain",
    });

    expect(() => validatePdfUpload(file)).toThrow("Only PDF uploads are supported.");
  });
});
