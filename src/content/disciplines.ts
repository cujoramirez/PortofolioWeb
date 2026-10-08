/**
 * "What I do": the four disciplines, in plate order. In its own module so the copy ships with the
 * lazy scene (and the build-time no-JS page), not with the first-load bundle.
 */
export const DISCIPLINES: { title: string; line: string; skills: string[] }[] = [
  {
    title: 'AI and machine learning',
    line: 'Where I go deepest. Computer vision with vision transformers, detection and medical imaging, from training runs to models that run on the device.',
    skills: ['PyTorch', 'Vision Transformers', 'Object detection', 'Medical imaging', 'CoreML and MLX'],
  },
  {
    title: 'Software engineering, MLOps and DevOps',
    line: 'I ship what I build: native apps in Swift, Python services, and the work that takes a trained model into a product, from serving to tracking experiments.',
    skills: ['Swift and SwiftUI', 'Python', 'FastAPI', 'Git', 'Weights & Biases'],
  },
  {
    title: 'UI and UX design',
    line: "I design with Apple's Human Interface Guidelines and Gestalt principles, and I justify each decision. FightRoom was built as a worked example.",
    skills: ['Human Interface Guidelines', 'Gestalt principles', 'Accessibility', 'SwiftUI'],
  },
  {
    title: 'Research',
    line: 'Five peer-reviewed papers in machine learning, plus field, user and design research for the apps I build at Apple Developer Academy.',
    skills: ['Field research', 'User research', 'Design research', 'Peer-reviewed papers'],
  },
];
