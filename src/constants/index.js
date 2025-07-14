import project1 from "../assets/projects/project-1.jpg";
import project2 from "../assets/projects/project-2.jpg";
import project3 from "../assets/projects/project-3.jpg";
import project4 from "../assets/projects/project-4.jpg";
import project5 from "../assets/projects/project-5.jpg";
import project6 from "../assets/projects/project-6.jpg";
import certificate1 from "../assets/certificates/certificate1.png";
import certificate2 from "../assets/certificates/certificate2.png";
import certificate3 from "../assets/certificates/certificate3.png";
import certificate4 from "../assets/certificates/certificate4.png";
import certificate5 from "../assets/certificates/certificate5.png";
import certificate6 from "../assets/certificates/certificate6.png";
import certificate7 from "../assets/certificates/certificate7.png";
import certificate8 from "../assets/certificates/certificate8.png";
import certificate9 from "../assets/certificates/certificate9.png";
import certificate10 from "../assets/certificates/certificate10.png";
import certificate11 from "../assets/certificates/certificate11.png";
import certificate12 from "../assets/certificates/certificate12.png";
import certificate13 from "../assets/certificates/certificate13.png";
import certificate14 from "../assets/certificates/certificate14.png";
import certificate15 from "../assets/certificates/certificate15.png";

export const HERO_CONTENT = `
I'm a passionate AI/ML Engineer and Computer Science specialist with deep expertise in artificial intelligence, machine learning, and computer vision. I excel at transforming complex research concepts into scalable, production-ready solutions. From developing advanced Diabetic Retinopathy Detection systems to implementing sophisticated facial recognition architectures, I deliver innovative AI solutions that drive meaningful business impact and technological advancement.
`;

export const ABOUT_TEXT = `
As an AI/ML Engineer with a strong foundation in deep learning and computer vision research, I specialize in developing cutting-edge artificial intelligence solutions. My expertise spans the entire AI development lifecycle, from research and experimentation to production deployment and optimization. I've successfully built and deployed innovative projects including a state-of-the-art Diabetic Retinopathy Detection system, advanced facial recognition solutions for security applications, and intelligent automation platforms. My experience at OJK provided valuable insights into regulatory compliance and enterprise-grade AI governance, while my leadership roles have honed my ability to guide cross-functional teams toward successful AI implementations. I thrive in challenging environments where I can leverage my technical expertise in machine learning, computer vision, and full-stack development to create transformative solutions that bridge the gap between cutting-edge research and practical business applications.
`;

export const EXPERIENCES = [{
        year: "Jan 2025 – Present",
        role: "Undergraduate Research Assistant",
        company: "Binus University - Binus Research Center",
        description: `Under the Penelitian Pemula Binus (PPB) program, I collaborated and with Maulin Nasari, S.T., M.Kom. and Supervised under her leadership to develop an automated bone‐fracture diagnosis system using deep learning. I curated and validated a high‐quality X-ray dataset, conducted thorough cleaning and exploratory analyses to uncover and address class imbalances, and advised on dataset augmentation strategies. I then devised and executed comparative experiments on Vision Transformer and CNN architectures. Both standalone and within bagging, boosting, stacking, and majority‐voting ensembles, and distilled the findings into a concise report to guide subsequent model optimization.`,
        technologies: ["Python", "PyTorch", "TensorFlow", "NumPy", "Pandas"],
        achievements: [
            "Curated high-quality X-ray dataset with 95% accuracy validation",
            "Achieved 15% performance improvement through ensemble methods",
            "Published comprehensive research findings report"
        ]
    }, {
        year: "Jul 2024 - Aug 2024",
        role: "Application Developer Intern",
        company: "Otoritas Jasa Keuangan (OJK)",
        description: `Assisted in banking supervision app development using C# .NET, focusing on regulatory compliance, performance, and user experience. Collaborated with senior developers on QA, conducting code reviews, debugging, and testing the SIP BPR/BPRS system. Updated data tables, authored user manuals, and contributed to project planning. Completed a comprehensive internship report summarizing key outcomes.`,
        technologies: ["C#", ".NET", "SQL", "QA", "Documentation"],
        achievements: [
            "Improved system performance by 20% through code optimization",
            "Authored comprehensive user manuals for SIP BPR/BPRS system",
            "Contributed to regulatory compliance improvements"
        ]
    },
    {
        year: "October 2023 - December 2024",
        role: "Peer Tutor & Bootcamp Instructor",
        company: "Binus University",
        description: `Independently organized tutoring initiatives. Conducted a bootcamp with a nominal fee (IDR 50K) for over 12 participants covering Algorithms & Programming, Discrete Math, and Linear Algebra. Additionally, offered a free Statistics session open to all classmates. Delivered comprehensive lectures in Computational Physics to more than 150 Computer Science students via Discord and video, enhancing their practical understanding of complex topics.`,
        technologies: ["Python", "Mathematics", "Discord", "Online Teaching"],
        achievements: [
            "Successfully tutored 150+ Computer Science students",
            "Organized bootcamp with 12+ participants and positive feedback",
            "Delivered engaging online lectures via Discord platform"
        ]
    },
    {
        year: "Feb 2024 - Present",
        role: "Chairperson (Secretary-Treasurer)",
        company: "BagiDunia",
        description: `Spearheaded social initiatives, organized successful fundraising campaigns, developed SOPs, and managed event budgeting. Attended charity events, handled logistics for food distribution and nursing home visits, and provided educational sessions for children in underserved communities. Fostered empathy and community engagement through collaborative team efforts.`,
        technologies: ["Project Management", "Fundraising", "Team Leadership", "Logistics"],
        achievements: [
            "Led 10+ successful fundraising campaigns",
            "Developed comprehensive SOPs for organizational efficiency",
            "Managed logistics for 50+ community service events"
        ]
    },
    {
        year: "2024 - Present",
        role: "AI & Computer Vision Researcher (Personal Projects)",
        company: "Independent",
        description: `Developed a Diabetic Retinopathy Detection system (88% accuracy on unseen data) using CNN and GradCAM. Built a real-time Facial Recognition system for airport security and a Skin Type Detection app leveraging CNN with webcam input. Currently researching an ensemble approach integrating multiple models (InceptionV3, ViT_B16, DenseNet121, ResNet50, EfficientNetB0, MobileNetV3) to compare ensemble distillation vs. mutual learning.`,
        technologies: ["Python", "TensorFlow", "Keras", "OpenCV", "CNN", "GradCAM", "PyTorch", "Deep Learning"],
        achievements: [
            "Achieved 88% accuracy on Diabetic Retinopathy Detection system",
            "Built real-time facial recognition system for security applications",
            "Research on ensemble methods with 6+ different model architectures"
        ]
    },
];


export const PROJECTS = [{
        title: "StyleTailor – Customizable T-Shirt Design Website",
        image: project1,
        description: "Developed and published a front-end web application that allows users to customize and order t-shirts. Integrated the Polotno API for interactive, Canva-like design features supporting both original and custom designs.",
        technologies: ["HTML", "CSS", "JavaScript", "React", "Polotno API"],
        demo: "https://styletailor.netlify.app/",
        github: null,
        links: ["https://styletailor.netlify.app/"]
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
        image: project1,
        description: "Developed a full-stack music streaming platform featuring real-time vocal and instrumental track separation. Implemented user authentication, music library management, and an interactive audio player with synchronized playback controls.",
        technologies: ["React", "Node.js", "Express", "SQLite", "JavaScript", "CSS", "HTML5 Audio API", "RESTful API"],
        demo: null,
        github: "https://github.com/cujoramirez/Aria",
        links: ["https://github.com/cujoramirez/Aria"]
    },
    {
        title: "CS Learning Platform",
        image: project1,
        description: "Developed an interactive education platform with quiz creation functionality, secure authentication, and role-based access control for administrators, lecturers, and students.",
        technologies: ["PHP", "Laravel", "JavaScript", "MySQL", "Bootstrap", "Git", "RESTful API", "Blade Templates"],
        demo: null,
        github: null,
        links: []
    },
    {
        title: "EchoVision - Smart Waste Classification System",
        image: project2,
        description: "Developed an AI-powered waste classification system with real-time webcam analysis and GradCAM visualization to help users properly sort 12 categories of recyclable materials.",
        technologies: ["Python", "TensorFlow", "PyTorch", "MobileNetV3", "OpenCV", "GradCAM", "Computer Vision", "Transfer Learning"],
        demo: null,
        github: null,
        links: []
    },
    {
        title: "Factory Bearing Monitoring System",
        image: project3,
        description: "Built a professional industrial IoT dashboard for real-time bearing fault monitoring, featuring animated factory visualization, predictive maintenance, and interactive model analysis reporting.",
        technologies: ["Python", "Tkinter", "Pandas", "NumPy", "Pillow", "Machine Learning", "EDA", "Threading"],
        demo: null,
        github: null,
        links: []
    },
    {
        title: "Lord Card Shop – Modern ASP.NET E-Commerce Platform",
        image: project4,
        description: "Built a full-featured collectible card e-commerce web application with modern UI/UX, secure authentication, transaction management, and responsive design. Enhanced all pages for a consistent, professional look and seamless user experience.",
        technologies: ["C#", "ASP.NET MVC", "Entity Framework", "Razor", "Bootstrap", "SQL", "HTML", "CSS", "JavaScript"],
        demo: null,
        github: null,
        links: []
    }
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
];

export const RESEARCH_PAPERS = [{
        year: "2025",
        title: "CALM: Calibrated Adaptive Learning via Mutual-Ensemble Fusion",
        authors: "Gading Aditya Perdana (First Author), Muhammad Alif Ghazali (Co-author)",
        conference: "Procedia Computer Science, ICCSCI 2025 (Accepted)",
        description: "This research introduces CALM (Calibrated Adaptive Learning via Mutual-Ensemble Fusion), a novel multi-stage framework designed to create vision models that are both highly accurate and reliably calibrated, meaning their confidence scores genuinely reflect their predictive correctness. CALM uniquely integrates ensemble distillation and mutual learning, employing an Adaptive Curriculum Protocol (ACP) to dynamically balance diverse training objectives. A key innovation, Heterogeneous Feature Integration (HFI), facilitates effective knowledge transfer from varied teacher architectures. The framework culminates in a 'meta-student' model that demonstrates strong performance, significantly improved calibration, and robust generalization to new datasets, offering a systematic approach to developing more trustworthy and uncertainty-aware AI systems.",
        keywords: ["Uncertainty Calibration", "Mutual-Ensemble Fusion", "Adaptive Curriculum Protocol (ACP)", "Heterogeneous Feature Integration (HFI)", "Deep Learning"],
        // pdfLink: "./assets/CALM.pdf",
    },
    {
        year: "2025",
        title: "Analytical Analysis of Cryptocurrency Regulation and Adoption: A Machine Learning-Driven Ablation Study",
        authors: "M.I.A. Kisdi (First Author), Gading Aditya Perdana (Co-author)",
        conference: "Procedia Computer Science, ICCSCI 2025 (Accepted)",
        description: "A novel machine learning framework to quantify the effects of regulatory policies on GDP normalized Bitcoin trading volume in the United States, Russia, and Indonesia. Using XGBoost regression and SHAP analysis on panel data integrating Bitcoin price series, adoption rates, and policy variables, this study conducts policy ablation simulations. Results reveal jurisdiction-specific sensitivities: removing AML enforcement increases US volume by +71.45%, while eliminating taxation reduces Indonesian volume by -46.90%, providing quantitative insights for cryptocurrency regulation design.",
        keywords: ["Cryptocurrency Regulation", "Machine Learning", "XGBoost", "SHAP Analysis", "Policy Ablation", "Economic Analysis"],
        // pdfLink: "./assets/crypto-regulation.pdf",
    },
    {
        year: "2025",
        title: "Tiny vs. Tinier: Baseline ViT-Tiny vs. Ensemble-Distilled Student on Imbalanced Fracture Detection",
        authors: "Nathen, A. (First Author), Gading Aditya Perdana (Co-author)",
        conference: "Procedia Computer Science, ICCSCI 2025 (Accepted)",
        description: "This study compares baseline Vision Transformer (ViT-Tiny) performance against an ensemble-distilled student model for bone fracture X-ray classification on highly imbalanced datasets (1:5 fracture:non-fracture ratio). Incorporating Stratified k-fold cross-validation with inline SMOTE, class-weighted losses, extensive data augmentation, and advanced training techniques, the distilled student achieved superior performance with 0.7033 F1-score and 0.6433 MCC, surpassing both CNN teachers and baseline while maintaining ViT-Tiny's compact footprint.",
        keywords: ["Vision Transformer", "Medical Imaging", "Imbalanced Learning", "Knowledge Distillation", "Fracture Detection", "SMOTE"],
        // pdfLink: "./assets/vit-fracture.pdf",
    },
    {
        year: "2025",
        title: "Ablation Study: Calibrated Adaptive Learning Ensemble Methodology",
        authors: "Gading Aditya Perdana (First Author), Research Team (Co-authors)",
        conference: "Procedia Computer Science, ICCSCI 2025 (Accepted)",
        description: "A systematic ablation study of the CALM framework examining how teacher ensemble size influences student accuracy, calibration, and computational cost. Using ensembles of 2-5 teachers from diverse convolutional architectures on CIFAR-10, this study evaluates four CALM configurations. Results demonstrate that calibration-aware training yields lowest expected calibration error, while adaptive curriculum pacing delivers exceptional calibration in small ensembles, with diminishing returns beyond three teachers.",
        keywords: ["Ablation Study", "Ensemble Learning", "Model Calibration", "Computational Efficiency", "CIFAR-10", "Teacher-Student Networks"],
        // pdfLink: "./assets/calm-ablation.pdf",
    }
];

export const CONTACT = {
    email: "gadingadityaperdana@gmail.com",
};