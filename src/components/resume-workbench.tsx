"use client";

import {
  type DragEvent,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { ResumeEditorForm } from "@/components/resume-editor-form";
import { getApiErrorMessage, readApiPayload } from "@/lib/api-response";
import { buildResumeBody, buildResumeStyles } from "@/lib/resume/html";
import {
  createEmptyResume,
  normalizeResume,
  safeParseResume,
} from "@/lib/resume/schema";
import { validatePdfUpload } from "@/lib/resume/upload-validation";

interface ParseResponse {
  data: {
    extractedText: string;
    fileName: string;
    resume: unknown;
    warnings: string[];
  };
}

interface UploadMeta {
  fileName: string;
  resumeName: string;
}

async function requestPdfBlob(targetResume: unknown): Promise<Blob> {
  const response = await fetch("/api/resume/pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      resume: targetResume,
    }),
  });

  if (!response.ok) {
    const payload = await readApiPayload<{ error?: string }>(response);
    throw new Error(
      getApiErrorMessage(payload, "Failed to generate the resume PDF."),
    );
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

type WorkbenchStatus = "idle" | "parsing" | "ready";

export function ResumeWorkbench() {
  const [resume, setResume] = useState(() => createEmptyResume());
  const [requestError, setRequestError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [extractedText, setExtractedText] = useState("");
  const [uploadMeta, setUploadMeta] = useState<UploadMeta | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDownloading, setIsDownloading] = useState(false);
  const deferredResume = useDeferredValue(resume);
  const normalizedResume = useMemo(() => normalizeResume(resume), [resume]);
  const deferredNormalizedResume = useMemo(
    () => normalizeResume(deferredResume),
    [deferredResume],
  );
  const previewBody = useMemo(
    () => buildResumeBody(deferredNormalizedResume),
    [deferredNormalizedResume],
  );
  const previewShell = useMemo(
    () =>
      `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" />${buildResumeStyles()}</head><body><div id="resume-root"></div></body></html>`,
    [],
  );
  const resumeJson = useMemo(
    () => JSON.stringify(normalizedResume, null, 2),
    [normalizedResume],
  );

  const previewFrameRef = useRef<HTMLIFrameElement | null>(null);
  const previewWrapRef = useRef<HTMLDivElement | null>(null);
  const [previewScale, setPreviewScale] = useState(0.75);
  const [previewContentHeight, setPreviewContentHeight] = useState(1123);

  const A4_WIDTH_PX = 794;
  const A4_HEIGHT_PX = 1123;

  function applyPreviewBody() {
    const frame = previewFrameRef.current;
    const doc = frame?.contentDocument;
    const root = doc?.getElementById("resume-root");

    if (!root || !doc) {
      return;
    }

    root.innerHTML = previewBody;

    requestAnimationFrame(() => {
      const measured = Math.max(
        doc.body.scrollHeight,
        doc.documentElement.scrollHeight,
      );

      setPreviewContentHeight(Math.max(measured, A4_HEIGHT_PX));
    });
  }

  useEffect(() => {
    applyPreviewBody();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewBody]);

  useLayoutEffect(() => {
    const wrap = previewWrapRef.current;

    if (!wrap || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;

      if (width > 0) {
        setPreviewScale(Math.min(1, width / A4_WIDTH_PX));
      }
    });

    observer.observe(wrap);

    return () => observer.disconnect();
  }, []);

  const status: WorkbenchStatus = isPending
    ? "parsing"
    : uploadMeta || normalizedResume.basics.name
      ? "ready"
      : "idle";

  const hasContent = status === "ready";
  const hasPreviewContent =
    normalizedResume.basics.name.length > 0 ||
    normalizedResume.work.length > 0 ||
    normalizedResume.education.length > 0 ||
    normalizedResume.skills.length > 0;

  function acceptFile(file: File) {
    try {
      validatePdfUpload(file);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "That file is not a valid PDF.";

      setRequestError(message);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setRequestError("");
    setWarnings([]);

    startTransition(() => {
      void parseSelectedFile(file).catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to parse the uploaded PDF.";

        setRequestError(message);
      });
    });
  }

  async function parseSelectedFile(file: File) {
    const body = new FormData();

    body.set("file", file);

    const response = await fetch("/api/resume/parse", {
      method: "POST",
      body,
    });
    const payload = await readApiPayload<ParseResponse>(response);

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(payload, "Failed to parse the uploaded PDF."),
      );
    }

    if (!payload) {
      throw new Error("The parse endpoint returned an empty response.");
    }

    const parsedResume = safeParseResume(payload.data.resume);

    if (!parsedResume.success) {
      throw new Error(
        parsedResume.error.issues[0]?.message ??
          "Parsed resume JSON is invalid.",
      );
    }

    setResume(parsedResume.data);
    setWarnings(payload.data.warnings);
    setExtractedText(payload.data.extractedText);
    setUploadMeta({
      fileName: payload.data.fileName,
      resumeName: parsedResume.data.basics.name || "resume",
    });
  }

  async function handleDownloadPdf() {
    try {
      setIsDownloading(true);
      setRequestError("");
      const blob = await requestPdfBlob(normalizedResume);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const resumeName =
        uploadMeta?.resumeName || normalizedResume.basics.name || "resume";

      anchor.href = url;
      anchor.download = makeDownloadName(resumeName, "pdf");
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to generate the resume PDF.";

      setRequestError(message);
    } finally {
      setIsDownloading(false);
    }
  }

  function handleDownloadJson() {
    const blob = new Blob([resumeJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const resumeName =
      uploadMeta?.resumeName || normalizedResume.basics.name || "resume";

    anchor.href = url;
    anchor.download = makeDownloadName(resumeName, "json");
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];

    if (file) {
      acceptFile(file);
    }
  }

  const statusCopy = {
    idle: { label: "Waiting for PDF", className: "status-idle" },
    parsing: { label: "Parsing…", className: "status-active" },
    ready: { label: "Resume ready", className: "status-ready" },
  }[status];

  return (
    <section className="workspace">
      <div className="editor-col">
        <div className="card upload-card rise">
          <div className="card-header">
            <div className="card-title-stack">
              <p className="eyebrow">Step one</p>
              <h2>Upload the LinkedIn PDF</h2>
              <p className="lede">
                Export your profile from LinkedIn → More → Save to PDF, then
                drop the file here.
              </p>
            </div>
            <span
              aria-live="polite"
              className={`status-pill ${statusCopy.className}`}
              role="status"
            >
              <span aria-hidden="true" className="dot" />
              {statusCopy.label}
            </span>
          </div>

          <label
            className={`dropzone${isDragging ? " is-drag" : ""}${isPending ? " is-busy" : ""}`}
            htmlFor="resume-file"
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <span aria-hidden="true" className="dropzone-visual">
              {isPending ? (
                <span className="dropzone-spinner" />
              ) : (
                <svg
                  fill="none"
                  height="18"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                  width="18"
                >
                  <path d="M12 3v12" />
                  <path d="m7 8 5-5 5 5" />
                  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                </svg>
              )}
            </span>
            <span className="dropzone-title">
              {isPending
                ? "Parsing your PDF…"
                : hasContent
                  ? "Replace the file to re-parse"
                  : "Drop your LinkedIn PDF here"}
            </span>
            <span className="dropzone-hint">
              {isPending
                ? "Hang tight — this usually takes a second or two."
                : "or click to browse · PDF only · processed in-request, never stored"}
            </span>
            {selectedFile ? (
              <span className="file-chip">
                <strong>{selectedFile.name}</strong>
                <span className="size">{formatBytes(selectedFile.size)}</span>
                <button
                  aria-label="Clear selected file"
                  className="file-chip-clear"
                  onClick={(event) => {
                    event.preventDefault();
                    setSelectedFile(null);
                  }}
                  type="button"
                >
                  ×
                </button>
              </span>
            ) : null}
            <input
              accept="application/pdf"
              className="dropzone-input"
              id="resume-file"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  acceptFile(file);
                } else {
                  setSelectedFile(null);
                }
              }}
              type="file"
            />
          </label>

          <div className="meta-strip">
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
            <div className="callout callout-warn">
              <p className="callout-title">Parser warnings</p>
              <ul className="callout-list">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="callout">
            <p className="callout-title">Editing checklist for the final PDF</p>
            <ul className="callout-list">
              <li>
                Trim the headline into a clean role label if LinkedIn produced
                something too long.
              </li>
              <li>
                Add one-line company summaries so each role mirrors the italic
                subline in your reference resume.
              </li>
              <li>
                Group skills into the exact category rows from your blog post
                and reference PDF.
              </li>
              <li>
                Merge duplicated roles manually when LinkedIn exported nested
                promotions awkwardly.
              </li>
            </ul>
          </div>
        </div>

        <div className="card rise">
          <div className="card-header">
            <div className="card-title-stack">
              <p className="eyebrow">Step two</p>
              <h2>Refine each field</h2>
              <p className="lede">
                Every section below maps directly to one block of the exported
                PDF.
              </p>
            </div>
          </div>

          <ResumeEditorForm resume={resume} setResume={setResume} />
        </div>

        <details className="details">
          <summary>Advanced — JSON Resume &amp; raw extracted text</summary>
          <div className="details-body">
            <div className="details-sub">
              <span className="details-sub-label">Current JSON Resume</span>
              <pre>{resumeJson}</pre>
            </div>
            <div className="details-sub">
              <span className="details-sub-label">Raw extracted text</span>
              <pre>{extractedText || "No PDF parsed yet."}</pre>
            </div>
          </div>
        </details>
      </div>

      <div className="preview-col">
        <div className="preview-card rise">
          <div className="preview-toolbar">
            <div className="preview-toolbar-title">
              <p className="eyebrow" style={{ margin: 0 }}>
                Step three
              </p>
              <h2 className="preview-toolbar-heading">Live preview</h2>
            </div>
            <span className="preview-toolbar-chip">A4 · 20mm</span>
          </div>
          <div
            className="preview-frame-wrap"
            ref={previewWrapRef}
            style={{
              height: `${Math.round(previewContentHeight * previewScale)}px`,
            }}
          >
            <iframe
              className="preview-frame"
              onLoad={() => {
                applyPreviewBody();
              }}
              ref={previewFrameRef}
              srcDoc={previewShell}
              style={{
                height: `${previewContentHeight}px`,
                transform: `scale(${previewScale})`,
              }}
              title="Resume preview"
            />
            {!hasPreviewContent ? (
              <div aria-hidden="true" className="preview-empty-overlay">
                <span className="preview-empty-mark">A4</span>
                <p className="preview-empty-title">
                  Your resume will render here
                </p>
                <p className="preview-empty-body">
                  Upload a LinkedIn PDF or start typing in the editor. The live
                  preview matches the downloadable PDF exactly.
                </p>
              </div>
            ) : null}
          </div>
          <div className="preview-export">
            <div className="preview-export-copy">
              <p className="eyebrow">Export</p>
              <p className="preview-export-title">
                Ship it when it looks right.
              </p>
            </div>
            <div className="preview-export-actions">
              <button
                className="button button-accent"
                disabled={isDownloading || !hasContent}
                onClick={() => void handleDownloadPdf()}
                title={
                  hasContent
                    ? undefined
                    : "Parse a PDF or fill in the editor first"
                }
                type="button"
              >
                {isDownloading ? "Rendering…" : "Download PDF"}
              </button>
              <button
                className="button button-ghost"
                disabled={!hasContent}
                onClick={handleDownloadJson}
                title={
                  hasContent
                    ? undefined
                    : "Parse a PDF or fill in the editor first"
                }
                type="button"
              >
                Download JSON
              </button>
            </div>
          </div>
          <p className="preview-note">
            Preview uses the same HTML renderer as the exported PDF — PDF
            generation runs only when you download.
          </p>
        </div>
      </div>
    </section>
  );
}
