import { FaAtom, FaChartBar } from "react-icons/fa";
import {
  SiC,
  SiCss3,
  SiHtml5,
  SiKaggle,
  SiPython,
  SiPytorch,
  SiReact,
  SiTensorflow,
} from "react-icons/si";
import type { IconType } from "react-icons";

export type TechnologyCategory = "Frontend" | "Backend" | "AI/ML" | "Other";

export interface Technology {
  name: string;
  icon: IconType;
  color: string;
  borderColor: string;
  pulseSpeed: number;
  category: TechnologyCategory;
}

export const technologies: Technology[] = [
  { name: "HTML", icon: SiHtml5, color: "#E34F26", borderColor: "border-orange-600/30", pulseSpeed: 3.1, category: "Frontend" },
  { name: "CSS", icon: SiCss3, color: "#1572B6", borderColor: "border-blue-500/30", pulseSpeed: 3.4, category: "Frontend" },
  { name: "PyTorch", icon: SiPytorch, color: "#EE4C2C", borderColor: "border-orange-500/30", pulseSpeed: 3.4, category: "AI/ML" },
  { name: "TensorFlow", icon: SiTensorflow, color: "#FF6F00", borderColor: "border-orange-400/30", pulseSpeed: 3.2, category: "AI/ML" },
  { name: "React", icon: SiReact, color: "#61DAFB", borderColor: "border-cyan-400/30", pulseSpeed: 3.7, category: "Frontend" },
  { name: "C", icon: SiC, color: "#5C8DBC", borderColor: "border-blue-500/30", pulseSpeed: 3.5, category: "Backend" },
  { name: "Python", icon: SiPython, color: "#3776AB", borderColor: "border-blue-500/30", pulseSpeed: 3.3, category: "Backend" },
  { name: "Kaggle", icon: SiKaggle, color: "#20BEFF", borderColor: "border-blue-400/30", pulseSpeed: 3.6, category: "AI/ML" },
  { name: "Physics", icon: FaAtom, color: "#9C27B0", borderColor: "border-purple-500/30", pulseSpeed: 3.2, category: "Other" },
  { name: "Statistics", icon: FaChartBar, color: "#FF9800", borderColor: "border-amber-500/30", pulseSpeed: 3.5, category: "Other" },
];
