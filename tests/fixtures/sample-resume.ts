export const sampleResume = {
  $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
  basics: {
    name: "Jinsoo Heo",
    label: "DevOps Engineer",
    email: "dev.koriel@gmail.com",
    phone: "+82 10-8975-9546",
    url: "https://koriel.kr",
    summary:
      "DevOps Engineer with 8+ years of experience building and operating production infrastructure at scale.",
    location: {
      city: "Seoul",
      countryCode: "KR",
    },
    profiles: [
      {
        network: "GitHub",
        username: "devkoriel",
        url: "https://github.com/devkoriel",
      },
      {
        network: "LinkedIn",
        username: "devkoriel",
        url: "https://linkedin.com/in/devkoriel",
      },
      {
        network: "X",
        username: "devkoriel",
        url: "https://x.com/devkoriel",
      },
    ],
  },
  work: [
    {
      name: "Chronicle Labs",
      position: "DevOps Engineer",
      startDate: "2026-01-01",
      summary: "Web3 oracle infrastructure for DeFi protocols.",
      highlights: [
        "Build and operate Kubernetes-based oracle infrastructure on AWS EKS",
        "Design and maintain the observability platform",
      ],
    },
  ],
  education: [
    {
      institution: "Yonsei University",
      area: "Physics",
      studyType: "Bachelor's degree",
      startDate: "2013-03-01",
      endDate: "2019-08-01",
    },
  ],
  skills: [
    {
      name: "Container Orchestration",
      keywords: ["Kubernetes", "EKS", "kOps", "Helm", "ArgoCD"],
    },
  ],
  languages: [
    {
      language: "English",
      fluency: "Native or Bilingual",
    },
    {
      language: "Korean",
      fluency: "Native or Bilingual",
    },
  ],
  publications: [
    {
      name: "Cloud or Dare",
      publisher: "Microsoftware",
      releaseDate: "2019-01-01",
    },
  ],
  awards: [
    {
      title: "Korea Robot Aircraft Competition",
      awarder: "Ministry of Land, Infrastructure and Transport",
      date: "2012-01-01",
    },
  ],
};
