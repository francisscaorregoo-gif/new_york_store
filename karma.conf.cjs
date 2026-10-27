module.exports = function (config) {
  config.set({
    basePath: ".",
    frameworks: ["jasmine"],
    proxies: { "/img/": "/base/public/img/" },
    files: [
      {
        pattern: "public/img/*",
        included: false,
        served: true,
        watched: false,
      },
      { pattern: ".test-build/tests.js", watched: false },
    ],
    reporters: ["progress", "coverage"],
    browsers: ["ChromeHeadless"],
    singleRun: true,
    autoWatch: false,
    client: { jasmine: { random: false }, captureConsole: true },
    browserNoActivityTimeout: 30000,
    coverageReporter: {
      dir: "coverage",
      reporters: [
        { type: "html", subdir: "html" },
        { type: "json-summary", subdir: ".", file: "coverage-summary.json" },
        { type: "text-summary" },
      ],
    },
  });
};
