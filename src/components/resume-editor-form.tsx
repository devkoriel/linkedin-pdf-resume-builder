"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";

import type {
  ResumeAward,
  ResumeEducation,
  ResumeLanguage,
  ResumePublication,
  ResumeSchema,
  ResumeSkill,
  ResumeWork,
} from "@/lib/resume/schema";

interface ResumeEditorFormProps {
  resume: ResumeSchema;
  setResume: Dispatch<SetStateAction<ResumeSchema>>;
}

interface EditorSectionProps {
  action?: ReactNode;
  children: ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
}

interface FieldProps {
  children: ReactNode;
  hint?: string;
  label: string;
}

function replaceArrayValue<T>(items: T[], index: number, value: T): T[] {
  return items.map((item, itemIndex) => (itemIndex === index ? value : item));
}

function removeArrayValue<T>(items: T[], index: number): T[] {
  return items.filter((_, itemIndex) => itemIndex !== index);
}

function appendArrayValue<T>(items: T[], value: T): T[] {
  return [...items, value];
}

function dateToMonthValue(date?: string): string {
  if (!date) {
    return "";
  }

  const [year = "", month = ""] = date.split("-");

  return year && month ? `${year}-${month}` : "";
}

function monthValueToDate(value: string): string {
  return value ? `${value}-01` : "";
}

function dateToYearValue(date?: string): string {
  return date ? date.slice(0, 4) : "";
}

function yearValueToDate(value: string): string {
  const year = value.trim();

  return year ? `${year}-01-01` : "";
}

function EditorSection({
  action,
  children,
  description,
  eyebrow = "Guided editor",
  title,
}: EditorSectionProps) {
  return (
    <section className="editor-section">
      <div className="editor-section-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3>{title}</h3>
          <p className="hint">{description}</p>
        </div>
        {action ? <div className="editor-section-action">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function Field({ children, hint, label }: FieldProps) {
  return (
    <label className="editor-field">
      <span className="editor-field-label">{label}</span>
      {children}
      {hint ? <span className="editor-field-hint">{hint}</span> : null}
    </label>
  );
}

function createEmptyWork(): ResumeWork {
  return {
    name: "",
    position: "",
    url: "",
    startDate: "",
    endDate: "",
    summary: "",
    highlights: [""],
  };
}

function createEmptySkill(): ResumeSkill {
  return {
    name: "",
    keywords: [""],
  };
}

function createEmptyEducation(): ResumeEducation {
  return {
    institution: "",
    area: "",
    studyType: "",
    startDate: "",
    endDate: "",
  };
}

function createEmptyPublication(): ResumePublication {
  return {
    name: "",
    publisher: "",
    releaseDate: "",
  };
}

function createEmptyAward(): ResumeAward {
  return {
    title: "",
    awarder: "",
    date: "",
  };
}

function createEmptyLanguage(): ResumeLanguage {
  return {
    language: "",
    fluency: "",
  };
}

export function ResumeEditorForm({ resume, setResume }: ResumeEditorFormProps) {
  return (
    <div className="guided-form">
      <EditorSection
        description="This controls the header block at the top of the PDF."
        title="Basics"
      >
        <div className="editor-grid editor-grid-two">
          <Field label="Full name">
            <input
              className="text-input"
              onChange={(event) =>
                setResume((current) => ({
                  ...current,
                  basics: {
                    ...current.basics,
                    name: event.target.value,
                  },
                }))
              }
              placeholder="Jinsoo Heo"
              type="text"
              value={resume.basics.name}
            />
          </Field>
          <Field label="Headline / role label">
            <input
              className="text-input"
              onChange={(event) =>
                setResume((current) => ({
                  ...current,
                  basics: {
                    ...current.basics,
                    label: event.target.value,
                  },
                }))
              }
              placeholder="DevOps Engineer"
              type="text"
              value={resume.basics.label}
            />
          </Field>
          <Field label="Email">
            <input
              className="text-input"
              onChange={(event) =>
                setResume((current) => ({
                  ...current,
                  basics: {
                    ...current.basics,
                    email: event.target.value,
                  },
                }))
              }
              placeholder="dev.koriel@gmail.com"
              type="email"
              value={resume.basics.email}
            />
          </Field>
          <Field label="Phone">
            <input
              className="text-input"
              onChange={(event) =>
                setResume((current) => ({
                  ...current,
                  basics: {
                    ...current.basics,
                    phone: event.target.value,
                  },
                }))
              }
              placeholder="+82 10-8975-9546"
              type="text"
              value={resume.basics.phone}
            />
          </Field>
          <Field label="Website">
            <input
              className="text-input"
              onChange={(event) =>
                setResume((current) => ({
                  ...current,
                  basics: {
                    ...current.basics,
                    url: event.target.value,
                  },
                }))
              }
              placeholder="https://koriel.kr"
              type="url"
              value={resume.basics.url}
            />
          </Field>
          <Field label="City">
            <input
              className="text-input"
              onChange={(event) =>
                setResume((current) => ({
                  ...current,
                  basics: {
                    ...current.basics,
                    location: {
                      ...current.basics.location,
                      city: event.target.value,
                    },
                  },
                }))
              }
              placeholder="Seoul"
              type="text"
              value={resume.basics.location.city}
            />
          </Field>
          <Field hint="Use ISO country codes like KR, US, SG." label="Country code">
            <input
              className="text-input"
              onChange={(event) =>
                setResume((current) => ({
                  ...current,
                  basics: {
                    ...current.basics,
                    location: {
                      ...current.basics.location,
                      countryCode: event.target.value.toUpperCase(),
                    },
                  },
                }))
              }
              placeholder="KR"
              type="text"
              value={resume.basics.location.countryCode}
            />
          </Field>
        </div>
      </EditorSection>

      <EditorSection
        action={
          <button
            className="mini-button"
            onClick={() =>
              setResume((current) => ({
                ...current,
                basics: {
                  ...current.basics,
                  profiles: appendArrayValue(current.basics.profiles, {
                    network: "",
                    username: "",
                    url: "",
                  }),
                },
              }))
            }
            type="button"
          >
            Add profile
          </button>
        }
        description="These render as the second contact line beneath the website."
        title="Profiles"
      >
        {resume.basics.profiles.length === 0 ? (
          <p className="empty-state">No profile links yet. Add GitHub, LinkedIn, X, or other public links.</p>
        ) : (
          <div className="editor-list">
            {resume.basics.profiles.map((profile, index) => (
              <article className="editor-card" key={`${profile.url}-${index}`}>
                <div className="card-header">
                  <p className="card-index">Profile {index + 1}</p>
                  <button
                    className="mini-button mini-button-danger"
                    onClick={() =>
                      setResume((current) => ({
                        ...current,
                        basics: {
                          ...current.basics,
                          profiles: removeArrayValue(current.basics.profiles, index),
                        },
                      }))
                    }
                    type="button"
                  >
                    Remove
                  </button>
                </div>
                <div className="editor-grid editor-grid-three">
                  <Field label="Network">
                    <input
                      className="text-input"
                      onChange={(event) =>
                        setResume((current) => ({
                          ...current,
                          basics: {
                            ...current.basics,
                            profiles: replaceArrayValue(current.basics.profiles, index, {
                              ...profile,
                              network: event.target.value,
                            }),
                          },
                        }))
                      }
                      placeholder="GitHub"
                      type="text"
                      value={profile.network}
                    />
                  </Field>
                  <Field label="Username">
                    <input
                      className="text-input"
                      onChange={(event) =>
                        setResume((current) => ({
                          ...current,
                          basics: {
                            ...current.basics,
                            profiles: replaceArrayValue(current.basics.profiles, index, {
                              ...profile,
                              username: event.target.value,
                            }),
                          },
                        }))
                      }
                      placeholder="devkoriel"
                      type="text"
                      value={profile.username}
                    />
                  </Field>
                  <Field label="URL">
                    <input
                      className="text-input"
                      onChange={(event) =>
                        setResume((current) => ({
                          ...current,
                          basics: {
                            ...current.basics,
                            profiles: replaceArrayValue(current.basics.profiles, index, {
                              ...profile,
                              url: event.target.value,
                            }),
                          },
                        }))
                      }
                      placeholder="https://github.com/devkoriel"
                      type="url"
                      value={profile.url}
                    />
                  </Field>
                </div>
              </article>
            ))}
          </div>
        )}
      </EditorSection>

      <EditorSection
        description="Keep this to 2-4 crisp lines. It becomes the paragraph directly under the divider."
        title="Summary"
      >
        <Field label="Professional summary">
          <textarea
            className="text-area"
            onChange={(event) =>
              setResume((current) => ({
                ...current,
                basics: {
                  ...current.basics,
                  summary: event.target.value,
                },
              }))
            }
            placeholder="DevOps Engineer with 8+ years of experience building and operating production infrastructure at scale..."
            rows={5}
            value={resume.basics.summary}
          />
        </Field>
      </EditorSection>

      <EditorSection
        action={
          <button
            className="mini-button"
            onClick={() =>
              setResume((current) => ({
                ...current,
                skills: appendArrayValue(current.skills, createEmptySkill()),
              }))
            }
            type="button"
          >
            Add skill group
          </button>
        }
        description="Follow the exact category-row format from your reference PDF."
        title="Technical Skills"
      >
        {resume.skills.length === 0 ? (
          <p className="empty-state">Group skills by category: Container Orchestration, Observability, CI/CD, Cloud, and so on.</p>
        ) : (
          <div className="editor-list">
            {resume.skills.map((skill, index) => (
              <article className="editor-card" key={`${skill.name}-${index}`}>
                <div className="card-header">
                  <p className="card-index">Skill group {index + 1}</p>
                  <button
                    className="mini-button mini-button-danger"
                    onClick={() =>
                      setResume((current) => ({
                        ...current,
                        skills: removeArrayValue(current.skills, index),
                      }))
                    }
                    type="button"
                  >
                    Remove
                  </button>
                </div>
                <Field label="Category name">
                  <input
                    className="text-input"
                    onChange={(event) =>
                      setResume((current) => ({
                        ...current,
                        skills: replaceArrayValue(current.skills, index, {
                          ...skill,
                          name: event.target.value,
                        }),
                      }))
                    }
                    placeholder="Container Orchestration"
                    type="text"
                    value={skill.name}
                  />
                </Field>
                <div className="nested-stack">
                  <div className="subsection-header">
                    <p className="subsection-title">Keywords</p>
                    <button
                      className="mini-button mini-button-soft"
                      onClick={() =>
                        setResume((current) => ({
                          ...current,
                          skills: replaceArrayValue(current.skills, index, {
                            ...skill,
                            keywords: appendArrayValue(skill.keywords, ""),
                          }),
                        }))
                      }
                      type="button"
                    >
                      Add keyword
                    </button>
                  </div>
                  {skill.keywords.map((keyword, keywordIndex) => (
                    <div className="inline-row" key={`${keyword}-${keywordIndex}`}>
                      <input
                        className="text-input"
                        onChange={(event) =>
                          setResume((current) => ({
                            ...current,
                            skills: replaceArrayValue(current.skills, index, {
                              ...skill,
                              keywords: replaceArrayValue(
                                skill.keywords,
                                keywordIndex,
                                event.target.value,
                              ),
                            }),
                          }))
                        }
                        placeholder="Kubernetes"
                        type="text"
                        value={keyword}
                      />
                      <button
                        className="icon-button"
                        onClick={() =>
                          setResume((current) => ({
                            ...current,
                            skills: replaceArrayValue(current.skills, index, {
                              ...skill,
                              keywords: removeArrayValue(skill.keywords, keywordIndex),
                            }),
                          }))
                        }
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </EditorSection>

      <EditorSection
        action={
          <button
            className="mini-button"
            onClick={() =>
              setResume((current) => ({
                ...current,
                work: appendArrayValue(current.work, createEmptyWork()),
              }))
            }
            type="button"
          >
            Add experience
          </button>
        }
        description="Each entry should map to one company/title block in the final PDF."
        title="Professional Experience"
      >
        {resume.work.length === 0 ? (
          <p className="empty-state">Add roles in reverse chronological order. Use the one-line summary for the italic company description.</p>
        ) : (
          <div className="editor-list">
            {resume.work.map((entry, index) => (
              <article className="editor-card editor-card-dense" key={`${entry.name}-${entry.position}-${index}`}>
                <div className="card-header">
                  <p className="card-index">Experience {index + 1}</p>
                  <button
                    className="mini-button mini-button-danger"
                    onClick={() =>
                      setResume((current) => ({
                        ...current,
                        work: removeArrayValue(current.work, index),
                      }))
                    }
                    type="button"
                  >
                    Remove
                  </button>
                </div>
                <div className="editor-grid editor-grid-two">
                  <Field label="Role title">
                    <input
                      className="text-input"
                      onChange={(event) =>
                        setResume((current) => ({
                          ...current,
                          work: replaceArrayValue(current.work, index, {
                            ...entry,
                            position: event.target.value,
                          }),
                        }))
                      }
                      placeholder="DevOps Engineer"
                      type="text"
                      value={entry.position}
                    />
                  </Field>
                  <Field label="Company name">
                    <input
                      className="text-input"
                      onChange={(event) =>
                        setResume((current) => ({
                          ...current,
                          work: replaceArrayValue(current.work, index, {
                            ...entry,
                            name: event.target.value,
                          }),
                        }))
                      }
                      placeholder="Chronicle Labs"
                      type="text"
                      value={entry.name}
                    />
                  </Field>
                  <Field label="Company URL">
                    <input
                      className="text-input"
                      onChange={(event) =>
                        setResume((current) => ({
                          ...current,
                          work: replaceArrayValue(current.work, index, {
                            ...entry,
                            url: event.target.value,
                          }),
                        }))
                      }
                      placeholder="https://company.com"
                      type="url"
                      value={entry.url ?? ""}
                    />
                  </Field>
                  <Field label="Start month">
                    <input
                      className="text-input"
                      onChange={(event) =>
                        setResume((current) => ({
                          ...current,
                          work: replaceArrayValue(current.work, index, {
                            ...entry,
                            startDate: monthValueToDate(event.target.value),
                          }),
                        }))
                      }
                      type="month"
                      value={dateToMonthValue(entry.startDate)}
                    />
                  </Field>
                  <Field hint="Leave blank for Present." label="End month">
                    <input
                      className="text-input"
                      onChange={(event) =>
                        setResume((current) => ({
                          ...current,
                          work: replaceArrayValue(current.work, index, {
                            ...entry,
                            endDate: monthValueToDate(event.target.value),
                          }),
                        }))
                      }
                      type="month"
                      value={dateToMonthValue(entry.endDate)}
                    />
                  </Field>
                </div>
                <Field label="One-line company summary">
                  <input
                    className="text-input"
                    onChange={(event) =>
                      setResume((current) => ({
                        ...current,
                        work: replaceArrayValue(current.work, index, {
                          ...entry,
                          summary: event.target.value,
                        }),
                      }))
                    }
                    placeholder="Web3 oracle infrastructure for DeFi protocols."
                    type="text"
                    value={entry.summary}
                  />
                </Field>
                <div className="nested-stack">
                  <div className="subsection-header">
                    <p className="subsection-title">Highlights</p>
                    <button
                      className="mini-button mini-button-soft"
                      onClick={() =>
                        setResume((current) => ({
                          ...current,
                          work: replaceArrayValue(current.work, index, {
                            ...entry,
                            highlights: appendArrayValue(entry.highlights, ""),
                          }),
                        }))
                      }
                      type="button"
                    >
                      Add bullet
                    </button>
                  </div>
                  {entry.highlights.length === 0 ? (
                    <p className="empty-inline">No bullet points yet.</p>
                  ) : (
                    entry.highlights.map((highlight, highlightIndex) => (
                      <div className="inline-row" key={`${highlight}-${highlightIndex}`}>
                        <textarea
                          className="text-area text-area-compact"
                          onChange={(event) =>
                            setResume((current) => ({
                              ...current,
                              work: replaceArrayValue(current.work, index, {
                                ...entry,
                                highlights: replaceArrayValue(
                                  entry.highlights,
                                  highlightIndex,
                                  event.target.value,
                                ),
                              }),
                            }))
                          }
                          placeholder="Start with an action verb and keep it specific."
                          rows={2}
                          value={highlight}
                        />
                        <button
                          className="icon-button"
                          onClick={() =>
                            setResume((current) => ({
                              ...current,
                              work: replaceArrayValue(current.work, index, {
                                ...entry,
                                highlights: removeArrayValue(entry.highlights, highlightIndex),
                              }),
                            }))
                          }
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </EditorSection>

      <EditorSection
        action={
          <button
            className="mini-button"
            onClick={() =>
              setResume((current) => ({
                ...current,
                education: appendArrayValue(current.education, createEmptyEducation()),
              }))
            }
            type="button"
          >
            Add education
          </button>
        }
        description="Keep institution first, then the degree/area line."
        title="Education"
      >
        {resume.education.length === 0 ? (
          <p className="empty-state">Add schools, degrees, and date ranges.</p>
        ) : (
          <div className="editor-list">
            {resume.education.map((entry, index) => (
              <article className="editor-card" key={`${entry.institution}-${index}`}>
                <div className="card-header">
                  <p className="card-index">Education {index + 1}</p>
                  <button
                    className="mini-button mini-button-danger"
                    onClick={() =>
                      setResume((current) => ({
                        ...current,
                        education: removeArrayValue(current.education, index),
                      }))
                    }
                    type="button"
                  >
                    Remove
                  </button>
                </div>
                <div className="editor-grid editor-grid-two">
                  <Field label="Institution">
                    <input
                      className="text-input"
                      onChange={(event) =>
                        setResume((current) => ({
                          ...current,
                          education: replaceArrayValue(current.education, index, {
                            ...entry,
                            institution: event.target.value,
                          }),
                        }))
                      }
                      placeholder="Yonsei University"
                      type="text"
                      value={entry.institution}
                    />
                  </Field>
                  <Field label="Degree / study type">
                    <input
                      className="text-input"
                      onChange={(event) =>
                        setResume((current) => ({
                          ...current,
                          education: replaceArrayValue(current.education, index, {
                            ...entry,
                            studyType: event.target.value,
                          }),
                        }))
                      }
                      placeholder="Bachelor's degree"
                      type="text"
                      value={entry.studyType}
                    />
                  </Field>
                  <Field label="Area / major">
                    <input
                      className="text-input"
                      onChange={(event) =>
                        setResume((current) => ({
                          ...current,
                          education: replaceArrayValue(current.education, index, {
                            ...entry,
                            area: event.target.value,
                          }),
                        }))
                      }
                      placeholder="Physics"
                      type="text"
                      value={entry.area}
                    />
                  </Field>
                  <Field label="Start month">
                    <input
                      className="text-input"
                      onChange={(event) =>
                        setResume((current) => ({
                          ...current,
                          education: replaceArrayValue(current.education, index, {
                            ...entry,
                            startDate: monthValueToDate(event.target.value),
                          }),
                        }))
                      }
                      type="month"
                      value={dateToMonthValue(entry.startDate)}
                    />
                  </Field>
                  <Field label="End month">
                    <input
                      className="text-input"
                      onChange={(event) =>
                        setResume((current) => ({
                          ...current,
                          education: replaceArrayValue(current.education, index, {
                            ...entry,
                            endDate: monthValueToDate(event.target.value),
                          }),
                        }))
                      }
                      type="month"
                      value={dateToMonthValue(entry.endDate)}
                    />
                  </Field>
                </div>
              </article>
            ))}
          </div>
        )}
      </EditorSection>

      <EditorSection
        action={
          <button
            className="mini-button"
            onClick={() =>
              setResume((current) => ({
                ...current,
                publications: appendArrayValue(current.publications, createEmptyPublication()),
              }))
            }
            type="button"
          >
            Add publication
          </button>
        }
        description="Shown as a simple bullet list with publisher and year."
        title="Publications"
      >
        {resume.publications.length === 0 ? (
          <p className="empty-state">Add published work that strengthens the resume signal.</p>
        ) : (
          <div className="editor-list">
            {resume.publications.map((entry, index) => (
              <article className="editor-card" key={`${entry.name}-${index}`}>
                <div className="card-header">
                  <p className="card-index">Publication {index + 1}</p>
                  <button
                    className="mini-button mini-button-danger"
                    onClick={() =>
                      setResume((current) => ({
                        ...current,
                        publications: removeArrayValue(current.publications, index),
                      }))
                    }
                    type="button"
                  >
                    Remove
                  </button>
                </div>
                <div className="editor-grid editor-grid-three">
                  <Field label="Title">
                    <input
                      className="text-input"
                      onChange={(event) =>
                        setResume((current) => ({
                          ...current,
                          publications: replaceArrayValue(current.publications, index, {
                            ...entry,
                            name: event.target.value,
                          }),
                        }))
                      }
                      placeholder="Cloud or Dare"
                      type="text"
                      value={entry.name}
                    />
                  </Field>
                  <Field label="Publisher">
                    <input
                      className="text-input"
                      onChange={(event) =>
                        setResume((current) => ({
                          ...current,
                          publications: replaceArrayValue(current.publications, index, {
                            ...entry,
                            publisher: event.target.value,
                          }),
                        }))
                      }
                      placeholder="Microsoftware"
                      type="text"
                      value={entry.publisher}
                    />
                  </Field>
                  <Field hint="Year only is fine." label="Release year">
                    <input
                      className="text-input"
                      inputMode="numeric"
                      maxLength={4}
                      onChange={(event) =>
                        setResume((current) => ({
                          ...current,
                          publications: replaceArrayValue(current.publications, index, {
                            ...entry,
                            releaseDate: yearValueToDate(event.target.value),
                          }),
                        }))
                      }
                      placeholder="2019"
                      type="text"
                      value={dateToYearValue(entry.releaseDate)}
                    />
                  </Field>
                </div>
              </article>
            ))}
          </div>
        )}
      </EditorSection>

      <EditorSection
        action={
          <button
            className="mini-button"
            onClick={() =>
              setResume((current) => ({
                ...current,
                awards: appendArrayValue(current.awards, createEmptyAward()),
              }))
            }
            type="button"
          >
            Add award
          </button>
        }
        description="Keep these concise. The renderer only needs title, issuer, and year."
        title="Awards"
      >
        {resume.awards.length === 0 ? (
          <p className="empty-state">Add awards or competitions that add credibility.</p>
        ) : (
          <div className="editor-list">
            {resume.awards.map((entry, index) => (
              <article className="editor-card" key={`${entry.title}-${index}`}>
                <div className="card-header">
                  <p className="card-index">Award {index + 1}</p>
                  <button
                    className="mini-button mini-button-danger"
                    onClick={() =>
                      setResume((current) => ({
                        ...current,
                        awards: removeArrayValue(current.awards, index),
                      }))
                    }
                    type="button"
                  >
                    Remove
                  </button>
                </div>
                <div className="editor-grid editor-grid-three">
                  <Field label="Award title">
                    <input
                      className="text-input"
                      onChange={(event) =>
                        setResume((current) => ({
                          ...current,
                          awards: replaceArrayValue(current.awards, index, {
                            ...entry,
                            title: event.target.value,
                          }),
                        }))
                      }
                      placeholder="Korea Robot Aircraft Competition"
                      type="text"
                      value={entry.title}
                    />
                  </Field>
                  <Field label="Awarder">
                    <input
                      className="text-input"
                      onChange={(event) =>
                        setResume((current) => ({
                          ...current,
                          awards: replaceArrayValue(current.awards, index, {
                            ...entry,
                            awarder: event.target.value,
                          }),
                        }))
                      }
                      placeholder="Ministry of Land, Infrastructure and Transport"
                      type="text"
                      value={entry.awarder}
                    />
                  </Field>
                  <Field hint="Year only is fine." label="Award year">
                    <input
                      className="text-input"
                      inputMode="numeric"
                      maxLength={4}
                      onChange={(event) =>
                        setResume((current) => ({
                          ...current,
                          awards: replaceArrayValue(current.awards, index, {
                            ...entry,
                            date: yearValueToDate(event.target.value),
                          }),
                        }))
                      }
                      placeholder="2012"
                      type="text"
                      value={dateToYearValue(entry.date)}
                    />
                  </Field>
                </div>
              </article>
            ))}
          </div>
        )}
      </EditorSection>

      <EditorSection
        action={
          <button
            className="mini-button"
            onClick={() =>
              setResume((current) => ({
                ...current,
                languages: appendArrayValue(current.languages, createEmptyLanguage()),
              }))
            }
            type="button"
          >
            Add language
          </button>
        }
        description="Shown as a single comma-separated line at the bottom of the PDF."
        title="Languages"
      >
        {resume.languages.length === 0 ? (
          <p className="empty-state">Add languages and proficiency levels.</p>
        ) : (
          <div className="editor-list">
            {resume.languages.map((entry, index) => (
              <article className="editor-card" key={`${entry.language}-${index}`}>
                <div className="card-header">
                  <p className="card-index">Language {index + 1}</p>
                  <button
                    className="mini-button mini-button-danger"
                    onClick={() =>
                      setResume((current) => ({
                        ...current,
                        languages: removeArrayValue(current.languages, index),
                      }))
                    }
                    type="button"
                  >
                    Remove
                  </button>
                </div>
                <div className="editor-grid editor-grid-two">
                  <Field label="Language">
                    <input
                      className="text-input"
                      onChange={(event) =>
                        setResume((current) => ({
                          ...current,
                          languages: replaceArrayValue(current.languages, index, {
                            ...entry,
                            language: event.target.value,
                          }),
                        }))
                      }
                      placeholder="English"
                      type="text"
                      value={entry.language}
                    />
                  </Field>
                  <Field label="Fluency">
                    <input
                      className="text-input"
                      onChange={(event) =>
                        setResume((current) => ({
                          ...current,
                          languages: replaceArrayValue(current.languages, index, {
                            ...entry,
                            fluency: event.target.value,
                          }),
                        }))
                      }
                      placeholder="Native or Bilingual"
                      type="text"
                      value={entry.fluency}
                    />
                  </Field>
                </div>
              </article>
            ))}
          </div>
        )}
      </EditorSection>
    </div>
  );
}
