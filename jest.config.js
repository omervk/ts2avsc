const path = require("path");
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['build/'],
  testRegex: ['tests/.+\\.spec\\.ts'],
  reporters: [
    'default',
    ...(process.env.CI !== 'true'
        ? [
          [
            'jest-junit',
            {
              outputDirectory: path.join(__dirname, `./test-reports`),
              outputName: `${path.basename(path.resolve())}-tests.xml`,
            },
          ],
        ]
        : []),
  ],
  reporters: ['default'],
  setupFiles: ['./tests/generate-tests.js'],
};
