// Unit tests for the website's plain-TypeScript helpers (lib/). Pages and
// components are checked by the production build and in the browser.
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/lib"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          rootDir: "../..",
          module: "nodenext",
          moduleResolution: "nodenext",
          jsx: "react-jsx",
          esModuleInterop: true,
        },
      },
    ],
  },
};
