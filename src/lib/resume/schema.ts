import { z } from "zod";

export const DEFAULT_RESUME_SCHEMA_URL =
  "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json";

export interface ResumeProfile {
  network: string;
  username: string;
  url: string;
}

export interface ResumeBasics {
  name: string;
  label: string;
  email: string;
  phone: string;
  url: string;
  summary: string;
  location: {
    city: string;
    countryCode: string;
  };
  profiles: ResumeProfile[];
}

export interface ResumeWork {
  name: string;
  position: string;
  url?: string;
  startDate: string;
  endDate?: string;
  summary: string;
  highlights: string[];
}

export interface ResumeEducation {
  institution: string;
  area: string;
  studyType: string;
  startDate: string;
  endDate: string;
}

export interface ResumeSkill {
  name: string;
  keywords: string[];
}

export interface ResumeLanguage {
  language: string;
  fluency: string;
}

export interface ResumePublication {
  name: string;
  publisher: string;
  releaseDate: string;
}

export interface ResumeAward {
  title: string;
  awarder: string;
  date: string;
}

export interface ResumeSchema {
  $schema: string;
  basics: ResumeBasics;
  work: ResumeWork[];
  education: ResumeEducation[];
  skills: ResumeSkill[];
  languages: ResumeLanguage[];
  publications: ResumePublication[];
  awards: ResumeAward[];
}

const profileInputSchema = z.object({
  network: z.string().optional(),
  username: z.string().optional(),
  url: z.string().optional(),
});

const basicsInputSchema = z.object({
  name: z.string().optional(),
  label: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  url: z.string().optional(),
  summary: z.string().optional(),
  location: z
    .object({
      city: z.string().optional(),
      countryCode: z.string().optional(),
    })
    .partial()
    .optional(),
  profiles: z.array(profileInputSchema).optional(),
});

const workInputSchema = z.object({
  name: z.string().optional(),
  position: z.string().optional(),
  url: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

const educationInputSchema = z.object({
  institution: z.string().optional(),
  area: z.string().optional(),
  studyType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const skillInputSchema = z.object({
  name: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

const languageInputSchema = z.object({
  language: z.string().optional(),
  fluency: z.string().optional(),
});

const publicationInputSchema = z.object({
  name: z.string().optional(),
  publisher: z.string().optional(),
  releaseDate: z.string().optional(),
});

const awardInputSchema = z.object({
  title: z.string().optional(),
  awarder: z.string().optional(),
  date: z.string().optional(),
});

const resumeInputSchema = z
  .object({
    $schema: z.string().optional(),
    basics: basicsInputSchema.optional(),
    work: z.array(workInputSchema).optional(),
    education: z.array(educationInputSchema).optional(),
    skills: z.array(skillInputSchema).optional(),
    languages: z.array(languageInputSchema).optional(),
    publications: z.array(publicationInputSchema).optional(),
    awards: z.array(awardInputSchema).optional(),
  })
  .partial();

export function createEmptyResume(): ResumeSchema {
  return {
    $schema: DEFAULT_RESUME_SCHEMA_URL,
    basics: {
      name: "",
      label: "",
      email: "",
      phone: "",
      url: "",
      summary: "",
      location: {
        city: "",
        countryCode: "",
      },
      profiles: [],
    },
    work: [],
    education: [],
    skills: [],
    languages: [],
    publications: [],
    awards: [],
  };
}

function compactString(value?: string): string {
  return (value ?? "").trim();
}

export function normalizeResume(input: unknown): ResumeSchema {
  const parsed = resumeInputSchema.parse(input);
  const emptyResume = createEmptyResume();

  return {
    $schema: compactString(parsed.$schema) || emptyResume.$schema,
    basics: {
      ...emptyResume.basics,
      ...parsed.basics,
      name: compactString(parsed.basics?.name),
      label: compactString(parsed.basics?.label),
      email: compactString(parsed.basics?.email),
      phone: compactString(parsed.basics?.phone),
      url: compactString(parsed.basics?.url),
      summary: compactString(parsed.basics?.summary),
      location: {
        ...emptyResume.basics.location,
        ...parsed.basics?.location,
        city: compactString(parsed.basics?.location?.city),
        countryCode: compactString(parsed.basics?.location?.countryCode),
      },
      profiles: (parsed.basics?.profiles ?? []).map((profile) => ({
        network: compactString(profile.network),
        username: compactString(profile.username),
        url: compactString(profile.url),
      })),
    },
    work: (parsed.work ?? []).map((entry) => ({
      name: compactString(entry.name),
      position: compactString(entry.position),
      url: compactString(entry.url) || undefined,
      startDate: compactString(entry.startDate),
      endDate: compactString(entry.endDate) || undefined,
      summary: compactString(entry.summary),
      highlights: (entry.highlights ?? []).map(compactString).filter(Boolean),
    })),
    education: (parsed.education ?? []).map((entry) => ({
      institution: compactString(entry.institution),
      area: compactString(entry.area),
      studyType: compactString(entry.studyType),
      startDate: compactString(entry.startDate),
      endDate: compactString(entry.endDate),
    })),
    skills: (parsed.skills ?? []).map((entry) => ({
      name: compactString(entry.name),
      keywords: (entry.keywords ?? []).map(compactString).filter(Boolean),
    })),
    languages: (parsed.languages ?? []).map((entry) => ({
      language: compactString(entry.language),
      fluency: compactString(entry.fluency),
    })),
    publications: (parsed.publications ?? []).map((entry) => ({
      name: compactString(entry.name),
      publisher: compactString(entry.publisher),
      releaseDate: compactString(entry.releaseDate),
    })),
    awards: (parsed.awards ?? []).map((entry) => ({
      title: compactString(entry.title),
      awarder: compactString(entry.awarder),
      date: compactString(entry.date),
    })),
  };
}

export function safeParseResume(input: unknown) {
  const result = resumeInputSchema.safeParse(input);

  if (!result.success) {
    return result;
  }

  return {
    success: true as const,
    data: normalizeResume(result.data),
  };
}

