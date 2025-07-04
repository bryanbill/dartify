#!/usr/bin/env node
/**
 * dartify CLI
 *
 * Usage:
 *   npx dartify <inputDir> <outputDir>
 *
 * This CLI tool scans a directory of TypeScript .d.ts files and generates Dart JS interop files.
 *
 * Features:
 * - Recursively scans the input directory for .d.ts files.
 * - Generates Dart files for classes, functions, and type aliases.
 * - Writes all generated Dart files to the output directory, preserving folder structure.
 * - Creates a <folder>.dart file in each output folder that exports all Dart files in that folder.
 * - At the output root, creates a <folder>.dart for each folder, each exporting only from its own folder (no single barrel file).
 * - Skips TypeScript lib files and files outside the input directory.
 *
 * Example:
 *   npx dartify src/types/ output/interop/
 *
 * Author: Brian Omondi <brian@omondi.dev>
 * License: MIT
 */
import * as path from 'path';
import * as ts from 'typescript';
import { buildTypeMap } from './generator/typeMap.js';
import { generateNode } from './generator/generateNode.js';
import { writeDartFile } from './generator/dartWriter.js';
import { createFolderBarrel, createRootExports } from './generator/barrel.js';
import * as glob from 'glob';

/**
 * Main entry point for the dartify CLI.
 * @param inputDir Directory containing .d.ts files
 * @param outputDir Directory to write generated Dart files
 */
function dartify(inputDir: string, outputDir: string): void {
    console.log(`Scanning input directory: ${inputDir}`);
    const dtsFiles = glob.sync(path.join(inputDir, '**/*.d.ts'), { nodir: true });
    console.log(`Found ${dtsFiles.length} .d.ts files:`, dtsFiles);

    if (dtsFiles.length === 0) {
        console.error('No .d.ts files found in the input directory.');
        process.exit(1);
    }

    const program = ts.createProgram(dtsFiles, {
        skipLibCheck: true,
        noResolve: true,
    });
    const typeChecker = program.getTypeChecker();
    const typeMap = buildTypeMap(program, inputDir);

    const fileContents = new Map<string, { code: string; imports: Set<string>; members: Map<string, Set<string>> }>();
    for (const sourceFile of program.getSourceFiles()) {
        // Only process files that are children of inputDir
        if (!sourceFile.fileName.startsWith(inputDir)) continue;
        if (!sourceFile.fileName.endsWith('.d.ts') || sourceFile.fileName.includes('lib.')) continue;
        generateDartForFile(sourceFile, typeChecker, typeMap, outputDir, inputDir, fileContents);
    }

    const allFolders = new Set<string>();
    for (const [filePath, { code, imports }] of fileContents) {
        if (!code) continue;
        writeDartFile(filePath, code, imports);
        allFolders.add(path.dirname(filePath));
    }

    for (const folder of allFolders) {
        createFolderBarrel(folder);
    }
    createRootExports(allFolders, outputDir);
    console.log(`Generated Dart interop files in ${outputDir}`);
}

/**
 * Generates Dart code for a single TypeScript source file.
 * @param sourceFile The TypeScript source file
 * @param typeChecker The TypeScript type checker
 * @param typeMap Map of type names to source files
 * @param outputDir Output directory for Dart files
 * @param inputDir Input directory for .d.ts files
 * @param fileContents Map to store generated code and imports
 */
function generateDartForFile(
    sourceFile: ts.SourceFile,
    typeChecker: ts.TypeChecker,
    typeMap: Map<string, string>,
    outputDir: string,
    inputDir: string,
    fileContents: Map<string, { code: string; imports: Set<string>; members: Map<string, Set<string>> }>
): void {
    ts.forEachChild(sourceFile, (node) => {
        generateNode(node, typeChecker, typeMap, outputDir, inputDir, [], fileContents, sourceFile.fileName);
    });
}

// CLI entry
const [inputDir, outputDir] = process.argv.slice(2);
if (!inputDir || !outputDir) {
    console.error('Usage: dartify <inputDir> <outputDir>');
    process.exit(1);
}
dartify(inputDir, outputDir);
