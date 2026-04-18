import { ResumeWorkbench } from "@/components/resume-workbench";

export default function Home() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="hero-kicker">LinkedIn PDF → JSON Resume → ATS PDF</p>
          <h1>Turn a LinkedIn export into the exact resume format you already ship.</h1>
          <p className="hero-body">
            Upload the profile PDF, guide each parsed field in a structured editor,
            then export a polished PDF that mirrors the layout at
            <span className="inline-link"> koriel.kr/resume/resume.pdf</span>.
          </p>
        </div>
        <div className="hero-card stack-card">
          <p className="eyebrow">Format targets</p>
          <ul className="hero-list">
            <li>Guided field-by-field editing instead of raw JSON-only cleanup</li>
            <li>System-font, ATS-safe HTML-to-PDF rendering</li>
            <li>Uppercase section rails, right-aligned dates, and italic company summaries</li>
            <li>JSON Resume export still available for advanced workflows</li>
          </ul>
          <div className="developer-card">
            <p className="eyebrow">Built by</p>
            <p className="developer-name">Jinsoo Heo / devkoriel</p>
            <p className="developer-copy">
              8+ years in software engineering. Building infrastructure for DeFi
              protocols. Remote worker from Seoul.
            </p>
            <div className="developer-links">
              <a href="https://koriel.kr" rel="noreferrer" target="_blank">
                koriel.kr
              </a>
              <a
                href="https://blog.koriel.kr/posts/json-resume-pdf-automation"
                rel="noreferrer"
                target="_blank"
              >
                Blog post
              </a>
              <a href="https://www.linkedin.com/in/devkoriel" rel="noreferrer" target="_blank">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      <ResumeWorkbench />
    </main>
  );
}
