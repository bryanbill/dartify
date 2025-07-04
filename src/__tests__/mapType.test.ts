import { describe, it, expect } from '@jest/globals';
import * as ts from 'typescript';
import { mapType } from '../generator/mapType.js';

describe('mapType', () => {
    it('should map string keyword to JSString', () => {
        const node = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
        const result = mapType(node, {} as any, new Map(), new Set(), '', '', '', []);
        expect(result).toBe('JSString');
    });
    it('should map array type to JSArray', () => {
        const node = ts.factory.createArrayTypeNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword));
        const result = mapType(node, {} as any, new Map(), new Set(), '', '', '', []);
        expect(result.startsWith('JSArray')).toBe(true);
    });
});
