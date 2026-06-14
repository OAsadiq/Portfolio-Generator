import { writeFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mod = (await import(pathToFileURL(path.join(__dirname, 'api/templates/modern-writer-template/index.js')).href)).default;

const data = {
  fullName: "Priya Sharma",
  tagline: "Full-Stack Developer & Creative Technologist",
  bio: "I build products at the intersection of design and engineering. Previously at Figma and Linear. I love systems thinking, clean code, and great coffee.",
  profileImage: "",
  primaryColor: "#0a0a0a",
  location: "San Francisco, CA",
  skill1: "React", skill2: "Node.js", skill3: "TypeScript", skill4: "Python",
  skill5: "Figma", skill6: "AWS", skill7: "System Architecture", skill8: "Product Strategy",
  skill9: "PostgreSQL", skill10: "GraphQL",
  project1Title: "Real-time Collaboration Engine",
  project1Client: "Linear", project1Role: "Lead Engineer", project1Year: "2024",
  project1Description: "Built the multiplayer infrastructure powering simultaneous editing for 50k+ teams.",
  project1Tags: "WebSockets, Redis, TypeScript",
  project1Overview: "Linear needed real-time collaboration across their issue tracker. The existing architecture was single-user only. I led a team of 4 to redesign the data sync layer.",
  project1Approach: "CRDT-based approach using Yjs, backed by Redis pub/sub. I wrote the conflict resolution logic and React hooks that expose real-time state to the UI.",
  project1Outcome: "P99 sync latency dropped from 800ms to 40ms. Zero data-loss incidents in the first year.",
  project1Link: "https://linear.app",
  project2Title: "Design Token System",
  project2Client: "Figma", project2Role: "Senior Engineer", project2Year: "2023",
  project2Description: "Designed and built the token pipeline bridging Figma variables to production CSS and native design systems.",
  project2Tags: "Design Systems, Style Dictionary, CI/CD",
  project2Overview: "Figma design and engineering teams were out of sync. I built the toolchain that automates the handoff.",
  project2Approach: "Tokens authored in Figma Variables, exported via REST API, transformed with Style Dictionary, published to npm via GitHub Action webhooks.",
  project2Outcome: "Eliminated 90% of manual design-to-code QA. Adopted across 6 product teams.",
  project3Title: "AI Content Pipeline",
  project3Client: "Freelance", project3Role: "Full-Stack Developer", project3Year: "2024",
  project3Description: "End-to-end pipeline ingesting raw research, generating structured content, and publishing to multiple platforms automatically.",
  project3Tags: "Python, LangChain, Next.js",
  project3Outcome: "Reduced content production time from 4 hours to 20 minutes per piece.",
  exp1Role: "Senior Engineer", exp1Company: "Linear", exp1Period: "2023 – Present",
  exp1Description: "Led infrastructure work on real-time collaboration and sync engine.",
  exp2Role: "Engineer", exp2Company: "Figma", exp2Period: "2021 – 2023",
  exp2Description: "Built the design token pipeline and contributed to the Variables API.",
  exp3Role: "Frontend Engineer", exp3Company: "Vercel", exp3Period: "2019 – 2021",
  exp3Description: "Worked on the dashboard and deployment pipeline.",
  testimonial1: "Priya shipped more in her first month than most engineers do in a quarter. The real-time engine she built is the foundation we still build on.",
  testimonial1Author: "Alex Park", testimonial1Role: "VP Engineering, Linear",
  testimonial2: "The token system Priya built solved a problem we had been talking about for two years. She just went and did it.",
  testimonial2Author: "James Lee", testimonial2Role: "Design Manager, Figma",
  testimonial3: "Incredibly fast, communicates clearly, and always ships what she says she will ship.",
  testimonial3Author: "Maria Santos", testimonial3Role: "Founder, Stackmade",
  email: "priya@example.com", linkedin: "https://linkedin.com",
  twitter: "https://twitter.com", github: "https://github.com",
};

process.stdout.write(mod.generateHTML(data, ['work', 'skills', 'experience', 'testimonials', 'contact']));
