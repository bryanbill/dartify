import { describe, it, expect } from '@jest/globals';
import { ensureDirExists, writeFile, listDartFiles } from '../generator/fileUtils.js';
import * as fs from 'fs';
import * as path from 'path';

describe('fileUtils', () => {
    const testDir = path.join(__dirname, 'testdir');
    const testFile = path.join(testDir, 'test.dart');

    afterAll(() => {
        if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
        if (fs.existsSync(testDir)) fs.rmdirSync(testDir);
    });

    it('should create a directory', () => {
        ensureDirExists(testDir);
        expect(fs.existsSync(testDir)).toBe(true);
    });

    it('should write a file', () => {
        writeFile(testFile, 'test');
        expect(fs.existsSync(testFile)).toBe(true);
    });

    it('should list Dart files', () => {
        writeFile(testFile, 'test');
        const files = listDartFiles(testDir);
        expect(files).toContain('test.dart');
    });
});
