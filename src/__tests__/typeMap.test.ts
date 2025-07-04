import { describe, it, expect } from '@jest/globals';
import * as ts from 'typescript';
import { buildTypeMap } from '../generator/typeMap.js';

describe('typeMap', () => {
    it('should build a type map from a simple d.ts', () => {
        const source = 'declare class Foo {}';
        const fileName = 'foo.d.ts';
        const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
        const program = ts.createProgram({ rootNames: [fileName], options: {}, host: ts.createCompilerHost({}) });
        // Patch getSourceFiles to return our single file
        jest.spyOn(program, 'getSourceFiles').mockReturnValue([sourceFile]);
        const typeMap = buildTypeMap(program, '.');
        expect(typeMap.has('Foo')).toBe(true);
        expect(typeMap.get('Foo')).toBe(fileName);
    });
});
