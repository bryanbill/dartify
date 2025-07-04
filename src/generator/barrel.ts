/**
 * Barrel file utilities for Dartify.
 *
 * These functions help generate grouped export files (barrels) for Dart interop output.
 *
 * - `createFolderBarrel(folder)`: Creates a <folder>.dart file in the given folder, exporting all Dart files in that folder (except itself and barrel.dart).
 * - `createRootExports(allFolders, outputDir)`: At the output root, creates a <folder>.dart for each folder, each exporting only from its own folder.
 *
 * Example usage:
 *   createFolderBarrel('output/ol/control'); // creates output/ol/control/control.dart
 *   createRootExports(new Set(['output/ol/control', ...]), 'output');
 */

/**
 * Utilities for generating grouped export (barrel) files for Dart output.
 *
 * @module barrel
 */

import * as path from 'node:path';
import { listDartFiles, writeFile } from './fileUtils.js';

/**
 * Creates a <folder>.dart file in the given folder, exporting all Dart files in that folder (except itself and barrel.dart).
 * @param folder Absolute path to the folder
 */

/**
 * Generates a grouped export (barrel) Dart file for a given folder.
 *
 * This creates a `<folder>.dart` file in the specified folder, exporting all Dart files in that folder
 * except for any existing barrel files and the folder's own group file.
 *
 * @param folder - The absolute path to the folder for which to generate the barrel file.
 */
export function createFolderBarrel(folder: string): void {
    const folderName = path.basename(folder);
    const files = listDartFiles(folder, ['barrel.dart', `${folderName}.dart`]);
    const exports = files.map(f => `export './${f}';`).join('\n');
    const groupFilePath = path.join(folder, `${folderName}.dart`);
    writeFile(groupFilePath, `// Library file for ${folderName}\n${exports}\n`);
}

/**
 * At the output root, creates a <folder>.dart for each folder, each exporting only from its own folder.
 * @param allFolders Set of all output folders
 * @param outputDir Output root directory
 */

/**
 * Generates root-level grouped export (barrel) Dart files for all folders.
 *
 * For each folder in `allFolders`, this creates a `<folder>.dart` file at the output root,
 * which exports only the corresponding `<folder>.dart` file from that folder.
 *
 * @param allFolders - A set of absolute paths to all folders to include in the root-level barrels.
 * @param outputDir - The absolute path to the output root directory.
 */
export function createRootExports(allFolders: Set<string>, outputDir: string): void {
    const rootGroupFiles = Array.from(allFolders)
        .map(folder => path.relative(outputDir, path.join(folder, path.basename(folder) + '.dart')).replace(/\\/g, '/'));
    for (const rel of rootGroupFiles) {
        const exportFile = path.join(outputDir, path.basename(rel));
        writeFile(exportFile, `export './${rel}';\n`);
    }
}
