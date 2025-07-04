
/**
 * Generates Dart code for TypeScript function declarations.
 *
 * @module generateFunction
 */

import * as ts from 'typescript';
import { mapType } from './mapType.js';

/**
 * Generates Dart code for a TypeScript function, including JS interop annotations.
 *
 * @param node - The TypeScript function declaration node.
 * @param typeChecker - The TypeScript type checker.
 * @param typeMap - A map of type names to file paths.
 * @param imports - A set of Dart import paths.
 * @param currentFile - The current TypeScript file path.
 * @param outputDir - The output directory for Dart files.
 * @param inputDir - The input directory for TypeScript files.
 * @param namespacePath - The namespace path for the function.
 * @param members - A map of class/function names to their member signatures.
 * @returns The generated Dart code for the function.
 */
export function generateFunction(
    node: ts.FunctionDeclaration,
    typeChecker: ts.TypeChecker,
    typeMap: Map<string, string>,
    imports: Set<string>,
    currentFile: string,
    outputDir: string,
    inputDir: string,
    namespacePath: string[],
    members: Map<string, Set<string>>
): string {
    const funcName = node.name?.text || 'anonymous';
    const jsName = namespacePath.length > 0 ? [...namespacePath, funcName].join('.') : funcName;
    const funcKey = jsName;
    const funcSignature = `${funcName}(${node.parameters.map(p => p.name.getText()).join(', ')})`;

    let classMembers = members.get(funcKey) || new Set<string>();
    if (classMembers.has(funcSignature)) {
        return '';
    }

    const params = node.parameters
        .map(p => {
            const paramName = p.name.getText();
            const paramType = mapType(p.type, typeChecker, typeMap, imports, currentFile, outputDir, inputDir, namespacePath);
            const isNullable = p.questionToken ? '?' : '';
            return `${paramType}${isNullable} ${paramName}`;
        })
        .join(', ');
    const returnType = mapType(node.type, typeChecker, typeMap, imports, currentFile, outputDir, inputDir, namespacePath);
    classMembers.add(funcSignature);
    members.set(funcKey, classMembers);
    return `@JS('${jsName}')\nexternal ${returnType} ${funcName}(${params});\n\n`;
}
