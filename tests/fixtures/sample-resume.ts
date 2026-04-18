export const sampleResume = {
  $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
  basics: {
    name: "Alex Morgan",
    label: "DevOps Engineer",
    email: "alex@example.com",
    phone: "+1 555-0100",
    url: "https://portfolio.example",
    summary:
      "DevOps Engineer with 8+ years of experience building and operating production infrastructure at scale.",
    location: {
      city: "Singapore",
      countryCode: "SG",
    },
    profiles: [
      {
        network: "GitHub",
        username: "alexmorgan",
        url: "https://github.com/alexmorgan",
      },
      {
        network: "LinkedIn",
        username: "alexmorgan",
        url: "https://linkedin.com/in/alexmorgan",
      },
      {
        network: "X",
        username: "alexmorgan",
        url: "https://x.com/alexmorgan",
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
