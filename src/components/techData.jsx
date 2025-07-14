// techData.js
import {
  SiPytorch,
  SiTensorflow,
  SiReact,
  SiC,         // C language icon instead of Node.js
  SiPython,
  SiKaggle,
  SiHtml5,
  SiCss3,
} from "react-icons/si";
import { FaAtom, FaChartBar } from "react-icons/fa";

// Technology configuration with optimized glow effects
export const technologies = [
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
