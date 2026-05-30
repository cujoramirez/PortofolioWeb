import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.resolve(projectRoot, 'src');
const entryPoints = [path.resolve(srcDir, 'main.jsx')];
const scriptExtensions = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.cjs'];
const styleExtensions = ['.css', '.scss', '.sass'];
const shouldDelete = process.argv.includes('--delete');

const visited = new Set();
const queue = [...entryPoints];

const fileCache = new Map();

async function readFileCached(filePath) {
    if (fileCache.has(filePath)) {
        return fileCache.get(filePath);
    }
    const content = await fs.readFile(filePath, 'utf8');
    fileCache.set(filePath, content);
    return content;
}

function extractImportSpecifiers(code) {
    const specifiers = new Set();

    const staticImportRegex = /import\s+(?:[^'";]+?\s+from\s+)?["']([^"']+)["']/g;
    const exportFromRegex = /export\s+(?:\*|{[^}]+})\s+from\s+["']([^"']+)["']/g;
    const dynamicImportRegex = /import\s*\(\s*["']([^"']+)["']\s*\)/g;
    const requireRegex = /require\s*\(\s*["']([^"']+)["']\s*\)/g;

    let match;
    while ((match = staticImportRegex.exec(code)) !== null) {
        specifiers.add(match[1]);
    }
    while ((match = exportFromRegex.exec(code)) !== null) {
        specifiers.add(match[1]);
    }
    while ((match = dynamicImportRegex.exec(code)) !== null) {
        specifiers.add(match[1]);
    }
    while ((match = requireRegex.exec(code)) !== null) {
        specifiers.add(match[1]);
    }

    return [...specifiers];
}

async function resolveImport(importPath, fromFile) {
    if (!importPath.startsWith('.')) {
        return null;
    }
    const basePath = path.resolve(path.dirname(fromFile), importPath);

    const importHasExtension = path.extname(importPath) !== '';

    if (importHasExtension) {
        const resolved = await tryFile(basePath);
        if (resolved) {
            return resolved;
        }
    }

    for (const ext of [...scriptExtensions, ...styleExtensions, '.json']) {
        const resolved = await tryFile(basePath + ext);
        if (resolved) {
            return resolved;
        }
    }

    const resolvedIndex = await tryIndexFile(basePath);
    if (resolvedIndex) {
        return resolvedIndex;
    }

    return null;
}

async function tryFile(candidate) {
    try {
        const stats = await fs.stat(candidate);
        if (stats.isFile()) {
            return candidate;
        }
    } catch (error) {
        return null;
    }
    return null;
}

async function tryIndexFile(candidateDir) {
    try {
        const stats = await fs.stat(candidateDir);
        if (!stats.isDirectory()) {
            return null;
        }
    } catch (error) {
        return null;
    }

    for (const ext of [...scriptExtensions, ...styleExtensions, '.json']) {
        const candidateFile = path.join(candidateDir, `index${ext}`);
        const resolved = await tryFile(candidateFile);
        if (resolved) {
            return resolved;
        }
    }

    return null;
}

function isScriptFile(filePath) {
    return scriptExtensions.includes(path.extname(filePath));
}

async function collectUsedModules() {
    while (queue.length > 0) {
        const current = queue.pop();
        if (visited.has(current)) {
            continue;
        }
        visited.add(current);

        const code = await readFileCached(current);
        const specifiers = extractImportSpecifiers(code);

        for (const specifier of specifiers) {
            const resolved = await resolveImport(specifier, current);
            if (!resolved) {
                continue;
            }
            if (!resolved.startsWith(srcDir)) {
                continue;
            }
            if (visited.has(resolved)) {
                continue;
            }
            queue.push(resolved);
        }
    }
}

async function collectAllScriptFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            const nested = await collectAllScriptFiles(fullPath);
            files.push(...nested);
        } else if (isScriptFile(fullPath)) {
            files.push(fullPath);
        }
    }

    return files;
}

function toRelative(filePath) {
    return path.relative(projectRoot, filePath).replace(/\\/g, '/');
}

async function main() {
    const mainEntryExists = await tryFile(entryPoints[0]);
    if (!mainEntryExists) {
        console.error('Entry file src/main.jsx not found.');
        process.exit(1);
    }

    await collectUsedModules();

    const allScripts = await collectAllScriptFiles(srcDir);
    const reachableScripts = Array.from(visited).filter(isScriptFile);
    const unused = allScripts.filter(filePath => !visited.has(filePath));

    console.log('Entry points:');
    for (const entry of entryPoints) {
        console.log(`  - ${toRelative(entry)}`);
    }

    console.log(`\nTotal script files: ${allScripts.length}`);
    console.log(`Reachable script files: ${reachableScripts.length}`);
    console.log(`Unused script files: ${unused.length}`);

    if (unused.length > 0) {
        if (!shouldDelete) {
            console.log('\nPotentially unused script files (verify before deletion):');
        } else {
            console.log('\nDeleting unused script files...');
        }

        for (const file of unused) {
            const relativePath = toRelative(file);
            if (!shouldDelete) {
                console.log(`  - ${relativePath}`);
                continue;
            }

            try {
                await fs.unlink(file);
                console.log(`  - deleted ${relativePath}`);
            } catch (error) {
                console.error(`  ! failed to delete ${relativePath}: ${error.message}`);
            }
        }
    } else if (shouldDelete) {
        console.log('\nNo unused script files detected.');
    }
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
