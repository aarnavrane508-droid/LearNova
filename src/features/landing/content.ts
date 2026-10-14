import { BookOpen, Compass, Layers3, Play, Target } from "lucide-react";

export const experiences=[
  { icon: Play, number: "01", title: "Make room for discovery.", description: "A focused space for lectures and reading materials, with everything organized around what you’re learning.", label: "Watch & read" },
  { icon: Target, number: "02", title: "Turn practice into insight.", description: "Concept-based quizzes that help you see what’s clicking and where a little more practice could help.", label: "Practice & reflect" },
  { icon: Compass, number: "03", title: "Find your next small step.", description: "Personalized recommendations built around your progress, strengths, and areas that need attention.", label: "Grow with guidance" },
] as const;

export const learningSteps=[
  { title: "Explore a concept", description: "Start with a lecture or a reading resource.", icon: BookOpen },
  { title: "Check your understanding", description: "Practice, reflect, and identify the gaps.", icon: Layers3 },
  { title: "Keep moving forward", description: "Follow a next step that fits your learning.", icon: Compass },
] as const;

export const milestones=[
  { number: "01", title: "A thoughtful foundation", detail: "The landing page, architecture, and development standards.", status: "Current phase" },
  { number: "02", title: "Your learning space", detail: "Student accounts, organized materials, and progress tracking.", status: "Planned" },
  { number: "03", title: "Practice with purpose", detail: "Quizzes, concept mastery, and personalized guidance.", status: "Planned" },
  { number: "04", title: "Connected classrooms", detail: "Authorized resources from Google Classroom and Microsoft Teams for Education.", status: "Future" },
] as const;
