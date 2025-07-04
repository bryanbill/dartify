import { describe, it, expect } from '@jest/globals';
import * as ts from 'typescript';
import { generateTypeAlias } from '../generator/generateTypeAlias.js';

describe('generateTypeAlias', () => {
    it('should generate a Dart typedef for a TS type alias', () => {
        const node = ts.factory.createTypeAliasDeclaration(
            [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
            'Foo',
            undefined,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
        );
        const code = generateTypeAlias(node, {} as any, new Map(), new Set(), '', '', '', []);
        expect(code).toContain('@JS(');
        expect(code).toContain('typedef Foo');
    });
});
