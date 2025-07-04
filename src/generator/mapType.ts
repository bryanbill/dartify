
/**
 * Maps TypeScript types to Dart types for JS interop.
 *
 * @module mapType
 */

import * as ts from 'typescript';
import * as path from 'path';

/**
 * Maps a TypeScript type node to a Dart type, adding necessary imports.
 *
 * @param typeNode - The TypeScript type node.
 * @param typeChecker - The TypeScript type checker.
 * @param typeMap - A map of type names to file paths.
 * @param imports - A set of Dart import paths.
 * @param currentFile - The current TypeScript file path.
 * @param outputDir - The output directory for Dart files.
 * @param inputDir - The input directory for TypeScript files.
 * @param namespacePath - The namespace path for the type.
 * @returns The Dart type as a string.
 */
export function mapType(
    typeNode: ts.TypeNode | undefined,
    typeChecker: ts.TypeChecker,
    typeMap: Map<string, string>,
    imports: Set<string>,
    currentFile: string,
    outputDir: string,
    inputDir: string,
    namespacePath: string[]
): string {
    if (!typeNode) return 'JSObject';

    if (ts.isTypeReferenceNode(typeNode)) {
        const typeName = typeNode.typeName.getText();
        const fullTypeName = namespacePath.length > 0 ? [...namespacePath, typeName].join('.') : typeName;
        if (typeMap.has(fullTypeName)) {
            const typeFile = typeMap.get(fullTypeName)!;
            if (typeFile !== currentFile && !typeFile.includes('lib.')) {
                const relativePath = path.relative(
                    path.dirname(currentFile),
                    typeFile
                ).replace('.d.ts', '').replace(/\\/g, '/');
                const typeNamespaceParts = fullTypeName.split('.').slice(0, -1).map(part => part.toLowerCase());
                const typeNamePart = typeName.toLowerCase();
                const dartRelativePath = path.join(...typeNamespaceParts, typeNamePart + '.dart');
                imports.add(dartRelativePath.startsWith('.') ? dartRelativePath : `./${dartRelativePath}`);
            }
            return typeName;
        }
        return 'JSObject';
    } else if (ts.isArrayTypeNode(typeNode)) {
        const elementType = mapType(typeNode.elementType, typeChecker, typeMap, imports, currentFile, outputDir, inputDir, namespacePath);
        return `JSArray<${elementType}>`;
    } else {
        switch (typeNode.kind) {
            case ts.SyntaxKind.StringKeyword: return 'JSString';
            case ts.SyntaxKind.NumberKeyword: return 'JSNumber';
            case ts.SyntaxKind.BooleanKeyword: return 'JSBoolean';
            case ts.SyntaxKind.VoidKeyword: return 'void';
            // Use JSObject for any, object, unknown, never, undefined, null, symbol, bigint
            case ts.SyntaxKind.AnyKeyword:
            case ts.SyntaxKind.ObjectKeyword:
            case ts.SyntaxKind.UnknownKeyword:
            case ts.SyntaxKind.NeverKeyword:
            case ts.SyntaxKind.UndefinedKeyword:
            case ts.SyntaxKind.NullKeyword:
            case ts.SyntaxKind.SymbolKeyword:
            case ts.SyntaxKind.BigIntKeyword:
                return 'JSObject';
            default:
                return 'JSObject';
        }
    }
}
