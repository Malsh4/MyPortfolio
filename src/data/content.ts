// All portfolio copy lives here so it can be edited without touching components.

export const profile = {
  name: "Amandi De Silva",
  firstName: "Amandi",
  lastName: "De Silva",
  role: "Associate UI/UX Engineer",
  tagline: "UI/UX Engineer & Creative Frontend Developer",
  location: "Battaramulla, Sri Lanka",
  email: "m.amandidesilva@gmail.com",
  linkedin: "https://www.linkedin.com/in/m-amandi-de-silva",
  github: "https://github.com/Malsh4",
  // Drop the PDF into /public/resume.pdf to enable the Resume button.
  resume: "/resume.pdf",
  // Hero portrait (transparent background works best). Revealed by the cursor spotlight.
  heroImage: "/images/hero/portrait.webp",
  // 3D model of you for the reveal before Contact. Put the file at /public/models/amandi.glb.
  avatarModel: "/models/amandi.glb",
  featuredProject: "battlezik",
  summary:
    "UI/UX Engineer and Frontend Developer with 1+ year of experience creating intuitive, user-centered digital experiences. Skilled in frontend development, accessibility standards, UI/UX audits, user research, and usability testing for web and mobile applications.",
};

export const loaderTaglines = [
  "Wireframes in the morning, WebGL by night",
  "Where empathy meets engineering",
  "Designing for humans, building for the web",
  "From Colombo, pixel by pixel",
];

export const sections = [
  { id: "hero", label: "Home", code: "00" },
  { id: "about", label: "About", code: "01" },
  { id: "skills", label: "Skills", code: "02" },
  { id: "projects", label: "Projects", code: "03" },
  { id: "certificates", label: "Certificates", code: "04" },
  { id: "contact", label: "Contact", code: "05" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

// Accent colour per section. The HUD and the 3D room's neon lights shift to it on scroll.
export const sectionAccent: Record<SectionId, string> = {
  hero: "#ff3df2",
  about: "#3df5ff",
  skills: "#a56bff",
  projects: "#ff3df2",
  certificates: "#ffb547",
  contact: "#3df5ff",
};

export const stats = [
  { value: "1+", label: "Years in industry" },
  { value: "3.86", label: "GPA · BSc (Hons) SE" },
  { value: "04", label: "Research papers presented" },
  { value: "03", label: "Awards & competition wins" },
];

export const experience = [
  {
    role: "Intern UI/UX Engineer",
    company: "Epic Lanka",
    period: "Jul 2025 — Sep 2026",
    points: [
      "Created wireframes, user flows, and prototypes, and supported frontend development for fintech and document management systems on web and mobile.",
      "Conducted user research, usability testing, and UI/UX audits for real-world fintech solutions.",
      "Designed interfaces for mobile banking apps, card management systems, super apps, and lottery platforms.",
      "Worked with developers and business analysts to turn business requirements into user-centered designs.",
      "Applied UX principles and accessibility standards to make financial tasks simple, clear, and easy to use.",
    ],
  },
];

export const education = [
  {
    title: "B.Sc. (Hons) in Software Engineering",
    place: "CINEC Campus, Malabe",
    period: "Expected 2026",
    note: "GPA 3.86+",
  },
  {
    title: "G.C.E. Advanced Level",
    place: "Yasodara Vidyalaya, Colombo 7",
    period: "2021",
    note: "3 Credit Passes",
  },
];

export const achievements = [
  {
    title: "Best Oral Presentation",
    org: "CINEC Symposium 2024",
    text: "Selected among 270+ abstracts for research on optimizing OFDM network performance using reinforcement learning for 5G systems.",
  },
  {
    title: "Winners · Climate Change Hackathon '24",
    org: "Climate Zero Foundation & Zero Plastic Movement",
    text: "Helped build innovative solutions for a sustainable future.",
  },
  {
    title: "Most Popular Award · Poster Competition",
    org: "Research for Undergraduates Club, University of Moratuwa",
    text: "“Sri Lanka's Journey Towards Clean Energy” poster competition.",
  },
  {
    title: "IX-23 & IX-24 UI/UX Designathons",
    org: "IIT Campus",
    text: "Competed in inter-university UI/UX hackathons.",
  },
];

export const languages = ["Sinhala", "English"];

export const skillGroups = [
  {
    code: "UX",
    title: "UX Research & Strategy",
    blurb: "Understand people before pushing pixels",
    color: "#3df5ff",
    items: ["User research", "Usability testing", "UI/UX audits", "User flows", "Accessibility (WCAG)"],
  },
  {
    code: "UI",
    title: "Interface Design",
    blurb: "Clear, calm screens that guide action",
    color: "#ff3df2",
    items: ["Figma", "Wireframing", "Prototyping", "Design systems", "Canva", "Photoshop"],
  },
  {
    code: "FE",
    title: "Frontend Engineering",
    blurb: "Responsive, accessible, production-ready",
    color: "#a56bff",
    items: ["Next.js", "React", "TypeScript", "JavaScript", "Tailwind CSS", "HTML / CSS", "Angular", "Bootstrap"],
  },
  {
    code: "3D",
    title: "Creative & 3D Dev",
    blurb: "Motion and depth that feel alive",
    color: "#ffb547",
    items: ["Three.js", "React Three Fiber", "GSAP", "Blender", "Unity"],
  },
  {
    code: "BE",
    title: "Full-stack & Mobile",
    blurb: "Enough backend to ship end to end",
    color: "#5dff9d",
    items: ["Supabase", "PostgreSQL", "Node.js", "Express", "React Native"],
  },
];

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  period: string;
  role: string;
  platform: string;
  status: "LIVE" | "IN PROGRESS" | "CONCEPT" | "COMPLETED";
  color: string;
  tags: string[];
  summary: string;
  challenge: string;
  goals: string[];
  process: { title: string; text: string }[];
  features: { title: string; text: string }[];
  outcome: string;
  // Optional screenshots, e.g. ["/images/projects/battlezik-1.webp"]
  gallery?: string[];
  cover?: string;
};

export const projects: Project[] = [
  {
    slug: "battlezik",
    title: "Battlezik",
    subtitle: "E-Sports Competitive Platform",
    category: "Web Platform",
    period: "Oct 2025 — Present",
    role: "UI/UX Design · Frontend Development",
    platform: "Web",
    status: "IN PROGRESS",
    color: "#ff3df2",
    tags: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Tailwind CSS", "GSAP", "Three.js"],
    summary:
      "A real-time esports platform supporting tournament management, matchmaking, and dynamic prize pool systems.",
    challenge:
      "Competitive players and organisers juggle brackets, match results, and prize payouts across scattered tools. The platform needed to make fast-moving, real-time information feel exciting without becoming chaotic.",
    goals: [
      "Let organisers create and run tournaments end to end",
      "Match players quickly and fairly",
      "Keep brackets, scores, and prize pools updated in real time",
      "Deliver a high-energy gaming aesthetic that stays readable",
    ],
    process: [
      { title: "Discover", text: "Mapped the journeys of players and organisers — joining, competing, reporting results, and getting paid — to find the moments that matter most." },
      { title: "Design", text: "Built a dark, high-contrast UI system with motion cues for live states, so status changes are noticed at a glance." },
      { title: "Build", text: "Implemented the frontend in Next.js and TypeScript, with Supabase and PostgreSQL powering real-time data and GSAP / Three.js adding motion and depth." },
      { title: "Iterate", text: "Refining flows continuously as tournament features and prize pool logic evolve." },
    ],
    features: [
      { title: "Tournament management", text: "Create events, manage brackets, and track progress in one place." },
      { title: "Matchmaking", text: "Pair players into balanced matches with minimal waiting." },
      { title: "Dynamic prize pools", text: "Prize pools that update as entries and rules change." },
      { title: "Real-time updates", text: "Live scores and bracket changes pushed instantly to every player." },
    ],
    outcome:
      "An in-progress platform that combines product thinking with full-stack frontend engineering and creative motion work.",
  },
  {
    slug: "lankatransit-177",
    title: "LankaTransit-177",
    subtitle: "Edge-AI & IoT Bus Tracking App",
    category: "Mobile App",
    period: "Oct 2025 — Aug 2026",
    role: "UI/UX Design · Mobile Development",
    platform: "iOS & Android",
    status: "COMPLETED",
    color: "#3df5ff",
    tags: ["React Native", "Node.js", "Express", "Supabase", "TensorFlow Lite", "Google Maps API"],
    summary:
      "A real-time bus tracking and privacy-preserving passenger occupancy detection system optimized for high-demand transit corridors, with in-app ticket purchasing.",
    challenge:
      "Commuters on busy routes rarely know when the next bus will arrive or how crowded it is. The app needed to answer both questions instantly — while protecting passenger privacy.",
    goals: [
      "Show live bus locations and arrival times on a clear map",
      "Estimate occupancy on-device without storing images of passengers",
      "Let commuters buy tickets inside the app",
      "Keep navigation simple for everyday riders",
    ],
    process: [
      { title: "Research", text: "Studied commuter pain points on high-demand corridors: waiting uncertainty, overcrowding, and ticketing friction." },
      { title: "Design", text: "Designed simple navigation and clear route information so riders can check a route in seconds." },
      { title: "Build", text: "Developed the app in React Native with a Node.js / Express backend, Supabase for data, and Google Maps for live tracking." },
      { title: "Edge AI", text: "Used TensorFlow Lite for on-device occupancy detection, so crowd levels are estimated without sending passenger images to the cloud." },
    ],
    features: [
      { title: "Live tracking", text: "Real-time bus positions and ETAs on an interactive map." },
      { title: "Occupancy levels", text: "Privacy-preserving crowd estimates for each bus." },
      { title: "In-app ticketing", text: "Buy tickets without cash or queues." },
      { title: "Route info", text: "Clear stops, routes, and schedules." },
    ],
    outcome:
      "An end-to-end system combining IoT, edge AI, and thoughtful mobile UX to make public transport more predictable.",
  },
  {
    slug: "isabelleugc",
    title: "IsabelleUGC",
    subtitle: "Immersive 3D Jewelry Showroom",
    category: "3D Web Experience",
    period: "Oct 2024 — Apr 2025",
    role: "3D Web Development · Interaction Design",
    platform: "Web",
    status: "COMPLETED",
    color: "#ffb547",
    tags: ["React Three Fiber", "Three.js", "GSAP", "Blender", "Next.js", "TypeScript"],
    summary:
      "An interactive 3D web showroom that lets visitors explore and inspect jewelry pieces in real time, delivering a luxury brand experience in the browser.",
    challenge:
      "Photos alone can't show how jewelry catches light. The brand wanted visitors to feel the craftsmanship — rotating, zooming, and inspecting each piece — right in the browser.",
    goals: [
      "Present each piece as a detailed, inspectable 3D model",
      "Create a luxurious, cinematic browsing experience",
      "Keep performance smooth on everyday devices",
    ],
    process: [
      { title: "Modelling", text: "Prepared and optimized jewelry models in Blender for real-time rendering on the web." },
      { title: "Look development", text: "Tuned materials, lighting, and reflections so metals and stones read as premium." },
      { title: "Interaction", text: "Built orbit, zoom, and guided camera moves with React Three Fiber and GSAP." },
      { title: "Performance", text: "Balanced visual quality with load time and frame rate across devices." },
    ],
    features: [
      { title: "Real-time inspection", text: "Rotate and zoom any piece to see its detail." },
      { title: "Cinematic transitions", text: "GSAP-driven camera moves between pieces." },
      { title: "Luxury atmosphere", text: "Lighting and motion designed around the brand." },
    ],
    outcome:
      "A browser-based showroom that turns browsing into an experience, and a deep dive into real-time 3D for the web.",
  },
  {
    slug: "myturn",
    title: "MyTurn",
    subtitle: "Smart Queue Management App",
    category: "Mobile App",
    period: "Case Study",
    role: "UI/UX Design",
    platform: "Mobile",
    status: "CONCEPT",
    color: "#a56bff",
    tags: ["Figma", "User Research", "Prototyping", "AR Navigation"],
    summary:
      "A mobile app for live queue tracking and appointment booking, with AR indoor navigation.",
    challenge:
      "Waiting rooms waste hours of people's time, and large buildings are hard to navigate. MyTurn lets people join a queue remotely and find their way when it's their turn.",
    goals: [
      "Show queue position and wait time in real time",
      "Make booking an appointment take seconds",
      "Guide visitors indoors with AR directions",
    ],
    process: [
      { title: "Research", text: "Identified frustrations with physical queues and unclear wait times." },
      { title: "Flows", text: "Mapped joining, tracking, and arriving journeys as simple user flows." },
      { title: "Design", text: "Designed high-fidelity screens and an interactive prototype in Figma." },
      { title: "AR concept", text: "Explored AR overlays to guide users to the right counter or room." },
    ],
    features: [
      { title: "Live queue", text: "Real-time position and estimated wait." },
      { title: "Appointments", text: "Book a slot in a few taps." },
      { title: "AR wayfinding", text: "Indoor directions overlaid on the camera view." },
    ],
    outcome: "A UX concept showing how smart queuing and AR can remove waiting-room stress.",
  },
  {
    slug: "trustfix",
    title: "TrustFix",
    subtitle: "Home Services Marketplace",
    category: "Mobile App",
    period: "Case Study",
    role: "UI/UX Design",
    platform: "Mobile",
    status: "CONCEPT",
    color: "#5dff9d",
    tags: ["Figma", "Two-sided Marketplace", "User Flows", "Prototyping"],
    summary:
      "A two-sided mobile app connecting homeowners with workers such as plumbers and carpenters, with separate flows for hiring and job seeking.",
    challenge:
      "Homeowners struggle to find reliable help, and skilled workers struggle to find steady jobs. One app had to serve both audiences without confusing either.",
    goals: [
      "Help homeowners find and hire trusted workers",
      "Help workers discover and accept jobs",
      "Keep the two experiences distinct but consistent",
    ],
    process: [
      { title: "Research", text: "Explored the needs of both homeowners and workers." },
      { title: "Architecture", text: "Designed separate flows for hiring and job seeking within one app." },
      { title: "Design", text: "Created wireframes, UI, and prototypes in Figma." },
    ],
    features: [
      { title: "Hire flow", text: "Post a job, browse workers, and hire with confidence." },
      { title: "Worker flow", text: "Find nearby jobs and manage requests." },
      { title: "Trust signals", text: "Profiles and reviews that build confidence." },
    ],
    outcome: "A marketplace design that balances two very different user journeys in one product.",
  },
  {
    slug: "green-urban-city",
    title: "Green Urban City",
    subtitle: "Community Environmental Engagement App",
    category: "Mobile App",
    period: "Case Study",
    role: "UI/UX Design",
    platform: "Mobile",
    status: "CONCEPT",
    color: "#5dff9d",
    tags: ["Figma", "Gamification", "Sustainability", "Prototyping"],
    summary:
      "A mobile app that encourages people to join environmental activities and rewards their contributions with digital currency.",
    challenge:
      "Many people want to help the environment but lack motivation or don't know where to start. The app needed to make taking part easy and rewarding.",
    goals: [
      "Help people discover local environmental activities",
      "Reward contributions to keep people engaged",
      "Build a sense of community impact",
    ],
    process: [
      { title: "Research", text: "Explored what motivates people to take part in community activities." },
      { title: "Concept", text: "Designed a reward system using digital currency for contributions." },
      { title: "Design", text: "Created the UI and interactive prototype in Figma." },
    ],
    features: [
      { title: "Activity discovery", text: "Find clean-ups, planting days, and more nearby." },
      { title: "Digital rewards", text: "Earn currency for every contribution." },
      { title: "Community impact", text: "See what the community has achieved together." },
    ],
    outcome: "A gamified concept that turns environmental action into a rewarding habit.",
  },
  {
    slug: "hirelabs",
    title: "HireLabs",
    subtitle: "Online Job Application Platform",
    category: "Web Platform",
    period: "Case Study",
    role: "UI/UX Design · Frontend",
    platform: "Responsive Web",
    status: "COMPLETED",
    color: "#3df5ff",
    tags: ["Figma", "Next.js", "Responsive Design", "Tailwind CSS"],
    summary:
      "Responsive web pages for a job portal where candidates search vacancies and apply by submitting their CVs online.",
    challenge:
      "Job seekers expect to find relevant roles and apply in minutes, on any device. The portal needed a clear, trustworthy experience from search to submission.",
    goals: [
      "Make vacancies easy to search and scan",
      "Keep the application and CV upload simple",
      "Work well on phones, tablets, and desktops",
    ],
    process: [
      { title: "Structure", text: "Organised vacancy listings, details, and application steps into a clear hierarchy." },
      { title: "Design", text: "Designed responsive layouts with a refined, professional visual language." },
      { title: "Build", text: "Implemented the responsive pages with modern frontend tooling." },
    ],
    features: [
      { title: "Vacancy search", text: "Browse and filter open roles." },
      { title: "Online applications", text: "Apply by submitting a CV in a few steps." },
      { title: "Responsive layouts", text: "Consistent experience across all screen sizes." },
    ],
    outcome: "A clean, responsive job portal that keeps candidates focused on finding the right role.",
  },
];

export type Certificate = {
  title: string;
  issuer: string;
  date: string;
  category: string;
  focus: string;
  verify?: string;
  credentialId?: string;
  // Drop the certificate image into /public/images/certificates/ and set the path here.
  image?: string;
  highlight?: boolean;
  detail?: string;
};

const coursera = (id: string) => `https://coursera.org/verify/${id}`;

export const certificates: Certificate[] = [
  {
    title: "Google AI Professional Certificate",
    issuer: "Google · Coursera",
    date: "May 2026",
    category: "Professional",
    focus: "Applied AI · Prompting · AI for work",
    image: "/images/certificates/google-ai-professional.webp",
    verify: "https://coursera.org/verify/professional-cert/0EE5CN0G50QM",
    credentialId: "0EE5CN0G50QM",
    highlight: true,
    detail: "7 courses covering AI fundamentals, brainstorming, research, writing, content creation, data analysis, and app building.",
  },
  {
    title: "AI Fundamentals",
    issuer: "Google · Coursera",
    date: "Apr 2026",
    category: "AI",
    focus: "AI concepts · Responsible AI",
    image: "/images/certificates/ai-fundamentals.webp",
    verify: coursera("F74KGOI0XC83"),
    credentialId: "F74KGOI0XC83",
  },
  {
    title: "AI for Brainstorming and Planning",
    issuer: "Google · Coursera",
    date: "Apr 2026",
    category: "AI",
    focus: "Ideation · Planning",
    image: "/images/certificates/ai-brainstorming-planning.webp",
    verify: coursera("C3K8AWGSQZHE"),
    credentialId: "C3K8AWGSQZHE",
  },
  {
    title: "AI for Research and Insights",
    issuer: "Google · Coursera",
    date: "Apr 2026",
    category: "AI",
    focus: "Research · Synthesis",
    image: "/images/certificates/ai-research-insights.webp",
    verify: coursera("O229OXDX7ZTP"),
    credentialId: "O229OXDX7ZTP",
  },
  {
    title: "AI for Writing and Communicating",
    issuer: "Google · Coursera",
    date: "Apr 2026",
    category: "AI",
    focus: "Writing · Communication",
    image: "/images/certificates/ai-writing-communicating.webp",
    verify: coursera("XLCEUFJYJHT1"),
    credentialId: "XLCEUFJYJHT1",
  },
  {
    title: "AI for Content Creation",
    issuer: "Google · Coursera",
    date: "Apr 2026",
    category: "AI",
    focus: "Content · Visual assets",
    image: "/images/certificates/ai-content-creation.webp",
    verify: coursera("LOVHKSSGUPX3"),
    credentialId: "LOVHKSSGUPX3",
  },
  {
    title: "AI for Data Analysis",
    issuer: "Google · Coursera",
    date: "Apr 2026",
    category: "AI",
    focus: "Data analysis · Insights",
    image: "/images/certificates/ai-data-analysis.webp",
    verify: coursera("JU8Z647ZGDUQ"),
    credentialId: "JU8Z647ZGDUQ",
  },
  { title: "AI/ML Engineer — Stage 1 & 2", issuer: "SLIIT", date: "Certified", category: "Machine Learning", focus: "Machine learning · Model building" },
  {
    title: "Build a Machine Learning Model using Custom Vision",
    issuer: "Microsoft",
    date: "Certified",
    category: "Machine Learning",
    focus: "Computer vision · Azure Custom Vision",
  },
];
