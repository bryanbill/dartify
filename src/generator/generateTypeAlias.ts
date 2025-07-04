
/**
 * Generates Dart code for TypeScript type alias declarations.
 *
 * @module generateTypeAlias
 */

import * as ts from 'typescript';
import { mapType } from './mapType.js';

/**
 * Generates Dart code for a TypeScript type alias, mapping to JSObject if object-like.
 *
 * @param node - The TypeScript type alias declaration node.
 * @param typeChecker - The TypeScript type checker.
 * @param typeMap - A map of type names to file paths.
 * @param imports - A set of Dart import paths.
 * @param currentFile - The current TypeScript file path.
 * @param outputDir - The output directory for Dart files.
 * @param inputDir - The input directory for TypeScript files.
 * @param namespacePath - The namespace path for the type alias.
 * @returns The generated Dart code for the type alias.
 */
export function generateTypeAlias(
    node: ts.TypeAliasDeclaration,
    typeChecker: ts.TypeChecker,
    typeMap: Map<string, string>,
    imports: Set<string>,
    currentFile: string,
    outputDir: string,
    inputDir: string,
    namespacePath: string[]
): string {
    const typeName = node.name.text;
    const jsName = namespacePath.length > 0 ? [...namespacePath, typeName].join('.') : typeName;
    // Detect object-like type aliases and always map to JSObject
    let isObjectLike = false;
    if (
        ts.isTypeLiteralNode(node.type) &&
        node.type.members.length === 1 &&
        ts.isIndexSignatureDeclaration(node.type.members[0])
    ) {
        isObjectLike = true;
    } else if (
        node.type.kind === ts.SyntaxKind.ObjectKeyword ||
        (ts.isTypeReferenceNode(node.type) && node.type.typeName.getText() === 'Object')
    ) {
        isObjectLike = true;
    }
    const dartType = isObjectLike ? 'JSObject' : mapType(node.type, typeChecker, typeMap, imports, currentFile, outputDir, inputDir, namespacePath);
    return `@JS('${jsName}')\n@staticInterop\ntypedef ${typeName} = ${dartType};\n\n`;
}
