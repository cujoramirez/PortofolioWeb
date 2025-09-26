import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

const projectRoot = process.cwd();
const heroImagePath = path.join(projectRoot, "src", "assets", "GadingAdityaPerdana.jpg");
const tempOutputPath = path.join(projectRoot, "src", "assets", "GadingAdityaPerdana.tmp.jpg");

async function compressHeroImage() {
  try {
    const originalStats = await fs.stat(heroImagePath);

    await sharp(heroImagePath)
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 70, mozjpeg: true })
      .toFile(tempOutputPath);

    await fs.rename(tempOutputPath, heroImagePath);

    const optimizedStats = await fs.stat(heroImagePath);

    console.log("Hero image compressed successfully.");
    console.log(
      `Size: ${(originalStats.size / 1024 / 1024).toFixed(2)} MB -> ${(optimizedStats.size / 1024 / 1024).toFixed(2)} MB`
    );
  } catch (error) {
    console.error("Failed to compress hero image:", error);
    if (await fileExists(tempOutputPath)) {
      await fs.unlink(tempOutputPath);
    }
    process.exitCode = 1;
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

compressHeroImage();
