import { describe, it, expect } from '@jest/globals';
import { createFolderBarrel, createRootExports } from '../generator/barrel.js';
import * as fs from 'fs';
import * as path from 'path';

describe('barrel', () => {
    const testDir = path.join(__dirname, 'barreldir');
    const dartFile = path.join(testDir, 'foo.dart');
    const dartFile2 = path.join(testDir, 'bar.dart');

    beforeAll(() => {
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(dartFile, '// foo');
        fs.writeFileSync(dartFile2, '// bar');
    });
    afterAll(() => {
        fs.rmSync(testDir, { recursive: true, force: true });
    });

    it('should create a <folder>.dart file exporting all files', () => {
        createFolderBarrel(testDir);
        const groupFile = path.join(testDir, 'barreldir.dart');
        expect(fs.existsSync(groupFile)).toBe(true);
        const content = fs.readFileSync(groupFile, 'utf8');
        expect(content).toContain("export './foo.dart';");
        expect(content).toContain("export './bar.dart';");
    });
});
