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
I'm a passionate Computer Science undergraduate specializing in deep learning and AI research with a focus on computer vision. I love building innovative projects. from a Diabetic Retinopathy Detection application to facial recognition systems. I thrive in collaborative environments and I'm driven to create impactful AI solutions.
`;

export const ABOUT_TEXT = `
I have a strong focus on deep learning and AI research, particularly in computer vision. My journey in technology started from a genuine curiosity to understand how things work, leading me to develop innovative projects like a Diabetic Retinopathy Detector, a Facial Recognition system for airport security, and a customizable T-shirt design website. My internship at OJK provided valuable insights into regulatory frameworks, while my volunteer work at Bagi Dunia enhanced my leadership and organizational skills. I thrive in collaborative environments, continuously seeking new challenges to sharpen my technical expertise and deliver impactful solutions. Outside of coding, I enjoy exploring emerging tech trends and contributing to community initiatives.
`;

export const EXPERIENCES = [{
        year: "Jul 2024 - Aug 2024",
        role: "Application Developer Intern",
        company: "Otoritas Jasa Keuangan (OJK)",
        description: `Assisted in banking supervision app development using C# .NET, focusing on regulatory compliance, performance, and user experience. Collaborated with senior developers on QA, conducting code reviews, debugging, and testing the SIP BPR/BPRS system. Updated data tables, authored user manuals, and contributed to project planning. Completed a comprehensive internship report summarizing key outcomes.`,
        technologies: ["C#", ".NET", "SQL", "QA", "Documentation"],
    },
    {
        year: "October 2023 - December 2024",
        role: "Peer Tutor & Bootcamp Instructor",
        company: "Binus University",
        description: `Independently organized tutoring initiatives. Conducted a bootcamp with a nominal fee (IDR 50K) for over 12 participants covering Algorithms & Programming, Discrete Math, and Linear Algebra. Additionally, offered a free Statistics session open to all classmates. Delivered comprehensive lectures in Computational Physics to more than 150 Computer Science students via Discord and video, enhancing their practical understanding of complex topics.`,
        technologies: ["Python", "Mathematics", "Discord", "Online Teaching"],
    },
    {
        year: "Feb 2024 - Present",
        role: "Chairperson (Secretary-Treasurer)",
        company: "BagiDunia",
        description: `Spearheaded social initiatives, organized successful fundraising campaigns, developed SOPs, and managed event budgeting. Attended charity events, handled logistics for food distribution and nursing home visits, and provided educational sessions for children in underserved communities. Fostered empathy and community engagement through collaborative team efforts.`,
        technologies: ["Project Management", "Fundraising", "Team Leadership", "Logistics"],
    },
    {
        year: "2024 - Present",
        role: "AI & Computer Vision Researcher (Personal Projects)",
        company: "Independent",
        description: `Developed a Diabetic Retinopathy Detection system (88% accuracy on unseen data) using CNN and GradCAM. Built a real-time Facial Recognition system for airport security and a Skin Type Detection app leveraging CNN with webcam input. Currently researching an ensemble approach integrating multiple models (InceptionV3, ViT_B16, DenseNet121, ResNet50, EfficientNetB0, MobileNetV3) to compare ensemble distillation vs. mutual learning.`,
        technologies: ["Python", "TensorFlow", "Keras", "OpenCV", "CNN", "GradCAM", "PyTorch", "Deep Learning"],
    },
];


export const PROJECTS = [{
        title: "StyleTailor – Customizable T-Shirt Design Website",
        image: project1,
        description: "Developed and published a front-end web application that allows users to customize and order t-shirts. Integrated the Polotno API for interactive, Canva-like design features supporting both original and custom designs.",
        technologies: ["HTML", "CSS", "JavaScript", "React", "Polotno API"],
        links: ["https://styletailor.netlify.app/"]
    },
    {
        title: "Diabetic Retinopathy Detection Using CNN",
        image: project2,
        description: "Built a Tkinter-based application that analyzes retinal images using a CNN to detect diabetic retinopathy with 88% accuracy on unseen data. Incorporated GradCAM for visualization of diagnostic regions.",
        technologies: ["Python", "TensorFlow", "Keras", "OpenCV", "Tkinter", "CNN"],
        links: ["https://youtu.be/81xBX_VymP0"]
    },
    {
        title: "Facial Recognition for Airport Security",
        image: project3,
        description: "Designed and implemented a real-time facial recognition system using CNN and webcam integration to streamline ticket exchange and enhance airport security.",
        technologies: ["Python", "TensorFlow", "Tkinter", "OpenCV", "CNN", "Machine Learning", "Computer Vision"],
        links: ["https://youtu.be/pQsROxAF7qs"]
    },
    {
        title: "Skin Type Detection Using CNN",
        image: project4,
        description: "Developed a real-time skin type detection application that leverages CNN and webcam input to provide immediate analytical feedback.",
        technologies: ["Python", "TensorFlow", "Keras", "Tkinter", "OpenCV", "CNN", "Computer Vision"],
        links: ["https://youtu.be/sBkJIPdkRqo"]
    },
    {
        title: "Peer Tutoring & Academic Lecture Series",
        image: project6,
        description: "Organized and led free tutoring sessions in Statistics, Discrete Mathematics, and Linear Algebra for 15–20 classmates, along with a bootcamp (IDR 50K) covering Algorithms & Programming, Statistics, and Linear Algebra. Additionally, delivered comprehensive Computational Physics lectures to over 150 Computer Science students via Discord and video.",
        technologies: ["Online Teaching", "Discord", "Video Production", "Educational Content"],
        links: ["https://www.youtube.com/@CujohRamirez"]
    },
    {
        title: "Deep Learning research on Ensemble Learning & Mutual Learning",
        image: project5,
        description: "Currently researching an ensemble and mutual learning approach integrating six models (InceptionV3, ViT_B16, DenseNet121, ResNet50, EfficientNetB0, MobileNetV3) to compare ensemble distillation versus mutual learning strategies then unifying both.",
        technologies: ["Python", "TensorFlow", "Keras", "PyTorch", "Deep Learning", "Ensemble Learning", "Mutual Learning", "Computer Vision", "Research", "AI"],
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

export const CONTACT = {
    email: "gadingadityaperdana@gmail.com",
};