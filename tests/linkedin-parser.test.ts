import { describe, expect, it } from "vitest";

import { linkedInProfileText } from "./fixtures/linkedin-profile-text";

import { parseLinkedInProfileText } from "@/lib/resume/linkedin-parser";

describe("parseLinkedInProfileText", () => {
  it("maps a LinkedIn export into JSON Resume fields", () => {
    const result = parseLinkedInProfileText(linkedInProfileText);

    expect(result.warnings).toEqual([]);
    expect(result.resume.basics.name).toBe("Alex Morgan");
    expect(result.resume.basics.label).toBe(
      "DevOps Engineer @ Chronicle | ex-Upbit, ex-PUBG | Kubernetes, GitOps & eBPF | Web3 Infrastructure",
    );
    expect(result.resume.basics.email).toBe("alex@example.com");
    expect(result.resume.basics.phone).toBe("+12025550100");
    expect(result.resume.basics.url).toBe("https://portfolio.example");
    expect(result.resume.basics.profiles).toContainEqual({
      network: "LinkedIn",
      username: "alexmorgan",
      url: "https://www.linkedin.com/in/alexmorgan",
    });
    expect(result.resume.basics.summary).toContain("Site Reliability Engineer");
    expect(result.resume.work[0]).toMatchObject({
      name: "Chronicle Labs",
      position: "DevOps Engineer",
      startDate: "2026-01-01",
    });
    expect(result.resume.work[0]?.highlights).toContain(
      "Build and operate Kubernetes-based oracle infrastructure on AWS EKS, managing the full lifecycle of oracle services through an ArgoCD GitOps app-of-apps pattern",
    );
    expect(result.resume.work).toHaveLength(5);
    expect(result.resume.education).toEqual([
      {
        institution: "Yonsei University 연세대학교",
        area: "Physics",
        studyType: "Bachelor's degree",
        startDate: "2013-03-01",
        endDate: "2019-08-01",
      },
      {
        institution: "Korea Digital Media High School",
        area: "Hacking Defense",
        studyType: "",
        startDate: "2010-03-01",
        endDate: "2013-02-01",
      },
    ]);
    expect(result.resume.skills.flatMap((skill) => skill.keywords)).toEqual(
      expect.arrayContaining(["GitHub Actions", "Docker", "Web3"]),
    );
    expect(result.resume.languages).toEqual([
      {
        language: "English",
        fluency: "Native or Bilingual",
      },
      {
        language: "Korean",
        fluency: "Native or Bilingual",
      },
    ]);
    expect(result.resume.publications[0]?.name).toContain("CLOUD or DARE");
    expect(result.resume.awards[0]).toEqual({
      title: "Korea Robot Aircraft Competition",
      awarder: "",
      date: "",
    });
  });

  it("returns warnings when key sections are missing", () => {
    const result = parseLinkedInProfileText("Alex Morgan\nDevOps Engineer");

    expect(result.resume.basics.name).toBe("Alex Morgan");
    expect(result.warnings).toContain("No Experience section detected.");
    expect(result.warnings).toContain("No Skills section detected.");
  });

  it("keeps nested role entries attached to the same company and repairs wrapped highlights", () => {
    const result = parseLinkedInProfileText(`
Alex Morgan
DevOps Engineer
Summary
Infrastructure engineer
Experience
PUBG Corporation
1 year 9 months
Lead of Network Security Part
December 2021 - June 2022 (7 months)
Central District
Promoted to Lead of Network Security Part, directing infrastructure defense
strategy for PUBG: NEW STATE
DevSecOps Engineer
October 2020 - December 2021 (1 year 3 months)
Central District
Developed eBPF programs (XDP ingress + TC egress) to protect infrastructure
from DDoS attacks
LUXROBO
2 years 8 months
DevOps Technical Lead
December 2018 - November 2019 (1 year)
Central District, Singapore
Designed software architecture and managed code reviews via GitLab MR +
Jenkins
Migrated C++ build system to CMake, achieving 10x improvement in build time
and binary size
SW Dev. Team Manager
July 2017 - December 2018 (1 year 6 months)
Singapore
Managed software development team
Software Engineer
April 2017 - July 2017 (4 months)
Singapore
Built JIRA and Confluence on in-house servers
Top Skills
Docker
`.trim());

    expect(result.resume.work).toHaveLength(5);
    expect(result.resume.work[0]).toMatchObject({
      name: "PUBG Corporation",
      position: "Lead of Network Security Part",
    });
    expect(result.resume.work[1]).toMatchObject({
      name: "PUBG Corporation",
      position: "DevSecOps Engineer",
    });
    expect(result.resume.work[2]).toMatchObject({
      name: "LUXROBO",
      position: "DevOps Technical Lead",
    });
    expect(result.resume.work[3]).toMatchObject({
      name: "LUXROBO",
      position: "SW Dev. Team Manager",
    });
    expect(result.resume.work[4]).toMatchObject({
      name: "LUXROBO",
      position: "Software Engineer",
    });
    expect(result.resume.work[2]?.highlights).toContain(
      "Designed software architecture and managed code reviews via GitLab MR + Jenkins",
    );
    expect(result.resume.work[2]?.highlights).toContain(
      "Migrated C++ build system to CMake, achieving 10x improvement in build time and binary size",
    );
  });
});
