// Script to generate simple GLB files for FluidGlass component
// Run with: node scripts/generate-glb-models.mjs

import { JSDOM } from 'jsdom';

// Create a DOM environment for Node.js
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.FileReader = dom.window.FileReader;
global.Blob = dom.window.Blob;
global.atob = dom.window.atob;
global.btoa = dom.window.btoa;

// Now import Three.js and GLTFExporter after setting up the environment
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, '../public/assets/3d');

async function exportGLB(scene, filename) {
  const exporter = new GLTFExporter();
  
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      async (gltf) => {
        const buffer = Buffer.from(gltf);
        const outputPath = path.join(outputDir, filename);
        await fs.writeFile(outputPath, buffer);
        console.log(`✓ Generated: ${filename}`);
        resolve();
      },
      (error) => reject(error),
      { binary: true }
    );
  });
}

async function generateModels() {
  await fs.mkdir(outputDir, { recursive: true });

  // Lens (Torus)
  const lensScene = new THREE.Scene();
  const lensGeometry = new THREE.TorusGeometry(3.2, 1.1, 32, 64);
  const lensMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const lensMesh = new THREE.Mesh(lensGeometry, lensMaterial);
  lensMesh.name = 'Cylinder';
  lensScene.add(lensMesh);
  await exportGLB(lensScene, 'lens.glb');

  // Bar (Box)
  const barScene = new THREE.Scene();
  const barGeometry = new THREE.BoxGeometry(7.2, 1.15, 1.25);
  const barMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const barMesh = new THREE.Mesh(barGeometry, barMaterial);
  barMesh.name = 'Cube';
  barScene.add(barMesh);
  await exportGLB(barScene, 'bar.glb');

  // Cube
  const cubeScene = new THREE.Scene();
  const cubeGeometry = new THREE.BoxGeometry(3.2, 3.2, 3.2);
  const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cubeMesh.name = 'Cube';
  cubeScene.add(cubeMesh);
  await exportGLB(cubeScene, 'cube.glb');

  console.log('\n✨ All GLB models generated successfully!');
}

generateModels().catch(console.error);
