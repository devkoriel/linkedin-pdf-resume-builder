import { describe, expect, it } from "vitest";

import { getApiErrorMessage, readApiPayload } from "@/lib/api-response";

describe("api response helpers", () => {
  it("reads JSON payloads", async () => {
    const response = new Response(JSON.stringify({ data: { ok: true } }), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 200,
    });

    const payload = await readApiPayload<{ data: { ok: boolean } }>(response);

    expect(payload).toEqual({ data: { ok: true } });
  });

  it("falls back to plain-text errors", async () => {
    const response = new Response("Internal Server Error", {
      headers: {
        "Content-Type": "text/plain",
      },
      status: 500,
    });

    const payload = await readApiPayload<{ error?: string }>(response);

    expect(getApiErrorMessage(payload, "fallback")).toBe("Internal Server Error");
  });
});
