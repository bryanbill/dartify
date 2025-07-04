
/**
 * Recursively generates Dart code for TypeScript AST nodes (classes, functions, type aliases, modules).
 *
 * @module generateNode
 */

import * as ts from 'typescript';
import { generateClass } from './generateClass.js';
import { generateFunction } from './generateFunction.js';
import { generateTypeAlias } from './generateTypeAlias.js';
import path from 'path';

/**
 * Generates Dart code for a TypeScript AST node and updates the file contents map.
 *
 * @param node - The TypeScript AST node.
 * @param typeChecker - The TypeScript type checker.
 * @param typeMap - A map of type names to file paths.
 * @param outputDir - The output directory for Dart files.
 * @param inputDir - The input directory for TypeScript files.
 * @param namespacePath - The namespace path for the node.
 * @param fileContents - A map of file paths to their generated code, imports, and members.
 * @param currentFile - The current TypeScript file path.
 */
export function generateNode(
    node: ts.Node,
    typeChecker: ts.TypeChecker,
    typeMap: Map<string, string>,
    outputDir: string,
    inputDir: string,
    namespacePath: string[],
    fileContents: Map<string, { code: string; imports: Set<string>; members: Map<string, Set<string>> }>,
    currentFile: string
): void {
    let filePath: string;
    let name: string | undefined;

    if (ts.isClassDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
        name = node.name?.text || 'Anonymous';
        filePath = getOutputFilePath(name, namespacePath, inputDir, outputDir, currentFile);
    } else if (ts.isFunctionDeclaration(node)) {
        name = node.name?.text || 'anonymous';
        filePath = getOutputFilePath(name, namespacePath, inputDir, outputDir, currentFile);
    } else if (ts.isModuleDeclaration(node) && node.body && ts.isModuleBlock(node.body)) {
        const newNamespacePath = [...namespacePath, node.name.text];
        ts.forEachChild(node.body, (child) => {
            generateNode(child, typeChecker, typeMap, outputDir, inputDir, newNamespacePath, fileContents, currentFile);
        });
        return;
    } else {
        return;
    }

    const imports = fileContents.get(filePath)?.imports || new Set<string>();
    const members = fileContents.get(filePath)?.members || new Map<string, Set<string>>();
    let code = fileContents.get(filePath)?.code || '';

    let generated: string;
    if (ts.isClassDeclaration(node)) {
        generated = generateClass(node, typeChecker, typeMap, imports, currentFile, outputDir, inputDir, namespacePath, members, fileContents);
    } else if (ts.isFunctionDeclaration(node)) {
        generated = generateFunction(node, typeChecker, typeMap, imports, currentFile, outputDir, inputDir, namespacePath, members);
    } else if (ts.isTypeAliasDeclaration(node)) {
        generated = generateTypeAlias(node, typeChecker, typeMap, imports, currentFile, outputDir, inputDir, namespacePath);
    } else {
        return;
    }

    if (generated) {
        code += generated;
        fileContents.set(filePath, { code, imports, members });
    }
}

function getOutputFilePath(name: string, namespacePath: string[], inputDir: string, outputDir: string, currentFile: string): string {
    const relativePath = path.relative(inputDir, currentFile).replace('.d.ts', '');
    const namespaceParts = namespacePath.map(part => part.toLowerCase());
    const fileName = name.toLowerCase() + '.dart';
    const finalPath = namespaceParts.length > 0
        ? path.join(outputDir, ...namespaceParts, fileName)
        : path.join(outputDir, relativePath, fileName);
    return finalPath.replace(/\\/g, '/');
}
