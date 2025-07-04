<div align="center">
  <h1>dartify</h1>
  <p><strong>TypeScript-to-Dart Interop Generator</strong></p>
  <p>Generate Dart JS interop bindings from TypeScript declaration files, with modular output and grouped (barrel) exports.</p>
</div>

---

## Features

- **Converts TypeScript `.d.ts` files to Dart JS interop code**
- **Modular, DRY, and production-ready codebase**
- **CLI usage via `npx` or local install**
- **Grouped export (barrel) file generation per folder and at output root**
- **Jest-based test suite for all modules**
- **ESM/Node compatibility**
- **In-code API documentation**

---

## Installation

You can use dartify directly with `npx` (no install required):

```sh
npx dartify <options>
```

Or install locally/globally:

```sh
npm install -g dartify
# or
npm install --save-dev dartify
```

---

## Usage

### CLI

```sh
npx dartify  <input_dir> <output_dir>
```

### Example

```sh
npx dartify  example/types/  example/interops/
```

This will generate Dart files for each TypeScript declaration, grouped by folder, with `<folder>.dart` barrel files in each output folder and at the output root.

---

## How It Works

1. **Parses TypeScript declaration files** using the TypeScript compiler API.
2. **Maps TypeScript types to Dart JS interop types** (e.g., `string` → `JSString`).
3. **Generates Dart files** for classes, functions, and type aliases.
4. **Creates grouped export (barrel) files** per folder and at the output root.
5. **Ensures all output is modular and ready for Dart consumption.**

---

## Project Structure

- `src/cli.ts` — CLI entrypoint
- `src/generator/` — Modular generator logic:
  - `barrel.ts` — Barrel (grouped export) file generation
  - `dartWriter.ts` — Dart file writing utilities
  - `fileUtils.ts` — File system helpers
  - `generateClass.ts` — Class code generation
  - `generateFunction.ts` — Function code generation
  - `generateNode.ts` — AST traversal and code generation
  - `generateTypeAlias.ts` — Type alias code generation
  - `mapType.ts` — TypeScript-to-Dart type mapping
  - `typeMap.ts` — Type name to file path mapping
- `src/__tests__/` — Jest test files for all modules
- `package.json`, `tsconfig.json`, `jest.config.js` — Configuration

---

## Development

### Build

```sh
npm run build
```

### Test

```sh
npm test
```

### Local CLI Development

```sh
npm run build
npm link
dartify <input_dir> <output_dir>
```

---

## API Documentation

All modules and functions are documented with JSDoc-style comments. See the source files in `src/generator/` for details.

---

## License

MIT
