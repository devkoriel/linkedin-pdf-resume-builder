import { normalizeResume, type ResumeSchema } from "./schema";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
}

function formatDate(dateString?: string): string {
  if (!dateString) {
    return "Present";
  }

  const [yearText, monthText = "01"] = dateString.split("-");
  const year = Number.parseInt(yearText, 10);
  const month = Number.parseInt(monthText, 10);

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return escapeHtml(dateString);
  }

  const date = new Date(Date.UTC(year, Math.max(month - 1, 0), 1));

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatYear(dateString?: string): string {
  return dateString ? formatDate(dateString).split(" ").at(-1) ?? "" : "";
}

function renderWorkSection(resume: ResumeSchema): string {
  if (resume.work.length === 0) {
    return "";
  }

  const items = resume.work
    .map((entry) => {
      const dateRange = `${formatDate(entry.startDate)} – ${formatDate(entry.endDate)}`;
      const title = [
        entry.position ? `<strong>${escapeHtml(entry.position)}</strong>` : "",
        entry.name ? escapeHtml(entry.name) : "",
      ]
        .filter(Boolean)
        .join(" &middot; ");
      const summary = entry.summary
        ? `<div class="entry-sub">${escapeHtml(entry.summary)}</div>`
        : "";
      const highlights = entry.highlights.length
        ? `<ul>${entry.highlights
            .map((highlight) => `<li>${escapeHtml(highlight)}</li>`)
            .join("")}</ul>`
        : "";

      return `
        <div class="entry">
          <div class="entry-header">
            <span class="entry-title">${title}</span>
            <span class="entry-date">${escapeHtml(dateRange)}</span>
          </div>
          ${summary}
          ${highlights}
        </div>
      `;
    })
    .join("");

  return `
    <section class="section">
      <h2>PROFESSIONAL EXPERIENCE</h2>
      ${items}
    </section>
  `;
}

function renderEducationSection(resume: ResumeSchema): string {
  if (resume.education.length === 0) {
    return "";
  }

  const items = resume.education
    .map((entry) => {
      const dateRange = `${formatDate(entry.startDate)} – ${formatDate(entry.endDate)}`;
      const descriptor = [entry.studyType, entry.area].filter(Boolean).join(" in ");

      return `
        <div class="entry-row">
          <span><strong>${escapeHtml(entry.institution)}</strong>${descriptor ? ` &middot; ${escapeHtml(descriptor)}` : ""}</span>
          <span class="entry-date">${escapeHtml(dateRange)}</span>
        </div>
      `;
    })
    .join("");

  return `
    <section class="section">
      <h2>EDUCATION</h2>
      ${items}
    </section>
  `;
}

function renderSimpleListSection(title: string, items: string[]): string {
  if (items.length === 0) {
    return "";
  }

  return `
    <section class="section">
      <h2>${title}</h2>
      <ul>
        ${items.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </section>
  `;
}

export function buildResumeHtml(input: ResumeSchema): string {
  const resume = normalizeResume(input);
  const pageInset = "20mm";
  const screenPagePadding = pageInset;
  const printPageMargin = pageInset;
  const contactParts = [
    resume.basics.email,
    resume.basics.phone,
    resume.basics.location.city && resume.basics.location.countryCode
      ? `${resume.basics.location.city}, ${resume.basics.location.countryCode}`
      : "",
    resume.basics.url ? displayUrl(resume.basics.url) : "",
  ]
    .filter(Boolean)
    .map(escapeHtml);

  const profileLinks = resume.basics.profiles
    .filter((profile) => profile.url)
    .map((profile) => {
      const display = displayUrl(profile.url);

      return `<a href="${escapeHtml(profile.url)}">${escapeHtml(display)}</a>`;
    })
    .join("&nbsp; | &nbsp;");

  const skillsSection =
    resume.skills.length === 0
      ? ""
      : `
        <section class="section">
          <h2>TECHNICAL SKILLS</h2>
          <div class="skills">
            ${resume.skills
              .map((skill) => {
                const keywords = skill.keywords.map(escapeHtml).join(", ");

                return `<div class="skill-row"><strong>${escapeHtml(skill.name)}:</strong> ${keywords}</div>`;
              })
              .join("")}
          </div>
        </section>
      `;

  const publications = resume.publications.map((entry) => {
    const parts = [escapeHtml(entry.name)];

    if (entry.publisher) {
      parts.push(escapeHtml(entry.publisher));
    }

    if (entry.releaseDate) {
      parts.push(escapeHtml(formatYear(entry.releaseDate)));
    }

    return parts.join(" | ");
  });

  const awards = resume.awards.map((entry) => {
    const parts = [escapeHtml(entry.title)];

    if (entry.awarder) {
      parts.push(escapeHtml(entry.awarder));
    }

    if (entry.date) {
      parts.push(escapeHtml(formatYear(entry.date)));
    }

    return parts.join(" | ");
  });

  const languagesLine = resume.languages
    .map((entry) => `${escapeHtml(entry.language)} (${escapeHtml(entry.fluency)})`)
    .join(", ");

  const languagesSection = languagesLine
    ? `
        <section class="section">
          <h2>LANGUAGES</h2>
          <p class="extras">${languagesLine}</p>
        </section>
      `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      @page { margin: ${printPageMargin}; size: A4; }
      html { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #ffffff; }
      body {
        background: #ffffff;
        color: #222222;
        font-family: "Helvetica Neue", Arial, "Segoe UI", sans-serif;
        font-size: 9.5pt;
        line-height: 1.45;
        margin: 0;
      }
      a { color: #222222; text-decoration: none; }
      .page { padding: ${screenPagePadding}; }
      @media print {
        .page { padding: 0; }
      }
      h1 {
        font-size: 22pt;
        font-weight: 700;
        letter-spacing: -0.5pt;
        margin-bottom: 3pt;
      }
      .label {
        color: #555555;
        font-size: 11pt;
        margin-bottom: 5pt;
      }
      .contact {
        color: #666666;
        font-size: 8.5pt;
        line-height: 1.6;
      }
      .contact a { color: #666666; }
      .divider {
        border: none;
        border-top: 1.5pt solid #222222;
        margin: 12pt 0 10pt;
      }
      .summary {
        color: #333333;
        line-height: 1.5;
        margin-bottom: 12pt;
      }
      .section {
        margin-bottom: 12pt;
      }
      h2 {
        border-bottom: 0.75pt solid #dddddd;
        break-after: avoid;
        color: #222222;
        font-size: 9pt;
        font-weight: 700;
        letter-spacing: 0.8pt;
        margin-bottom: 8pt;
        padding-bottom: 4pt;
        page-break-after: avoid;
        text-transform: uppercase;
      }
      .skills {
        font-size: 8.5pt;
        line-height: 1.5;
      }
      .skill-row { margin-bottom: 2pt; }
      .entry {
        break-inside: avoid;
        margin-bottom: 10pt;
        page-break-inside: avoid;
      }
      .entry-header,
      .entry-sub,
      .entry-row,
      .skill-row {
        break-after: avoid;
        page-break-after: avoid;
      }
      .entry-header {
        align-items: baseline;
        display: flex;
        gap: 12pt;
        justify-content: space-between;
        margin-bottom: 1pt;
      }
      .entry-title {
        flex: 1;
        font-size: 9.5pt;
      }
      .entry-date {
        color: #666666;
        flex-shrink: 0;
        font-size: 8.5pt;
        margin-left: 12pt;
        white-space: nowrap;
      }
      .entry-sub {
        color: #777777;
        font-size: 8.5pt;
        font-style: italic;
        margin-bottom: 2pt;
      }
      ul {
        margin: 3pt 0 0 16pt;
        padding: 0;
      }
      li {
        color: #333333;
        font-size: 8.5pt;
        line-height: 1.45;
        margin-bottom: 1.5pt;
      }
      .entry-row {
        align-items: baseline;
        display: flex;
        font-size: 9.5pt;
        justify-content: space-between;
        margin-bottom: 4pt;
      }
      .extras {
        color: #333333;
        font-size: 8.5pt;
        line-height: 1.5;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <h1>${escapeHtml(resume.basics.name)}</h1>
      <div class="label">${escapeHtml(resume.basics.label)}</div>
      <div class="contact">${contactParts.join(" &middot; ")}</div>
      ${profileLinks ? `<div class="contact">${profileLinks}</div>` : ""}
      <hr class="divider" />
      ${resume.basics.summary ? `<div class="summary">${escapeHtml(resume.basics.summary)}</div>` : ""}
      ${skillsSection}
      ${renderWorkSection(resume)}
      ${renderEducationSection(resume)}
      ${renderSimpleListSection("PUBLICATIONS", publications)}
      ${renderSimpleListSection("AWARDS", awards)}
      ${languagesSection}
    </div>
  </body>
</html>`;
}
