// tokenization.jsx
export const specialWords = [
    "Python",
    "machine",
    "learning",
    "AI",
    "research",
    "deep",
    "vision",
    "computer",
    "innovative",
    "recognition",
    "collaborative",
  ];
  
  export const multiWordPhrases = [
    "computer science",
    "facial recognition",
    "machine learning",
    "deep learning",
    "computer vision",
  ];
  
  export function isSpecialWord(word) {
    const cleanWord = word.replace(/[^\w\s]/g, "");
    return specialWords.some(
      (special) => cleanWord.toLowerCase() === special.toLowerCase()
    );
  }
  
  export function tokenizeParagraph(paragraph) {
    // First, insert spaces between lowercase and uppercase letters
    const cleanedText = paragraph.replace(/([a-z])([A-Z])/g, "$1 $2");
    const words = cleanedText.split(" ").filter((word) => word.length > 0);
    const tokens = [];
    let i = 0;
    while (i < words.length) {
      const current = words[i];
      const cleanCurrent = current.replace(/[^\w\s]/g, "").toLowerCase();
      if (i + 1 < words.length) {
        const next = words[i + 1];
        const cleanNext = next.replace(/[^\w\s]/g, "").toLowerCase();
        const combined = `${cleanCurrent} ${cleanNext}`;
        if (multiWordPhrases.includes(combined)) {
          tokens.push({ text: `${current} ${next}`, isSpecial: true });
          i += 2;
          continue;
        }
      }
      tokens.push({
        text: current,
        isSpecial: isSpecialWord(current),
      });
      i++;
    }
    return tokens;
  }
  
