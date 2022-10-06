const path = require('path');

const workingDir = path.resolve();
const junitReportPath = `${path.relative(workingDir, __dirname)}/test-reports/${path.basename(workingDir)}-lint.xml`;
let shouldOutputJunit = process.env.CI === 'true';

if (shouldOutputJunit) {
  console.log(`Outputting junit formatted report to: ${junitReportPath}`);
}

module.exports = {
  "files": [
    "."
  ],
  "formats": [
    {
      "name": "stylish",
      "output": "console"
    },
    ...((shouldOutputJunit ? [{
      "name": "junit",
      "output": "file",
      "path": junitReportPath,
      "id": "junit"
    }
    ] : []))
  ]
};
