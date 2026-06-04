import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

// Regenerate the hero image (src/assets/GadingAdityaPerdana.webp, imported by ModernHero) from the
// high-res master portrait. Run `node scripts/compress-hero.mjs` after replacing the master PNG.
const projectRoot = process.cwd();
const masterPath = path.join(projectRoot, "src", "assets", "GadingAdityaPerdana.png");
const outputPath = path.join(projectRoot, "src", "assets", "GadingAdityaPerdana.webp");

async function compressHeroImage() {
  try {
    const originalStats = await fs.stat(masterPath);

    await sharp(masterPath)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    const optimizedStats = await fs.stat(outputPath);

    console.log("Hero image regenerated from master PNG.");
    console.log(
      `Size: ${(originalStats.size / 1024 / 1024).toFixed(2)} MB -> ${(optimizedStats.size / 1024 / 1024).toFixed(2)} MB`
    );
  } catch (error) {
    console.error("Failed to regenerate hero image:", error);
    process.exitCode = 1;
  }
}

compressHeroImage();
