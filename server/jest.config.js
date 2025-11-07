/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm', // Use this preset for ESM
  testEnvironment: 'node',
  moduleNameMapper: {
    // resolve ESM imports (like './app.js')
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    // Use ts-jest for all .ts files
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true, // Tell ts-jest we are using ES Modules
      },
    ],
  },
};