const cp = require("child_process");
const fs = require("fs");
const path = require("path");

describe("validate-lwc.js script", () => {
  // Put temp dir outside __tests__ to bypass script's exclusion rules
  const testDir = path.join(__dirname, "..", ".tmp_validate_test");

  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it("should validate a correct lwc file successfully", () => {
    const filePath = path.join(testDir, "correct.js");
    fs.writeFileSync(
      filePath,
      `import { LightningElement } from 'lwc';

export default class Correct extends LightningElement {
  @api recordId;
  connectedCallback() {}
}`
    );

    try {
      const output = cp
        .execSync(`node validate-lwc.js ${filePath}`, { stdio: "pipe" })
        .toString();
      expect(output).toContain("Successfully validated 1 files");
    } catch (error) {
      const out =
        (error.stdout ? error.stdout.toString() : "") +
        (error.stderr ? error.stderr.toString() : "");
      throw new Error(
        "Validation failed unexpectedly: " + out + " " + error.message
      );
    }
  });

  it("should fail validation for an incorrectly ordered file", () => {
    const filePath = path.join(testDir, "incorrect.js");
    // lifecycle before @api property
    fs.writeFileSync(
      filePath,
      `import { LightningElement, api } from 'lwc';

export default class Incorrect extends LightningElement {
  connectedCallback() {}
  @api recordId;
}`
    );

    let errorOutput = "";
    try {
      cp.execSync(`node validate-lwc.js ${filePath}`, { stdio: "pipe" });
      throw new Error("SHOULD_FAIL");
    } catch (error) {
      if (error.message === "SHOULD_FAIL") {
        throw error;
      }
      errorOutput =
        (error.stdout ? error.stdout.toString() : "") +
        (error.stderr ? error.stderr.toString() : "");
    }

    expect(errorOutput).toContain("Incorrect ordering");
    expect(errorOutput).toContain("Validation failed with 1 errors");
  });
});
