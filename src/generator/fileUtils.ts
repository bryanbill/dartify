
/**
 * File system utilities for Dart file generation.
 *
 * @module fileUtils
 */

import * as fs from 'fs';
import * as path from 'path';


/**
 * Ensures that a directory exists, creating it recursively if needed.
 * @param dir - The directory path to ensure.
 */
export function ensureDirExists(dir: string): void {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}


/**
 * Writes content to a file, ensuring the directory exists.
 * @param filePath - The file path to write to.
 * @param content - The content to write.
 */
export function writeFile(filePath: string, content: string): void {
    ensureDirExists(path.dirname(filePath));
    fs.writeFileSync(filePath, content);
}


/**
 * Lists all Dart files in a folder, excluding specified files.
 * @param folder - The folder to search.
 * @param exclude - An array of filenames to exclude.
 * @returns An array of Dart filenames.
 */
export function listDartFiles(folder: string, exclude: string[] = []): string[] {
    return fs.readdirSync(folder)
        .filter(f => f.endsWith('.dart') && !exclude.includes(f));
}
