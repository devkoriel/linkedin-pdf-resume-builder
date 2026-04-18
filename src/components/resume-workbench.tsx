"use client";

import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";

import { ResumeEditorForm } from "@/components/resume-editor-form";
import { getApiErrorMessage, readApiPayload } from "@/lib/api-response";
import { buildResumeHtml } from "@/lib/resume/html";
import { createEmptyResume, normalizeResume, safeParseResume } from "@/lib/resume/schema";

interface ParseResponse {
  data: {
    extractedText: string;
    fileName: string;
    resume: unknown;
    warnings: string[];
  };
}

async function requestPdfBlob(targetResume: unknown, signal?: AbortSignal) {
  const response = await fetch("/api/resume/pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      resume: targetResume,
    }),
    signal,
  });

  if (!response.ok) {
    const payload = await readApiPayload<{ error?: string }>(response);
    throw new Error(getApiErrorMessage(payload, "Failed to generate the resume PDF."));
  }

  return response.blob();
}

function makeDownloadName(name: string, extension: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug || "resume"}.${extension}`;
}

export function ResumeWorkbench() {
  const [resume, setResume] = useState(() => createEmptyResume());
  const [requestError, setRequestError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [extractedText, setExtractedText] = useState("");
  const [uploadMeta, setUploadMeta] = useState<{
    fileName: string;
    resumeName: string;
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDownloading, setIsDownloading] = useState(false);
  const deferredResume = useDeferredValue(resume);
  const normalizedResume = useMemo(() => normalizeResume(resume), [resume]);
  const deferredNormalizedResume = useMemo(
    () => normalizeResume(deferredResume),
    [deferredResume],
  );
  const previewHtml = useMemo(() => buildResumeHtml(deferredNormalizedResume), [deferredNormalizedResume]);
  const resumeJson = useMemo(() => JSON.stringify(normalizedResume, null, 2), [normalizedResume]);
  const shouldGeneratePdfPreview = useMemo(
    () =>
      Boolean(
        deferredNormalizedResume.basics.name ||
          deferredNormalizedResume.basics.label ||
          deferredNormalizedResume.basics.summary ||
          deferredNormalizedResume.work.length ||
          deferredNormalizedResume.skills.length ||
          deferredNormalizedResume.education.length,
      ),
    [deferredNormalizedResume],
  );

  useEffect(() => {
    return () => {
      if (previewPdfUrl) {
        URL.revokeObjectURL(previewPdfUrl);
      }
    };
  }, [previewPdfUrl]);

  useEffect(() => {
    if (!shouldGeneratePdfPreview) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setIsPreviewLoading(true);

      void requestPdfBlob(deferredNormalizedResume, controller.signal)
        .then((blob) => {
          const nextUrl = URL.createObjectURL(blob);

          setPreviewPdfUrl((currentUrl) => {
            if (currentUrl) {
              URL.revokeObjectURL(currentUrl);
            }

            return nextUrl;
          });
          setPreviewError("");
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) {
            return;
          }

          const message =
            error instanceof Error ? error.message : "Failed to update the PDF preview.";

          setPreviewError(message);
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsPreviewLoading(false);
          }
        });
    }, 700);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [deferredNormalizedResume, shouldGeneratePdfPreview]);

  async function parseSelectedFile(file: File) {
    const body = new FormData();

    body.set("file", file);

    const response = await fetch("/api/resume/parse", {
      method: "POST",
      body,
    });
    const payload = await readApiPayload<ParseResponse>(response);

    if (!response.ok) {
      throw new Error(getApiErrorMessage(payload, "Failed to parse the uploaded PDF."));
    }

    if (!payload) {
      throw new Error("The parse endpoint returned an empty response.");
    }

    const parsedResume = safeParseResume(payload.data.resume);

    if (!parsedResume.success) {
      throw new Error(parsedResume.error.issues[0]?.message ?? "Parsed resume JSON is invalid.");
    }

    setResume(parsedResume.data);
    setWarnings(payload.data.warnings);
    setExtractedText(payload.data.extractedText);
    setUploadMeta({
      fileName: payload.data.fileName,
      resumeName: parsedResume.data.basics.name || "resume",
    });
  }

  function handleUploadSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setRequestError("Choose a LinkedIn PDF export first.");
      return;
    }

    setRequestError("");

    startTransition(() => {
      void parseSelectedFile(selectedFile).catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Failed to parse the uploaded PDF.";

        setRequestError(message);
      });
    });
  }

  async function handleDownloadPdf() {
    try {
      setIsDownloading(true);
      setRequestError("");
      const blob = await requestPdfBlob(normalizedResume);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const resumeName = uploadMeta?.resumeName || normalizedResume.basics.name || "resume";

      anchor.href = url;
      anchor.download = makeDownloadName(resumeName, "pdf");
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate the resume PDF.";

      setRequestError(message);
    } finally {
      setIsDownloading(false);
    }
  }

  function handleDownloadJson() {
    const blob = new Blob([resumeJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const resumeName = uploadMeta?.resumeName || normalizedResume.basics.name || "resume";

    anchor.href = url;
    anchor.download = makeDownloadName(resumeName, "json");
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="workspace">
      <div className="panel stack">
        <div className="panel-header">
          <p className="eyebrow">Input</p>
          <h2>Upload, guide, and export</h2>
          <p className="lede">
            Upload a LinkedIn profile PDF, let the parser draft the resume, then
            refine each field in a guided editor before exporting the final ATS-safe PDF.
          </p>
        </div>

        <form className="upload-form" onSubmit={handleUploadSubmit}>
          <label className="field">
            <span>LinkedIn PDF export</span>
            <input
              accept="application/pdf"
              className="file-input"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              type="file"
            />
          </label>
          <div className="actions">
            <button className="button" disabled={isPending} type="submit">
              {isPending ? "Parsing..." : "Parse PDF"}
            </button>
            <button
              className="button button-ghost"
              disabled={isDownloading}
              onClick={() => void handleDownloadPdf()}
              type="button"
            >
              {isDownloading ? "Rendering PDF..." : "Download PDF"}
            </button>
            <button className="button button-ghost" onClick={handleDownloadJson} type="button">
              Download JSON
            </button>
          </div>
        </form>

        <div className="meta-row">
          <div className="meta-card">
            <span className="meta-label">Target layout</span>
            <strong>koriel.kr/resume/resume.pdf</strong>
          </div>
          <div className="meta-card">
            <span className="meta-label">Last upload</span>
            <strong>{uploadMeta?.fileName ?? "No file parsed yet"}</strong>
          </div>
        </div>

        {requestError ? <p className="error-banner">{requestError}</p> : null}
        {warnings.length > 0 ? (
          <div className="callout">
            <p className="callout-title">Parser warnings</p>
            <ul className="callout-list">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="callout guide-card">
          <p className="callout-title">Editing checklist for the final PDF</p>
          <ul className="callout-list">
            <li>Trim the headline into a clean role label if LinkedIn produced something too long.</li>
            <li>Add one-line company summaries so each role mirrors the italic subline in your reference resume.</li>
            <li>Group skills into the exact category-row format from your blog post and reference PDF.</li>
            <li>Use action-first bullet points and merge duplicated roles manually when LinkedIn exported nested promotions awkwardly.</li>
          </ul>
        </div>

        <ResumeEditorForm resume={resume} setResume={setResume} />

        <details className="details">
          <summary>Current JSON Resume</summary>
          <pre>{resumeJson}</pre>
        </details>

        <details className="details">
          <summary>Raw extracted text</summary>
          <pre>{extractedText || "No PDF parsed yet."}</pre>
        </details>
      </div>

      <div className="panel preview-panel">
        <div className="panel-header">
          <p className="eyebrow">Output</p>
          <h2>Live PDF preview</h2>
          <p className="lede">
            This preview uses the actual generated PDF inside the browser viewer so
            the on-page result matches the downloaded file, including pagination.
          </p>
        </div>
        <div className="preview-shell">
          {isPreviewLoading ? <p className="preview-status">Updating PDF preview...</p> : null}
          {previewError ? <p className="error-inline">{previewError}</p> : null}
          <iframe
            className="preview-frame"
            src={previewPdfUrl ?? undefined}
            srcDoc={previewPdfUrl ? undefined : previewHtml}
            title="Resume preview"
          />
        </div>
      </div>
    </section>
  );
}
