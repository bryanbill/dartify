/** @type {import('jest').Config} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/__tests__/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  moduleNameMapper: {
    "^(.{1,2}/.*)\\.js$": "$1",
    "^(.{1,2}/.*)\\.ts$": "$1",
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/__tests__/**"],
};
