import Link from "next/link";

import { ResumeWorkbench } from "@/components/resume-workbench";
import { siteConfig } from "@/lib/site";

const steps = [
  {
    num: "01",
    title: "Upload",
    body: "Drop in the LinkedIn profile PDF. We extract it locally in the request and never store it.",
  },
  {
    num: "02",
    title: "Refine",
    body: "Review each field in a guided editor. Fix headlines, rephrase bullets, group skills by category.",
  },
  {
    num: "03",
    title: "Export",
    body: "Download an ATS-safe PDF rendered from system fonts, or the raw JSON Resume for any pipeline.",
  },
];

const heroBullets = [
  "Guided, field-by-field editing — not a raw JSON escape hatch.",
  "System-font, ATS-parsable PDF rendered from HTML.",
  "Uppercase section rails, right-aligned dates, italic company lines.",
  "JSON Resume export preserved for downstream automation.",
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: siteConfig.description,
    url: siteConfig.url,
    creator: {
      "@type": "Person",
      name: siteConfig.creator.name,
      url: siteConfig.creator.url,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Upload and parse LinkedIn profile PDFs",
      "Edit resume data field by field",
      "Export ATS-safe resume PDFs",
      "Download JSON Resume output",
    ],
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />
      <header className="topbar">
        <Link className="brand" href="/">
          <span aria-hidden="true" className="brand-mark">
            JR
          </span>
          <span>Resume Builder</span>
        </Link>
        <nav aria-label="External links" className="topbar-meta">
          <a href={siteConfig.creator.blog} rel="noreferrer" target="_blank">
            Blog post
          </a>
          <span aria-hidden="true" className="sep">
            /
          </span>
          <a
            href={siteConfig.creator.linkedIn}
            rel="noreferrer"
            target="_blank"
          >
            LinkedIn
          </a>
          <span aria-hidden="true" className="sep">
            /
          </span>
          <a href={siteConfig.creator.url} rel="noreferrer" target="_blank">
            koriel.kr
          </a>
        </nav>
      </header>

      <main className="shell">
        <section className="hero">
          <div>
            <p className="hero-kicker">LinkedIn PDF → JSON Resume → ATS PDF</p>
            <h1>
              Turn a LinkedIn export into a resume that passes the scanners.
            </h1>
            <p className="hero-body">
              Upload the PDF, guide each parsed field in a structured editor,
              then export the same polished layout shipped at
              <span className="inline-link"> koriel.kr/resume/resume.pdf</span>.
              Works globally, in any language LinkedIn exports.
            </p>

            <ol className="stepper" role="list">
              {steps.map((step) => (
                <li className="step" key={step.num}>
                  <span className="step-num">— {step.num}</span>
                  <span className="step-title">{step.title}</span>
                  <span className="step-body">{step.body}</span>
                </li>
              ))}
            </ol>
          </div>

          <aside className="hero-aside">
            <p className="eyebrow">What you get</p>
            <p className="hero-aside-title">
              A format that reads cleanly on both sides.
            </p>
            <ul className="hero-list">
              {heroBullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </section>

        <ResumeWorkbench />

        <footer className="signature">
          <div>
            Built by{" "}
            <a href={siteConfig.creator.url} rel="noreferrer" target="_blank">
              {siteConfig.creator.name} / devkoriel
            </a>{" "}
            — 8+ years in software engineering, remote from Seoul.
          </div>
          <div className="signature-group">
            <span>Hosted on Cloudflare Workers</span>
            <span aria-hidden="true">·</span>
            <a href={siteConfig.creator.blog} rel="noreferrer" target="_blank">
              Read the blog post
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
