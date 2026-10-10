// Image fields hold keys into src/data/images.json (AVIF/WebP ladders from scripts/build-images.mjs).
const project2 = "project-2";
const project3 = "project-3";
const project4 = "project-4";
const project5 = "project-5";
const project6 = "project-6";
const project11 = "project-11";
const project8 = "project-8";
const project9 = "project-9";
const project10 = "project-10";
// Schematic covers (scripts/generate-project-covers.mjs) for projects whose screenshots were lost.
const coverAria = "cover-aria";
const coverCsLearning = "cover-cs-learning";
const coverEchoVision = "cover-echovision";
const coverBearing = "cover-bearing";
const coverCardShop = "cover-card-shop";
const certificate1 = "certificate1";
const certificate2 = "certificate2";
const certificate3 = "certificate3";
const certificate4 = "certificate4";
const certificate5 = "certificate5";
const certificate6 = "certificate6";
const certificate7 = "certificate7";
const certificate8 = "certificate8";
const certificate9 = "certificate9";
const certificate10 = "certificate10";
const certificate11 = "certificate11";
const certificate12 = "certificate12";
const certificate13 = "certificate13";
const certificate14 = "certificate14";
const certificate15 = "certificate15";
const certificate16 = "certificate16";

export const HERO_CONTENT = 
`First-generation undergraduate AI Researcher specializing in Computer Vision and Deep Learning. Author of five peer-reviewed publications (four first-author) with interest in Vision Transformers, Ensemble Learning, and Model Calibration. Currently an Apple Developer Academy Scholar (Cohort 2026) at BINUS University.`;

export const ABOUT_TEXT = `I grew up in Jakarta, Indonesia. Before I chose to pursue Computer Science at BINUS University, I developed a strong interest in physics, statistics, and mathematics. I enjoy learning across disciplines, from medicine and physics to economics. My deepest passion lies in physics, particularly astrophysics, because I am drawn to understanding the unknown aspects of the universe. However, I chose computer science because I believe it allows me to integrate my interests in physics, mathematics, and statistics into developing innovative solutions through Artificial Intelligence and Machine Learning.

I believe that technology, especially AI, has the potential to revolutionize various industries and improve people’s lives. I am motivated to contribute to its growth and development. I enjoy research because it allows me to explore new ideas, push the boundaries of what is possible with technology, experiment with different techniques, learn from existing work, and contribute to the advancement of knowledge in the field.

I am a fast learner, driven by the belief that there are no inherent limits to knowledge, only limits to our willingness to learn and explore. I continuously seek new challenges that foster both personal and professional growth. As a first-generation undergraduate researcher, I self-fund my research through freelance work in software development, teaching, and research methodology consulting for computer vision.`;

export const ABOUT_QUOTES = [
  { text: "I was born not knowing and have had only a little time to change that here and there.", author: "Richard Feynman" },
  { text: "There is no sense in being precise when you do not even know what you are talking about.", author: "John von Neumann" },
  { text: "The impossible experiment is the one not attempted.", author: "François Jacob" },
  { text: "Whereof one cannot speak, thereof one must be silent.", author: "Ludwig Wittgenstein" },
];

// ── About section · verifiable credibility facts ─────────────────────────────
// Google Scholar exposes no public API and a static site cannot query it from
// the browser (no CORS headers, bot-blocked), so the citation total is kept here
// by hand. Bump SCHOLAR_CITATIONS when it changes (currently 5).
export const SCHOLAR_PROFILE_URL = "https://scholar.google.com/citations?user=hwbWuI0AAAAJ";
export const SCHOLAR_CITATIONS = 5;

// Academic standing + program selectivity surfaced in the About spec sheet.
export const ABOUT_FACTS = {
  gpa: "3.63",
  gpaScale: "4.00",
  // Apple Developer Academy @ BINUS, Cohort 2026 (applicant figures approximate).
  academy: { accepted: 200, applicants: "17,500–20,000", rate: "≈1%" },
};


export const EXPERIENCES = [{
        year: "Feb 2026 – Present",
        role: "Apple Developer Academy Scholar",
        company: "Apple Developer Academy @ BINUS",
        description: `Selected as an Apple Developer Academy Scholar (Cohort 2026). Training in iOS development with Swift and SwiftUI, focusing on building user-centered applications through Apple's Challenge-Based Learning methodology.`,
        technologies: ["Swift", "SwiftUI", "Xcode", "UIKit", "iOS Development"],
        achievements: [
            "Selected for competitive Apple Developer Academy program",
            "Training in full-stack iOS application development",
            "Applying Challenge-Based Learning to real-world projects"
        ]
    }, {
        year: "Jan 2025 – Dec 2025",
        role: "Undergraduate Research Assistant",
        company: "BINUS University",
        description: `Led experimental design and implementation for bone fracture detection research, progressing from assistant to first authorship on IEEE publication. Curated FracAtlas X-ray dataset with COCO annotations and designed preprocessing pipeline addressing severe class imbalance in medical imaging. Implemented Faster R-CNN with EfficientNetV2-S backbone, benchmarking FPN vs. PAFPN architectures and cost-sensitive loss functions.`,
        technologies: ["Python", "PyTorch", "Faster R-CNN", "EfficientNetV2", "OpenCV"],
        achievements: [
            "Compared FPN and PAFPN necks and evaluated cost-sensitive losses for class imbalance",
            "Progressed from research assistant to first author on IEEE ISRITI publication",
            "Engineered complete pipeline with AdamW, mixed precision, gradual unfreezing, and EMA"
        ]
    }, {
        year: "Jul 2024 – Aug 2024",
        role: "Application Developer Intern",
        company: "Otoritas Jasa Keuangan (OJK)",
        description: `Developed banking supervision features ensuring regulatory compliance for Indonesia's Financial Services Authority. Collaborated with senior engineers on code review and production reliability. Optimized PostgreSQL queries and authored technical documentation, reducing onboarding time and support tickets.`,
        technologies: ["C#", ".NET", "PostgreSQL", "SQL", "Documentation"],
        achievements: [
            "Developed banking supervision features for regulatory compliance",
            "Optimized database queries improving system performance",
            "Contributed scalability recommendations for government systems"
        ]
    },
    {
        year: "Feb 2024 – Present",
        role: "General Secretary & Board Member",
        company: "Bagi Dunia (NGO)",
        description: `Managed financial operations and fundraising for non-profit organization focused on community service. Recruited and onboarded 30+ volunteers, developed SOPs reducing coordination overhead by 25%. Coordinated multi-site food distribution delivering 500+ aid packages to 100+ beneficiaries across Jakarta.`,
        technologies: ["Project Management", "Fundraising", "Team Leadership", "Logistics"],
        achievements: [
            "Raised Rp17M+ (~$1000 USD), exceeding fundraising targets by 25%",
            "Secured 7 corporate sponsorships, increased community engagement by 40%",
            "Delivered 500+ aid packages to 100+ beneficiaries across Jakarta"
        ]
    },
    {
        year: "Nov 2023 – Dec 2025",
        role: "Peer Tutor & Educational Content Creator",
        company: "Independent",
        description: `Provided weekly tutoring in Statistics, Discrete Mathematics, and Linear Algebra to 15-20 students while maintaining full academic load. Designed and delivered technical bootcamps and free lecture series in Statistics and Computational Physics reaching 150+ students. Managed video production for educational content.`,
        technologies: ["Python", "Mathematics", "Statistics", "Video Production", "Teaching"],
        achievements: [
            "Tutored 15-20 students weekly in advanced mathematics courses",
            "Reached 150+ students through technical bootcamps and free lectures",
            "Delivered Computational Physics lectures via Discord to CS students"
        ]
    },
];


export const PROJECTS = [{
        title: "OccamViT – A Compact Vision Backbone Designed by Subtraction",
        image: project11,
        description: "First-author research; manuscript in preparation. Starting from a 16.6M-parameter prototype, removed or replaced one component at a time and re-tested the final block's two defining decisions on ImageNet-1K. What remains uses only standard PyTorch operators: a convolutional trunk followed by transformer blocks of full attention and a gated feed-forward network with depthwise convolution and GRN. Trained from scratch on ImageNet-1K without distillation or extra data, on a single RTX 5090, Tiny reaches 80.24 ± 0.13% top-1 at 6.8M parameters (three seeds) and Small 82.14% at 11.9M (two seeds), with 31.7% on ImageNet-A. A check of 16 compact baselines found that moving their quoted numbers to the same plain-supervised setting reverses 17 of 78 pairwise orderings.",
        technologies: ["PyTorch", "Vision Transformer", "Deep Learning", "Computer Vision", "ImageNet-1K", "Ablation Studies", "Robustness", "Research"],
        demo: null,
        github: null,
        links: []
    },
    {
        title: "Diabetic Retinopathy Detection Using CNN",
        image: project2,
        description: "Built a Tkinter-based application that analyzes retinal images using a CNN to detect diabetic retinopathy with 88% accuracy on unseen data. Incorporated GradCAM for visualization of diagnostic regions.",
        technologies: ["Python", "TensorFlow", "Keras", "OpenCV", "Tkinter", "CNN"],
        demo: "https://youtu.be/81xBX_VymP0",
        github: null,
        links: ["https://youtu.be/81xBX_VymP0"]
    },
    {
        title: "Facial Recognition for Airport Security",
        image: project3,
        description: "Designed and implemented a real-time facial recognition system using CNN and webcam integration to streamline ticket exchange and enhance airport security.",
        technologies: ["Python", "TensorFlow", "Tkinter", "OpenCV", "CNN", "Machine Learning", "Computer Vision"],
        demo: "https://youtu.be/pQsROxAF7qs",
        github: null,
        links: ["https://youtu.be/pQsROxAF7qs"]
    },
    {
        title: "Skin Type Detection Using CNN",
        image: project4,
        description: "Developed a real-time skin type detection application that leverages CNN and webcam input to provide immediate analytical feedback.",
        technologies: ["Python", "TensorFlow", "Keras", "Tkinter", "OpenCV", "CNN", "Computer Vision"],
        demo: "https://youtu.be/sBkJIPdkRqo",
        github: null,
        links: ["https://youtu.be/sBkJIPdkRqo"]
    },
    {
        title: "Peer Tutoring & Academic Lecture Series",
        image: project6,
        description: "Organized and led free tutoring sessions in Statistics, Discrete Mathematics, and Linear Algebra for 15–20 classmates, along with a bootcamp (IDR 50K) covering Algorithms & Programming, Statistics, and Linear Algebra. Additionally, delivered comprehensive Computational Physics lectures to over 150 Computer Science students via Discord and video.",
        technologies: ["Online Teaching", "Discord", "Video Production", "Educational Content"],
        demo: "https://www.youtube.com/@CujohRamirez",
        github: null,
        links: ["https://www.youtube.com/@CujohRamirez"]
    },
    {
        title: "Deep Learning research on Computer Vision",
        image: project5,
        description: "Conducting research on ensemble distillation and mutual learning for computer vision models. The goal is to enhance model accuracy and calibration through innovative training techniques.",
        technologies: ["Python", "TensorFlow", "Keras", "PyTorch", "Deep Learning", "Ensemble Learning", "Mutual Learning", "Computer Vision", "Research", "AI"],
        demo: null,
        github: null,
        links: []
    }, {
        title: "Aria Music Player with Vocal/Instrumental Separation",
        image: coverAria,
        description: "Developed a full-stack music streaming platform featuring real-time vocal and instrumental track separation. Implemented user authentication, music library management, and an interactive audio player with synchronized playback controls.",
        technologies: ["React", "Node.js", "Express", "SQLite", "JavaScript", "CSS", "HTML5 Audio API", "RESTful API"],
        demo: null,
        github: null,
        links: []
    },
    {
        title: "CS Learning Platform",
        image: coverCsLearning,
        description: "Developed an interactive education platform with quiz creation functionality, secure authentication, and role-based access control for administrators, lecturers, and students.",
        technologies: ["PHP", "Laravel", "JavaScript", "MySQL", "Bootstrap", "Git", "RESTful API", "Blade Templates"],
        demo: null,
        github: null,
        links: []
    },
    {
        title: "EchoVision - Smart Waste Classification System",
        image: coverEchoVision,
        description: "Developed an AI-powered waste classification system with real-time webcam analysis and GradCAM visualization to help users properly sort 12 categories of recyclable materials.",
        technologies: ["Python", "TensorFlow", "PyTorch", "MobileNetV3", "OpenCV", "GradCAM", "Computer Vision", "Transfer Learning"],
        demo: null,
        github: null,
        links: []
    },
    {
        title: "Factory Bearing Monitoring System",
        image: coverBearing,
        description: "Built a professional industrial IoT dashboard for real-time bearing fault monitoring, featuring animated factory visualization, predictive maintenance, and interactive model analysis reporting.",
        technologies: ["Python", "Tkinter", "Pandas", "NumPy", "Pillow", "Machine Learning", "EDA", "Threading"],
        demo: null,
        github: null,
        links: []
    },
    {
        title: "Lord Card Shop – Modern ASP.NET E-Commerce Platform",
        image: coverCardShop,
        description: "Built a full-featured collectible card e-commerce web application with modern UI/UX, secure authentication, transaction management, and responsive design. Enhanced all pages for a consistent, professional look and seamless user experience.",
        technologies: ["C#", "ASP.NET MVC", "Entity Framework", "Razor", "Bootstrap", "SQL", "HTML", "CSS", "JavaScript"],
        demo: null,
        github: null,
        links: []
    },
    {
        title: "DALX – On-Device Chest Radiograph Measurement Platform",
        image: project10,
        description: "Built an on-device chest radiograph measurement platform: a native macOS SwiftUI app over a Python engine running five local deep learning models (HybridGNet, CXAS, RAD-DINO, MedGemma) that extract anatomical measurements from a DICOM with no cloud round-trip. It reports geometry rather than diagnoses: a measurement that cannot be validly computed returns null with a machine-readable reason code instead of a plausible number. It exports structured DICOM SR and PDF. Selected to exhibit at Garuda Spark Expo.",
        technologies: ["Swift", "SwiftUI", "Python", "PyTorch", "MLX", "FastAPI", "DICOM", "Medical Imaging", "On-Device AI"],
        demo: null,
        github: null,
        links: []
    },
    {
        title: "67Cam – macOS Camera Studio & Virtual Camera",
        image: project9,
        description: "Built a macOS camera studio that turns a webcam into a system-wide virtual camera, with 35 real-time filters and a Vision tracker that follows up to five people at once. Users record a gesture, train an on-device CreateML classifier in seconds, then trigger custom pose overlays that any app reads as a camera input, from Zoom and Discord to OBS and FaceTime.",
        technologies: ["Swift", "SwiftUI", "Vision", "CoreML", "CreateML", "Metal", "CoreImage", "CoreMediaIO", "AVFoundation"],
        demo: null,
        github: null,
        links: []
    },
    {
        title: "FightRoom – Martial Arts Coach & Gym Discovery",
        image: project8,
        description: "Built a native iOS 26 app for discovering martial arts coaches and gyms: a Liquid Glass MapKit map, an App Intents Siri shortcut, and WCAG AAA contrast throughout. Designed as an evidence project for applying Apple HIG and Gestalt principles in real Swift code, with each design decision justified inline.",
        technologies: ["Swift", "SwiftUI", "MapKit", "App Intents", "CoreLocation", "iOS 26", "Accessibility", "HIG"],
        demo: null,
        github: null,
        links: []
    }
];

// Curated subset shown on the homepage Projects section, in display order. Titles must
// match PROJECTS exactly; everything else stays available in the "All Projects" archive.
// Swap these to feature different / flagship projects as they are audited and published.
export const FEATURED_PROJECT_TITLES = [
    "FightRoom – Martial Arts Coach & Gym Discovery",
    "67Cam – macOS Camera Studio & Virtual Camera",
    "DALX – On-Device Chest Radiograph Measurement Platform",
    "OccamViT – A Compact Vision Backbone Designed by Subtraction",
];

// Curated picks for the "More work" wall under the featured projects, in display order. Titles must
// match PROJECTS exactly; every project stays in the "View all" archive.
export const MORE_WORK_TITLES = [
    "Diabetic Retinopathy Detection Using CNN",
    "Aria Music Player with Vocal/Instrumental Separation",
    "Facial Recognition for Airport Security",
    "EchoVision - Smart Waste Classification System",
    "Peer Tutoring & Academic Lecture Series",
    "Factory Bearing Monitoring System",
];

export const CERTIFICATIONS = [{
        title: "Scientific Computing with Python",
        issuer: "FreeCodeCamp",
        link: "https://www.freecodecamp.org/certification/Gading_Aditya/scientific-computing-with-python-v7",
        image: certificate1, // Replace with your certificate image variable or path
    },
    {
        title: "Responsive Web Design Certification",
        issuer: "FreeCodeCamp",
        link: "https://www.freecodecamp.org/certification/Gading_Aditya/responsive-web-design",
        image: certificate2,
    },
    {
        title: "Computer Vision",
        issuer: "Kaggle",
        link: "https://www.kaggle.com/learn/certification/gadingaditya/computer-vision",
        image: certificate3,
    },
    {
        title: "Intro to Machine Learning",
        issuer: "Kaggle",
        link: "https://www.kaggle.com/learn/certification/gadingaditya/intro-to-machine-learning",
        image: certificate4,
    },
    {
        title: "Intermediate Machine Learning",
        issuer: "Kaggle",
        link: "https://www.kaggle.com/learn/certification/gadingaditya/intermediate-machine-learning",
        image: certificate5,
    },
    {
        title: "Machine Learning Explainability",
        issuer: "Kaggle",
        link: "https://www.kaggle.com/learn/certification/gadingaditya/machine-learning-explainability",
        image: certificate6,
    },
    {
        title: "Intro to Deep Learning",
        issuer: "Kaggle",
        link: "https://www.kaggle.com/learn/certification/gadingaditya/intro-to-deep-learning",
        image: certificate7,
    },
    {
        title: "Data Visualization",
        issuer: "Kaggle",
        link: "https://www.kaggle.com/learn/certification/gadingaditya/data-visualization",
        image: certificate8,
    },
    {
        title: "Data Cleaning",
        issuer: "Kaggle",
        link: "https://www.kaggle.com/learn/certification/gadingaditya/data-cleaning",
        image: certificate9,
    },
    {
        title: "Intro to AI Ethics",
        issuer: "Kaggle",
        link: "https://www.kaggle.com/learn/certification/gadingaditya/intro-to-ai-ethics",
        image: certificate10,
    },
    {
        title: "JavaScript Algorithms and Data Structures",
        issuer: "FreeCodeCamp",
        link: "https://www.freecodecamp.org/certification/Gading_Aditya/javascript-algorithms-and-data-structures-v8",
        image: certificate11,
    },
    {
        title: "Legacy JavaScript Algorithms and Data Structures",
        issuer: "FreeCodeCamp",
        link: "https://www.freecodecamp.org/certification/Gading_Aditya/javascript-algorithms-and-data-structures",
        image: certificate12,
    },
    {
        title: "Data Analysis with Python",
        issuer: "FreeCodeCamp",
        link: "https://www.freecodecamp.org/certification/Gading_Aditya/data-analysis-with-python-v7",
        image: certificate13,
    },
    {
        title: "Machine Learning with Python",
        issuer: "FreeCodeCamp",
        link: "https://www.freecodecamp.org/certification/Gading_Aditya/machine-learning-with-python-v7",
        image: certificate14,
    },
    {
        title: "College Algebra with Python",
        issuer: "FreeCodeCamp",
        link: "https://www.freecodecamp.org/certification/Gading_Aditya/college-algebra-with-python-v8",
        image: certificate15,
    },
    {
        title: "Building LLM Applications With Prompt Engineering",
        issuer: "NVIDIA",
        link: "https://learn.nvidia.com/certificates?id=bVGETzzZQWGRtbGc-yU-vA",
        image: certificate16,
    },
];

// Curated credentials surfaced inline on the Experience section (titles must match
// CERTIFICATIONS exactly); the full set stays in the "All credentials" overlay. Swap
// these to feature different certificates without touching the frozen data above.
export const FEATURED_CERTIFICATION_TITLES = [
    "Building LLM Applications With Prompt Engineering",
    "Computer Vision",
    "Machine Learning with Python",
    "Intro to Deep Learning",
];

export const RESEARCH_PAPERS = [
    {
        year: "2025",
        title: "Enhancing Bone Fracture Detection in X-ray Images Using Faster R-CNN with EfficientNetV2",
        authors: "Perdana, G. A., Nasari, M., Saputra, M.A., Halim, R., Minor, K.A.",
        venue: "IEEE ISRITI 2025",
        venueType: "Conference",
        description: "Led experimental design and implementation for bone fracture detection using Faster R-CNN with EfficientNetV2-S backbone. Curated FracAtlas X-ray dataset with COCO annotations and designed preprocessing pipeline addressing severe class imbalance. Built the training pipeline with AdamW, mixed precision, gradual unfreezing, and EMA.",
        keywords: ["Object Detection", "Faster R-CNN", "EfficientNetV2", "Medical Imaging", "X-ray Analysis"],
        isFirstAuthor: true,
        citations: 0,
    },
    {
        year: "2025",
        title: "CALM: Calibrated Adaptive Learning via Mutual-Ensemble Fusion",
        authors: "Perdana, G. A., Ghazali, M.A., Iswanto, I.A., Joddy, S.",
        venue: "Procedia Computer Science (ICCSCI 2025)",
        venueType: "Conference",
        scopusIndexed: "Q2",
        doi: "10.1016/j.procs.2025.09.034",
        description: "Developed ensemble learning framework integrating knowledge distillation, mutual learning, and calibration for improved model confidence. Implemented adaptive curriculum protocol to dynamically schedule training objectives. Achieved 97.16% accuracy on CIFAR-10 and evaluated model confidence with Expected Calibration Error.",
        keywords: ["Ensemble Learning", "Model Calibration", "Knowledge Distillation", "Mutual Learning", "Deep Learning"],
        isFirstAuthor: true,
        citations: 1,
    },
    {
        year: "2025",
        title: "Analytical Analysis of Cryptocurrency Regulation and Adoption: A Machine Learning-Driven Ablation Study",
        authors: "Perdana, G. A., Kisdi, M.I.A., Wairooy, I.K., Makalew, B.A.",
        venue: "Procedia Computer Science (ICCSCI 2025)",
        venueType: "Conference",
        scopusIndexed: "Q2",
        doi: "10.1016/j.procs.2025.09.108",
        description: "Novel machine learning framework using XGBoost regression and SHAP analysis to quantify regulatory policy effects on cryptocurrency trading volume across the United States, Russia, and Indonesia. Policy ablation simulations revealed jurisdiction-specific sensitivities providing quantitative insights for regulation design.",
        keywords: ["Cryptocurrency", "Machine Learning", "XGBoost", "SHAP Analysis", "Policy Analysis", "Economic Modeling"],
        isFirstAuthor: true,
        citations: 3,
    },
    {
        year: "2025",
        title: "Tiny vs. Tinier: Baseline ViT-Tiny vs. Ensemble-Distilled Student on Imbalanced Fracture Detection",
        authors: "Nathen, A., Perdana, G. A., Jefferson, G., Hasani, M.F., Maulina, A., Tjahyadi, B.G.",
        venue: "Procedia Computer Science (ICCSCI 2025)",
        venueType: "Conference",
        scopusIndexed: "Q2",
        doi: "10.1016/j.procs.2025.09.099",
        description: "Comparative study of Vision Transformer (ViT-Tiny) against ensemble-distilled student model for bone fracture X-ray classification on highly imbalanced datasets. The distilled student achieved 0.7033 F1-score and 0.6433 MCC while maintaining ViT-Tiny's compact footprint.",
        keywords: ["Vision Transformer", "Medical Imaging", "Knowledge Distillation", "Imbalanced Learning", "Fracture Detection"],
        isFirstAuthor: false,
        citations: 0,
    },
    {
        year: "2025",
        title: "Ablation Study: Calibrated Adaptive Learning Ensemble Methodology",
        authors: "Perdana, G. A., Wijaya, I.I., Fahreza, K.A., Tarigan, G.A.",
        venue: "Procedia Computer Science (ICCSCI 2025)",
        venueType: "Conference",
        scopusIndexed: "Q2",
        doi: "10.1016/j.procs.2025.09.041",
        description: "Systematic ablation study examining how teacher ensemble size influences student accuracy, calibration, and computational cost in the CALM framework. Results demonstrate that calibration-aware training yields lowest expected calibration error with diminishing returns beyond three teachers.",
        keywords: ["Ablation Study", "Ensemble Learning", "Model Calibration", "CIFAR-10", "Teacher-Student Networks"],
        isFirstAuthor: true,
        citations: 1,
    }
];

export const CONTACT = {
    email: "gadingadityaperdana@gmail.com",
};