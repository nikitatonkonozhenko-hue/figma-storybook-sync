import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const sourcePath = path.join(ROOT, "sync/mappings/usecases-by-project.json");
const targetPath = path.join(ROOT, "prototype/usecase-config.js");

const sourceRaw = await fs.readFile(sourcePath, "utf8");
const source = JSON.parse(sourceRaw);

const projectTypeOptions = source.projectTypeOptions;
const rightColumnIconUrl = source.rightColumnIconUrl;
const useCaseOptionsByProject = {};

for (const [projectId, options] of Object.entries(source.useCaseOptionsByProject || {})) {
  useCaseOptionsByProject[projectId] = options.map((option) => ({
    id: option.id,
    title: option.title,
    icon: rightColumnIconUrl,
  }));
}

const output = `// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.\n// Source: sync/mappings/usecases-by-project.json\n\nexport const projectTypeOptions = ${JSON.stringify(projectTypeOptions, null, 2)};\n\nexport const rightColumnIconUrl = ${JSON.stringify(rightColumnIconUrl)};\n\nexport const useCaseOptionsByProject = ${JSON.stringify(useCaseOptionsByProject, null, 2)};\n`;

await fs.writeFile(targetPath, output, "utf8");
console.log(`generated: ${path.relative(ROOT, targetPath)}`);
