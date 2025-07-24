import fs from 'fs';
import { join as joinPath } from 'path';

export function getFiles(path: string): any {
  if (!fs.existsSync(path)) {
    console.error(`Commands directory not found: ${path}`);
  }

  const files = [];

  const dirFiles = fs.readdirSync(path);

  for (const file of dirFiles) {
    if (file.endsWith('.js') || file.endsWith('.ts')) {
      files.push(joinPath(path, file));
    } else {
      files.push(...getFiles(joinPath(path, file)));
    }
  }

  return files;
}