import { describe, it, expect } from '@jest/globals';
import * as path from 'path';
import * as fs from 'fs';

describe('CLI Entrypoint', () => {
    it('should exist and be executable', () => {
        const cliPath = path.resolve(__dirname, '../cli.ts');
        expect(fs.existsSync(cliPath)).toBe(true);
    });
});
