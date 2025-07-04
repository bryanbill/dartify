
/**
 * Generates Dart code for TypeScript class declarations.
 *
 * @module generateClass
 */

import * as ts from 'typescript';
import { mapType } from './mapType.js';

/**
 * Generates Dart code for a TypeScript class, including static interop and extension members.
 *
 * @param node - The TypeScript class declaration node.
 * @param typeChecker - The TypeScript type checker.
 * @param typeMap - A map of type names to file paths.
 * @param imports - A set of Dart import paths.
 * @param currentFile - The current TypeScript file path.
 * @param outputDir - The output directory for Dart files.
 * @param inputDir - The input directory for TypeScript files.
 * @param namespacePath - The namespace path for the class.
 * @param members - A map of class/function names to their member signatures.
 * @param fileContents - A map of file paths to their generated code, imports, and members.
 * @returns The generated Dart code for the class.
 */
export function generateClass(
    node: ts.ClassDeclaration,
    typeChecker: ts.TypeChecker,
    typeMap: Map<string, string>,
    imports: Set<string>,
    currentFile: string,
    outputDir: string,
    inputDir: string,
    namespacePath: string[],
    members: Map<string, Set<string>>,
    fileContents: Map<string, { code: string; imports: Set<string>; members: Map<string, Set<string>> }>
): string {
    const className = node.name?.text || 'Anonymous';
    const jsName = namespacePath.length > 0 ? [...namespacePath, className].join('.') : className;
    const classKey = jsName;

    let dartCode = '';
    let classMembers = members.get(classKey) || new Set<string>();

    // Initialize class if not already generated
    if (!members.has(classKey)) {
        dartCode = `@JS('${jsName}')\n@staticInterop\nclass ${className} {\n  external factory ${className}(JSObject? opt_options);\n}\n\n`;
        members.set(classKey, classMembers);
    } else {
        dartCode = '';
    }

    // Collect instance members for extension
    let extensionCode = '';
    let hasExtension = false;
    for (const member of node.members) {
        if (ts.isMethodDeclaration(member)) {
            const methodName = member.name.getText();
            const methodSignature = `${methodName}(${member.parameters.map(p => p.name.getText()).join(', ')})`;
            if (!classMembers.has(methodSignature)) {
                const params = member.parameters
                    .map(p => {
                        const paramName = p.name.getText();
                        const paramType = mapType(p.type, typeChecker, typeMap, imports, currentFile, outputDir, inputDir, namespacePath);
                        const isNullable = p.questionToken ? '?' : '';
                        return `${paramType}${isNullable} ${paramName}`;
                    })
                    .join(', ');
                const returnType = mapType(member.type, typeChecker, typeMap, imports, currentFile, outputDir, inputDir, namespacePath);
                extensionCode += `  external ${returnType} ${methodName}(${params});\n`;
                classMembers.add(methodSignature);
                hasExtension = true;
            }
        } else if (ts.isPropertyDeclaration(member)) {
            const propName = member.name.getText();
            const propSignature = `get ${propName}`;
            if (!classMembers.has(propSignature)) {
                const propType = mapType(member.type, typeChecker, typeMap, imports, currentFile, outputDir, inputDir, namespacePath);
                extensionCode += `  external ${propType} get ${propName};\n`;
                const isReadOnly = member.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ReadonlyKeyword);
                if (!isReadOnly) {
                    extensionCode += `  external set ${propName}(${propType} value);\n`;
                }
                classMembers.add(propSignature);
                hasExtension = true;
            }
        }
    }
    if (hasExtension) {
        extensionCode = `extension ${className}Extension on ${className} {\n${extensionCode}}\n\n`;
    }
    dartCode += extensionCode;
    return dartCode;
}
