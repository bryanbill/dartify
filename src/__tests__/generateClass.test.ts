import { describe, it, expect } from '@jest/globals';
import * as ts from 'typescript';
import { generateClass } from '../generator/generateClass.js';

describe('generateClass', () => {
    it('should generate a Dart class for a simple TS class', () => {
        const node = ts.factory.createClassDeclaration(
            [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
            'Foo',
            undefined,
            undefined,
            []
        );
        const code = generateClass(node, {} as any, new Map(), new Set(), '', '', '', [], new Map(), new Map());
        expect(code).toContain('@JS(');
        expect(code).toContain('class Foo');
    });
});
