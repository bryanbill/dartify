import { describe, it, expect } from '@jest/globals';
import * as ts from 'typescript';
import { generateFunction } from '../generator/generateFunction.js';

describe('generateFunction', () => {
    it('should generate a Dart function for a simple TS function', () => {
        const node = ts.factory.createFunctionDeclaration(
            [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
            undefined,
            'foo',
            undefined,
            [],
            undefined,
            undefined
        );
        const code = generateFunction(node, {} as any, new Map(), new Set(), '', '', '', [], new Map());
        expect(code).toContain('@JS(');
        expect(code).toContain('external');
    });
});
