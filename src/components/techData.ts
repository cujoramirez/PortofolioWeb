/**
 * Technologies for the Toolbox. Names come from the original tech list plus the union of
 * `technologies` across PROJECTS and EXPERIENCES; this map only decides which of those count as
 * tools (not topics like "Research" or "Fundraising") and how they are grouped.
 */
import { experiences, projects } from '../content/data';

export type TechnologyCategory = 'Languages' | 'Apple platforms' | 'AI and vision' | 'Web, data and MLOps';

/** The original hand-picked list, plus Weights & Biases from the résumé's ML Ops tools. */
const CORE = ['HTML', 'CSS', 'PyTorch', 'TensorFlow', 'React', 'C', 'Python', 'Kaggle', 'Weights & Biases'];

const CATEGORY: Record<string, TechnologyCategory> = {
  Swift: 'Languages',
  Python: 'Languages',
  'C#': 'Languages',
  C: 'Languages',
  JavaScript: 'Languages',
  PHP: 'Languages',
  SQL: 'Languages',
  HTML: 'Languages',
  CSS: 'Languages',
  SwiftUI: 'Apple platforms',
  UIKit: 'Apple platforms',
  Xcode: 'Apple platforms',
  MapKit: 'Apple platforms',
  'App Intents': 'Apple platforms',
  Vision: 'Apple platforms',
  CoreML: 'Apple platforms',
  CreateML: 'Apple platforms',
  Metal: 'Apple platforms',
  AVFoundation: 'Apple platforms',
  CoreImage: 'Apple platforms',
  PyTorch: 'AI and vision',
  TensorFlow: 'AI and vision',
  Keras: 'AI and vision',
  OpenCV: 'AI and vision',
  MLX: 'AI and vision',
  GradCAM: 'AI and vision',
  Kaggle: 'AI and vision',
  React: 'Web, data and MLOps',
  'Node.js': 'Web, data and MLOps',
  Express: 'Web, data and MLOps',
  Laravel: 'Web, data and MLOps',
  'ASP.NET MVC': 'Web, data and MLOps',
  '.NET': 'Web, data and MLOps',
  FastAPI: 'Web, data and MLOps',
  PostgreSQL: 'Web, data and MLOps',
  MySQL: 'Web, data and MLOps',
  SQLite: 'Web, data and MLOps',
  Pandas: 'Web, data and MLOps',
  NumPy: 'Web, data and MLOps',
  Git: 'Web, data and MLOps',
  'Weights & Biases': 'Web, data and MLOps',
};

export const CATEGORIES: TechnologyCategory[] = ['Languages', 'Apple platforms', 'AI and vision', 'Web, data and MLOps'];

export interface Technology {
  name: string;
  category: TechnologyCategory;
}

const used = new Set<string>([
  ...CORE,
  ...projects.flatMap((p) => p.technologies),
  ...experiences.flatMap((e) => e.technologies),
]);

/** Deduplicated tools that actually appear in the work, in category order. */
export const technologies: Technology[] = CATEGORIES.flatMap((category) =>
  Object.entries(CATEGORY)
    .filter(([name, c]) => c === category && used.has(name))
    .map(([name]) => ({ name, category })),
);
