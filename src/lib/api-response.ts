export async function readApiPayload<T extends object>(
  response: Response,
): Promise<(T & { error?: string }) | null> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as T & { error?: string };
  }

  const text = (await response.text()).trim();

  if (!text) {
    return null;
  }

  return { error: text } as T & { error?: string };
}

export function getApiErrorMessage(
  payload: { error?: string } | null,
  fallbackMessage: string,
) {
  return payload?.error ?? fallbackMessage;
}
