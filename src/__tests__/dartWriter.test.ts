import { describe, it, expect } from '@jest/globals';
import { writeDartFile } from '../generator/dartWriter.js';
import * as fs from 'fs';
import * as path from 'path';

describe('dartWriter', () => {
    const testFile = path.join(__dirname, 'test.dart');
    afterAll(() => {
        if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
    });
    it('should write a Dart file with imports', () => {
        writeDartFile(testFile, 'void main() {}', new Set(['foo.dart']));
        const content = fs.readFileSync(testFile, 'utf8');
        expect(content).toContain("import 'foo.dart';");
        expect(content).toContain('void main() {}');
    });
});
