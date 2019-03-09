module.exports = {
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^api/(.+)': '<rootDir>/src/api/$1',
    '^state/(.+)': '<rootDir>/src/state/$1',
    '^components/(.+)': '<rootDir>/src/components/$1',
    '^utils/(.+)': '<rootDir>/src/utils/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverageFrom: ['**/src/**/*.{js,jsx,ts,tsx}'],
  setupFilesAfterEnv: ['./setupTests.ts'],
};
