
/**
 * Builds a map of TypeScript type names to their source file paths.
 *
 * @module typeMap
 */
import * as ts from 'typescript';

/**
 * Builds a map from type names (including namespaces) to file paths for all classes, interfaces, and type aliases.
 *
 * @param program - The TypeScript program.
 * @param inputDir - The input directory for TypeScript files.
 * @returns A map of type names to file paths.
 */
export function buildTypeMap(program: ts.Program, inputDir: string): Map<string, string> {
    const typeMap = new Map<string, string>();
    for (const sourceFile of program.getSourceFiles()) {
        if (!sourceFile.fileName.endsWith('.d.ts') || sourceFile.fileName.includes('lib.')) continue;
        ts.forEachChild(sourceFile, (node) => {
            processNodeForTypeMap(node, typeMap, sourceFile.fileName, []);
        });
    }
    return typeMap;
}

function processNodeForTypeMap(node: ts.Node, typeMap: Map<string, string>, fileName: string, namespacePath: string[]): void {
    if (ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
        const name = node.name?.text;
        if (name) {
            const fullName = namespacePath.length > 0 ? [...namespacePath, name].join('.') : name;
            typeMap.set(fullName, fileName);
        }
    } else if (ts.isModuleDeclaration(node) && node.body && ts.isModuleBlock(node.body)) {
        const newNamespacePath = [...namespacePath, node.name.text];
        ts.forEachChild(node.body, (child) => {
            processNodeForTypeMap(child, typeMap, fileName, newNamespacePath);
        });
    }
}
