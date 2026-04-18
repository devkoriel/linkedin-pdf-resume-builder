import {
  createEmptyResume,
  DEFAULT_RESUME_SCHEMA_URL,
  type ResumeAward,
  type ResumeBasics,
  type ResumeEducation,
  type ResumeLanguage,
  type ResumeProfile,
  type ResumePublication,
  type ResumeSchema,
  type ResumeSkill,
  type ResumeWork,
} from "./schema";

type ContentSection =
  | "about"
  | "awards"
  | "contact"
  | "education"
  | "experience"
  | "languages"
  | "publications"
  | "skills";

interface ParsedDateRange {
  startDate: string;
  endDate?: string;
}

interface ParsedResumeResult {
  normalizedText: string;
  resume: ResumeSchema;
  warnings: string[];
}

const SECTION_ALIASES: Record<ContentSection, string[]> = {
  about: ["ABOUT", "SUMMARY", "PROFILE"],
  awards: ["AWARDS", "HONORS AWARDS", "HONORS & AWARDS"],
  contact: ["CONTACT"],
  education: ["EDUCATION"],
  experience: ["EXPERIENCE", "PROFESSIONAL EXPERIENCE"],
  languages: ["LANGUAGES"],
  publications: ["PUBLICATIONS", "PUBLICATION"],
  skills: ["SKILLS", "TECHNICAL SKILLS", "TOP SKILLS"],
};

const ACTION_VERBS = new Set([
  "architected",
  "automated",
  "build",
  "built",
  "configured",
  "containerized",
  "created",
  "designed",
  "developed",
  "drive",
  "drove",
  "enhanced",
  "enforced",
  "established",
  "hardened",
  "implemented",
  "lead",
  "led",
  "maintained",
  "managed",
  "migrated",
  "operated",
  "promoted",
  "provisioned",
  "refactored",
  "stabilized",
]);

const MONTH_MAP = new Map<string, string>([
  ["jan", "01"],
  ["feb", "02"],
  ["mar", "03"],
  ["apr", "04"],
  ["may", "05"],
  ["jun", "06"],
  ["jul", "07"],
  ["aug", "08"],
  ["sep", "09"],
  ["oct", "10"],
  ["nov", "11"],
  ["dec", "12"],
]);

const COUNTRY_CODE_MAP = new Map<string, string>([
  ["kr", "KR"],
  ["korea", "KR"],
  ["south korea", "KR"],
  ["republic of korea", "KR"],
  ["us", "US"],
  ["united states", "US"],
  ["usa", "US"],
  ["uk", "GB"],
  ["united kingdom", "GB"],
  ["japan", "JP"],
  ["singapore", "SG"],
]);

const SKILL_CATEGORY_RULES = [
  {
    category: "Container Orchestration",
    keywords: ["argocd", "eks", "helm", "kops", "kubernetes", "openshift"],
  },
  {
    category: "Infrastructure as Code",
    keywords: ["ansible", "cloudformation", "hcl", "ipfs", "pulumi", "terraform"],
  },
  {
    category: "Observability",
    keywords: ["alloy", "datadog", "elk", "grafana", "loki", "mimir", "prometheus"],
  },
  {
    category: "Networking & Security",
    keywords: ["aws waf", "ebpf", "haproxy", "istio", "kong", "network", "security", "xdp"],
  },
  {
    category: "CI/CD",
    keywords: ["ci/cd", "github actions", "gitops", "jenkins"],
  },
  {
    category: "Cloud",
    keywords: ["aws", "docker", "ecs", "gcp", "lambda", "msk", "vpc", "web3"],
  },
  {
    category: "Languages",
    keywords: ["bash", "c++", "go", "hcl", "java", "javascript", "lua", "python", "rust", "swift", "typescript"],
  },
];

function normalizeRawText(rawText: string): string {
  return rawText
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n")
    .replaceAll("\u00a0", " ")
    .replaceAll("\u2022", "\n• ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function canonicalizeHeading(line: string): string {
  return line.toUpperCase().replace(/[^A-Z ]+/g, " ").replace(/\s+/g, " ").trim();
}

function resolveSectionName(line: string): ContentSection | null {
  const canonical = canonicalizeHeading(line);

  for (const [section, aliases] of Object.entries(SECTION_ALIASES) as [
    ContentSection,
    string[],
  ][]) {
    if (aliases.includes(canonical)) {
      return section;
    }
  }

  return null;
}

function shouldDropLine(line: string): boolean {
  return (
    /^page \d+ of \d+$/i.test(line) ||
    /^-- \d+ of \d+ --$/i.test(line) ||
    /^\(.+\)$/.test(line)
  );
}

function looksLikePersonName(line: string): boolean {
  const compacted = line.trim();

  if (
    !compacted ||
    /\d/.test(compacted) ||
    resolveSectionName(compacted) ||
    COUNTRY_CODE_MAP.has(compacted.toLowerCase())
  ) {
    return false;
  }

  const parts = compacted.split(/\s+/).filter(Boolean);

  if (parts.length < 2 || parts.length > 4) {
    return false;
  }

  return parts.every((part) => /^[A-Z][a-z'-]+$/.test(part));
}

function looksLikeEmail(line: string): boolean {
  return /\b[^@\s]+@[^@\s]+\.[^@\s]+\b/.test(line);
}

function looksLikePhone(line: string): boolean {
  return /^\+?[0-9][0-9 ()-]{6,}$/.test(line);
}

function looksLikeUrl(line: string): boolean {
  return /(?:https?:\/\/)?(?:www\.)?[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?$/i.test(line);
}

function normalizeUrl(rawUrl: string): string {
  if (!rawUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }

  return `https://${rawUrl}`;
}

function getNetworkName(url: string): string {
  const normalized = normalizeUrl(url);

  if (normalized.includes("github.com")) {
    return "GitHub";
  }

  if (normalized.includes("linkedin.com")) {
    return "LinkedIn";
  }

  if (normalized.includes("x.com") || normalized.includes("twitter.com")) {
    return "X";
  }

  return "Website";
}

function getUsernameFromUrl(url: string): string {
  try {
    const parsed = new URL(normalizeUrl(url));
    const segments = parsed.pathname.split("/").filter(Boolean);

    return segments.at(-1) ?? "";
  } catch {
    return "";
  }
}

function parseLocation(line: string) {
  const compacted = line.trim().replace(/\s+/g, " ");

  if (!compacted.includes(",")) {
    return null;
  }

  const segments = compacted.split(",").map((segment) => segment.trim()).filter(Boolean);
  const city = segments[0] ?? "";
  const countryLabel = segments.at(-1)?.toLowerCase() ?? "";
  const countryCode = COUNTRY_CODE_MAP.get(countryLabel);

  if (!city || !countryCode) {
    return null;
  }

  return {
    city,
    countryCode,
  };
}

function looksLikeLocation(line: string): boolean {
  const compacted = line.trim().toLowerCase();

  return (
    /^remote$/i.test(line) ||
    COUNTRY_CODE_MAP.has(compacted) ||
    /\b(district|gu|si)\b/i.test(compacted) ||
    parseLocation(line) !== null
  );
}

function parseMonthYear(input: string): string {
  const trimmed = input.trim();

  if (/^\d{4}$/.test(trimmed)) {
    return `${trimmed}-01-01`;
  }

  const match = trimmed.match(/^(?<month>[A-Za-z]{3,9})\s+(?<year>\d{4})$/);

  if (!match?.groups) {
    return "";
  }

  const month = MONTH_MAP.get(match.groups.month.slice(0, 3).toLowerCase());

  if (!month) {
    return "";
  }

  return `${match.groups.year}-${month}-01`;
}

function parseDateRange(line: string): ParsedDateRange | null {
  const normalized = line
    .replace(/[–—]/g, "-")
    .replace(/\s+\([^)]*\)$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const match = normalized.match(
    /^(?<start>(?:[A-Za-z]{3,9}\s+\d{4})|\d{4})\s*-\s*(?<end>(?:[A-Za-z]{3,9}\s+\d{4})|\d{4}|Present)$/i,
  );

  if (!match?.groups) {
    return null;
  }

  const startDate = parseMonthYear(match.groups.start);

  if (!startDate) {
    return null;
  }

  return {
    startDate,
    endDate: /^present$/i.test(match.groups.end)
      ? undefined
      : parseMonthYear(match.groups.end),
  };
}

function extractTrailingDateRange(line: string): ParsedDateRange | null {
  const normalized = line
    .replace(/[–—]/g, "-")
    .replace(/\s+\([^)]*\)$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const match = normalized.match(
    /(?<start>(?:[A-Za-z]{3,9}\s+\d{4})|\d{4})\s*-\s*(?<end>(?:[A-Za-z]{3,9}\s+\d{4})|\d{4}|Present)$/i,
  );

  if (!match?.groups) {
    return null;
  }

  const startDate = parseMonthYear(match.groups.start);

  if (!startDate) {
    return null;
  }

  return {
    startDate,
    endDate: /^present$/i.test(match.groups.end)
      ? undefined
      : parseMonthYear(match.groups.end),
  };
}

function compactLine(line: string): string {
  return line.replace(/^[-•]\s*/, "").trim();
}

function getWordCount(line: string): number {
  return compactLine(line).split(/\s+/).filter(Boolean).length;
}

function startsWithActionVerb(line: string): boolean {
  const firstWord = compactLine(line).split(/\s+/)[0]?.toLowerCase() ?? "";

  return ACTION_VERBS.has(firstWord);
}

function looksLikeRoleTitle(line: string): boolean {
  const compacted = compactLine(line);
  const startsWithVerb = startsWithActionVerb(compacted);
  const allowLeadTitle = /^lead\s+of\b/i.test(compacted);

  if (
    !compacted ||
    parseDateRange(compacted) ||
    isDurationOnlyLine(compacted) ||
    looksLikeLocation(compacted) ||
    looksLikeEmail(compacted) ||
    looksLikePhone(compacted) ||
    looksLikeUrl(compacted) ||
    (startsWithVerb && !allowLeadTitle)
  ) {
    return false;
  }

  if (getWordCount(compacted) > 8) {
    return false;
  }

  return /(engineer|developer|manager|lead|architect|specialist|administrator|director|consultant|researcher|designer|founder|officer|technician|intern|reliability|security|devops|devsecops|operations|sre)\b/i.test(
    compacted,
  );
}

function looksLikeCompanyName(line: string): boolean {
  const compacted = compactLine(line);

  if (
    !compacted ||
    parseDateRange(compacted) ||
    isDurationOnlyLine(compacted) ||
    looksLikeLocation(compacted) ||
    looksLikeEmail(compacted) ||
    looksLikePhone(compacted) ||
    looksLikeUrl(compacted) ||
    looksLikePersonName(compacted) ||
    looksLikeRoleTitle(compacted) ||
    startsWithActionVerb(compacted)
  ) {
    return false;
  }

  if (getWordCount(compacted) > 8 || /[.!?]$/.test(compacted)) {
    return false;
  }

  return true;
}

function shouldMergeWithPrevious(previous: string, line: string): boolean {
  if (/-$/.test(previous)) {
    return true;
  }

  if (/[,:/+(&]$/.test(previous)) {
    return true;
  }

  if (/^[a-z(]/.test(line) && !looksLikePersonName(line)) {
    return true;
  }

  return (
    previous.length >= 24 &&
    getWordCount(line) <= 4 &&
    !startsWithActionVerb(line) &&
    !looksLikeCompanyName(line) &&
    !looksLikeRoleTitle(line) &&
    !looksLikeLocation(line) &&
    !parseDateRange(line) &&
    !isDurationOnlyLine(line)
  );
}

function isLikelyWorkLocationLine(line: string): boolean {
  const compacted = compactLine(line);

  if (looksLikeLocation(compacted)) {
    return true;
  }

  if (
    !compacted ||
    parseDateRange(compacted) ||
    isDurationOnlyLine(compacted) ||
    looksLikeRoleTitle(compacted) ||
    startsWithActionVerb(compacted) ||
    compacted.length > 40
  ) {
    return false;
  }

  return (
    getWordCount(compacted) <= 4 &&
    compacted
      .split(/\s+/)
      .filter(Boolean)
      .every((word) => /^[A-Z][A-Za-z.-]*$/.test(word))
  );
}

function mergeWrappedLines(lines: string[]): string[] {
  const merged: string[] = [];

  for (const rawLine of lines) {
    const line = compactLine(rawLine);

    if (!line || shouldDropLine(line)) {
      continue;
    }

    const previous = merged.at(-1);

    if (!previous) {
      merged.push(line);
      continue;
    }

    if (shouldMergeWithPrevious(previous, line)) {
      merged[merged.length - 1] = /-$/.test(previous) ? `${previous}${line}` : `${previous} ${line}`;
      continue;
    }

    merged.push(line);
  }

  return merged;
}

function collectSections(lines: string[]) {
  const sections: Partial<Record<ContentSection, string[]>> = {};
  let activeSection: ContentSection | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    const sectionName = resolveSectionName(line);

    if (sectionName) {
      activeSection = sectionName;
      sections[sectionName] ??= [];
      continue;
    }

    if (activeSection) {
      sections[activeSection]?.push(line);
    }
  }

  return sections;
}

function mergeBasics(contactBasics: ResumeBasics, headerBasics: ResumeBasics): ResumeBasics {
  const profiles = new Map<string, ResumeProfile>();

  for (const profile of [...contactBasics.profiles, ...headerBasics.profiles]) {
    profiles.set(profile.url, profile);
  }

  return {
    ...contactBasics,
    ...headerBasics,
    email: headerBasics.email || contactBasics.email,
    phone: headerBasics.phone || contactBasics.phone,
    url: headerBasics.url || contactBasics.url,
    location:
      headerBasics.location.city || headerBasics.location.countryCode
        ? headerBasics.location
        : contactBasics.location,
    profiles: [...profiles.values()].filter((profile) => profile.network !== "Website"),
  };
}

function parseBasics(lines: string[]): ResumeBasics {
  const basics = createEmptyResume().basics;
  const profiles = new Map<string, ResumeProfile>();
  const rawLines = lines.map((line) => line.trim()).filter(Boolean);
  const nonEmptyLines =
    rawLines[0] && looksLikePersonName(rawLines[0]) ? mergeWrappedLines(rawLines) : rawLines;

  if (nonEmptyLines.length > 0 && looksLikePersonName(nonEmptyLines[0])) {
    basics.name = nonEmptyLines[0];
  }

  let cursor = basics.name ? 1 : 0;
  const labelCandidate = nonEmptyLines[cursor] ?? "";
  const cleanedLabelCandidate = labelCandidate.replace(/\s*\([^)]*\)$/g, "").trim();

  if (
    cleanedLabelCandidate &&
    !looksLikeEmail(cleanedLabelCandidate) &&
    !looksLikePhone(cleanedLabelCandidate) &&
    !looksLikeUrl(cleanedLabelCandidate) &&
    !looksLikeLocation(cleanedLabelCandidate)
  ) {
    basics.label = cleanedLabelCandidate;
    cursor += 1;
  }

  for (const line of nonEmptyLines.slice(cursor)) {
    const fragments = line
      .split(/[|·]/)
      .map((fragment) => fragment.trim())
      .filter(Boolean);

    for (const fragment of fragments.length > 0 ? fragments : [line]) {
      const cleanedFragment = fragment.replace(/\s*\([^)]*\)$/g, "").trim();

      if (!cleanedFragment) {
        continue;
      }

      if (!basics.email && looksLikeEmail(cleanedFragment)) {
        basics.email = cleanedFragment;
        continue;
      }

      if (!basics.phone && looksLikePhone(cleanedFragment)) {
        basics.phone = cleanedFragment;
        continue;
      }

      const location = parseLocation(cleanedFragment);

      if (!basics.location.city && location) {
        basics.location = location;
        continue;
      }

      if (looksLikeUrl(cleanedFragment)) {
        const normalized = normalizeUrl(cleanedFragment);
        const network = getNetworkName(normalized);

        if (network === "Website" && !basics.url) {
          basics.url = normalized;
          continue;
        }

        profiles.set(normalized, {
          network,
          username: getUsernameFromUrl(normalized),
          url: normalized,
        });
      }
    }
  }

  basics.profiles = [...profiles.values()];

  return basics;
}

function isLikelySummaryLine(line: string): boolean {
  if (!line.endsWith(".")) {
    return false;
  }

  const firstWord = line.split(/\s+/)[0]?.toLowerCase() ?? "";
  const wordCount = line.split(/\s+/).length;

  if (ACTION_VERBS.has(firstWord)) {
    return false;
  }

  return wordCount <= 14 || /(platform|exchange|protocols|game|company|marketplace)/i.test(line);
}

function isDurationOnlyLine(line: string): boolean {
  return /^\d+\s+(?:year|month)s?(?:\s+\d+\s+(?:year|month)s?)?$/i.test(line);
}

function cleanCompanyName(name: string): string {
  return name.split("|")[0]?.trim() ?? name.trim();
}

function detectWorkHeader(lines: string[], index: number, currentCompany: string) {
  const line = lines[index] ?? "";
  const nextLine = lines[index + 1] ?? "";
  const nextNextLine = lines[index + 2] ?? "";
  const thirdNextLine = lines[index + 3] ?? "";

  if (extractTrailingDateRange(line) && line.includes(" · ")) {
    const range = extractTrailingDateRange(line);
    const normalized = line.replace(/\s+\([^)]*\)$/g, "");
    const dateMatch = normalized.match(
      /(?<date>(?:[A-Za-z]{3,9}\s+\d{4}|\d{4})\s*[-–—]\s*(?:[A-Za-z]{3,9}\s+\d{4}|\d{4}|Present))$/i,
    );

    if (!range || !dateMatch?.groups?.date) {
      return null;
    }

    const header = normalized.slice(0, normalized.lastIndexOf(dateMatch.groups.date)).trim();
    const [position, company] = header.split(/\s+·\s+/);

    if (!position || !company) {
      return null;
    }

    return {
      company: cleanCompanyName(company),
      nextIndex: index + 1,
      position,
      ...range,
    };
  }

  if (
    looksLikeCompanyName(line) &&
    looksLikeRoleTitle(nextLine) &&
    nextNextLine &&
    parseDateRange(nextNextLine)
  ) {
    return {
      company: cleanCompanyName(line),
      nextIndex: index + 3,
      position: nextLine,
      ...parseDateRange(nextNextLine)!,
    };
  }

  if (
    looksLikeCompanyName(line) &&
    nextLine &&
    nextNextLine &&
    thirdNextLine &&
    isDurationOnlyLine(nextLine) &&
    looksLikeRoleTitle(nextNextLine) &&
    parseDateRange(thirdNextLine)
  ) {
    return {
      company: cleanCompanyName(line),
      nextIndex: index + 4,
      position: nextNextLine,
      ...parseDateRange(thirdNextLine)!,
    };
  }

  if (currentCompany && looksLikeRoleTitle(line) && nextLine && parseDateRange(nextLine)) {
    return {
      company: currentCompany,
      nextIndex: index + 2,
      position: line,
      ...parseDateRange(nextLine)!,
    };
  }

  return null;
}

function collectWorkContent(
  lines: string[],
  startIndex: number,
  currentCompany: string,
): { items: string[]; nextIndex: number } {
  const collected: string[] = [];
  let cursor = startIndex;

  if (isLikelyWorkLocationLine(lines[cursor] ?? "")) {
    cursor += 1;
  }

  while (cursor < lines.length) {
    const nextHeader = detectWorkHeader(lines, cursor, currentCompany);

    if (nextHeader) {
      break;
    }

    const candidate = lines[cursor] ?? "";

    if (candidate && !shouldDropLine(candidate)) {
      collected.push(candidate);
    }

    cursor += 1;
  }

  return {
    items: mergeWrappedLines(collected),
    nextIndex: cursor,
  };
}

function parseWork(lines: string[]): ResumeWork[] {
  const mergedLines = mergeWrappedLines(lines).filter(Boolean);
  const work: ResumeWork[] = [];
  let cursor = 0;
  let currentCompany = "";

  while (cursor < mergedLines.length) {
    const header = detectWorkHeader(mergedLines, cursor, currentCompany);

    if (!header) {
      cursor += 1;
      continue;
    }

    currentCompany = header.company;

    const content = collectWorkContent(mergedLines, header.nextIndex, currentCompany);
    let summary = "";
    let highlights = content.items;

    if (highlights[0] && isLikelySummaryLine(highlights[0])) {
      summary = highlights[0];
      highlights = highlights.slice(1);
    }

    work.push({
      name: header.company,
      position: header.position,
      startDate: header.startDate,
      endDate: header.endDate,
      summary,
      highlights,
    });

    cursor = content.nextIndex;
  }

  return work;
}

function parseEducation(lines: string[]): ResumeEducation[] {
  const mergedLines = mergeWrappedLines(lines);
  const education: ResumeEducation[] = [];

  for (let index = 0; index < mergedLines.length; index += 1) {
    const institution = mergedLines[index] ?? "";
    const nextLine = mergedLines[index + 1] ?? "";

    if (!institution || !nextLine) {
      continue;
    }

    const inlineMatch = nextLine.match(/^(?<descriptor>.+?)\s*·\s*\((?<dates>.+)\)$/);

    if (inlineMatch?.groups) {
      const range = parseDateRange(inlineMatch.groups.dates);

      if (range) {
        const descriptor = inlineMatch.groups.descriptor.trim();
        const [studyType, area] = descriptor.includes(",")
          ? descriptor.split(",").map((value) => value.trim())
          : descriptor.includes(" in ")
            ? descriptor.split(/\s+in\s+/i)
            : ["", descriptor];

        education.push({
          institution,
          area: (area ?? "").trim(),
          studyType: (studyType ?? "").trim(),
          startDate: range.startDate,
          endDate: range.endDate ?? "",
        });
        index += 1;
        continue;
      }
    }

    const trailingRange = extractTrailingDateRange(nextLine);

    if (trailingRange) {
      const descriptor = nextLine
        .replace(/\s+\([^)]*\)$/g, "")
        .replace(/[–—]/g, "-")
        .replace(/\s+/g, " ")
        .trim();
      const dateMatch = descriptor.match(
        /(?<date>(?:[A-Za-z]{3,9}\s+\d{4}|\d{4})\s*-\s*(?:[A-Za-z]{3,9}\s+\d{4}|\d{4}|Present))$/i,
      );
      const descriptorWithoutDates = dateMatch?.groups?.date
        ? descriptor.slice(0, descriptor.lastIndexOf(dateMatch.groups.date)).replace(/·$/, "").trim()
        : descriptor;
      const [studyType, area] = descriptorWithoutDates.includes(",")
        ? descriptorWithoutDates.split(",").map((value) => value.trim())
        : descriptorWithoutDates.includes(" in ")
          ? descriptorWithoutDates.split(/\s+in\s+/i)
          : ["", descriptorWithoutDates];

      education.push({
        institution,
        area: (area ?? "").trim(),
        studyType: (studyType ?? "").trim(),
        startDate: trailingRange.startDate,
        endDate: trailingRange.endDate ?? "",
      });
      index += 1;
    }
  }

  return education;
}

function inferSkillCategory(skillName: string): string {
  const normalizedSkill = skillName.toLowerCase();

  for (const rule of SKILL_CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => normalizedSkill.includes(keyword))) {
      return rule.category;
    }
  }

  return "Additional";
}

function parseSkills(lines: string[]): ResumeSkill[] {
  const categories = new Map<string, string[]>();

  for (const line of mergeWrappedLines(lines)) {
    if (!line) {
      continue;
    }

    if (line.includes(":")) {
      const [category, value] = line.split(":");
      const keywords = value
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean);

      categories.set(category.trim(), keywords);
      continue;
    }

    const category = inferSkillCategory(line);
    const current = categories.get(category) ?? [];

    current.push(line);
    categories.set(category, [...new Set(current)]);
  }

  return [...categories.entries()].map(([name, keywords]) => ({
    name,
    keywords,
  }));
}

function parseLanguages(lines: string[]): ResumeLanguage[] {
  return mergeWrappedLines(lines)
    .flatMap((line) =>
      line
        .split(/,\s+(?=[A-Za-z].*?\()/)
        .map((entry) => entry.trim())
        .filter(Boolean),
    )
    .map((entry) => {
      const hyphenMatch = entry.match(/^(?<language>.+?)\s*[-–]\s*(?<fluency>.+)$/);

      if (hyphenMatch?.groups) {
        return {
          language: hyphenMatch.groups.language.trim(),
          fluency: hyphenMatch.groups.fluency.trim(),
        };
      }

      const parenMatch = entry.match(/^(?<language>.+?)\s*\((?<fluency>.+)\)$/);

      if (parenMatch?.groups) {
        return {
          language: parenMatch.groups.language.trim(),
          fluency: parenMatch.groups.fluency.trim(),
        };
      }

      return null;
    })
    .filter((entry): entry is ResumeLanguage => Boolean(entry));
}

function parsePublications(lines: string[]): ResumePublication[] {
  const merged = mergeWrappedLines(lines)
    .filter(Boolean)
    .reduce<string[]>((items, line) => {
      if (items.length > 0 && !items.at(-1)?.includes("|") && !line.includes("|")) {
        items[items.length - 1] = `${items[items.length - 1]} ${line}`.trim();
        return items;
      }

      items.push(line);
      return items;
    }, []);

  return merged.map((line) => {
      const parts = line.split("|").map((value) => value.trim());

      return {
        name: parts[0] ?? line,
        publisher: parts[1] ?? "",
        releaseDate: parts[2] ? `${parts[2].slice(0, 4)}-01-01` : "",
      };
    });
}

function parseAwards(lines: string[]): ResumeAward[] {
  return mergeWrappedLines(lines)
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((value) => value.trim());

      return {
        title: parts[0] ?? line,
        awarder: parts[1] ?? "",
        date: parts[2] ? `${parts[2].slice(0, 4)}-01-01` : "",
      };
    });
}

function parseSummary(lines: string[]): string {
  return mergeWrappedLines(lines).join(" ");
}

export function parseLinkedInProfileText(rawText: string): ParsedResumeResult {
  const normalizedText = normalizeRawText(rawText);
  const cleanedLines = normalizedText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !shouldDropLine(line));
  const summaryIndex = cleanedLines.findIndex((line) => resolveSectionName(line) === "about");
  const experienceIndex = cleanedLines.findIndex(
    (line) => resolveSectionName(line) === "experience",
  );
  const nameSearchBoundary = summaryIndex >= 0 ? summaryIndex : experienceIndex;
  const nameCandidates = cleanedLines
    .map((line, index) => ({ line, index }))
    .filter(
      ({ line, index }) =>
        (nameSearchBoundary < 0 || index < nameSearchBoundary) && looksLikePersonName(line),
    );
  const nameIndex = nameCandidates.at(-1)?.index ?? -1;

  const prefixLines = nameIndex > 0 ? cleanedLines.slice(0, nameIndex) : [];
  const prefaceSections = collectSections(prefixLines);
  const basicsHeaderLines =
    nameIndex >= 0
      ? cleanedLines.slice(nameIndex, summaryIndex > nameIndex ? summaryIndex : experienceIndex)
      : [];
  const mainSections = collectSections(
    summaryIndex >= 0 ? cleanedLines.slice(summaryIndex) : cleanedLines,
  );
  const warnings: string[] = [];

  const contactBasics = parseBasics(prefaceSections.contact ?? []);
  const headerBasics = parseBasics(basicsHeaderLines);
  const basics = mergeBasics(contactBasics, headerBasics);
  const skills = parseSkills([
    ...(prefaceSections.skills ?? []),
    ...(mainSections.skills ?? []),
  ]);
  const languages = parseLanguages([
    ...(prefaceSections.languages ?? []),
    ...(mainSections.languages ?? []),
  ]);
  const publications = parsePublications([
    ...(prefaceSections.publications ?? []),
    ...(mainSections.publications ?? []),
  ]);
  const awards = parseAwards([
    ...(prefaceSections.awards ?? []),
    ...(mainSections.awards ?? []),
  ]);
  const work = parseWork(mainSections.experience ?? []);
  const education = parseEducation(mainSections.education ?? []);
  const firstWorkLocation = mergeWrappedLines(mainSections.experience ?? []).find((line) =>
    Boolean(parseLocation(line)),
  );

  if (!basics.location.city && firstWorkLocation) {
    const location = parseLocation(firstWorkLocation);

    if (location) {
      basics.location = location;
    }
  }

  if (work.length === 0) {
    warnings.push("No Experience section detected.");
  }

  if (skills.length === 0) {
    warnings.push("No Skills section detected.");
  }

  const resume: ResumeSchema = {
    ...createEmptyResume(),
    $schema: DEFAULT_RESUME_SCHEMA_URL,
    basics: {
      ...basics,
      summary: parseSummary(mainSections.about ?? []),
    },
    work,
    education,
    skills,
    languages,
    publications,
    awards,
  };

  return {
    normalizedText,
    resume,
    warnings,
  };
}
