const fs = require("fs");
const path = require("path");
const recast = require("recast");

// CPD-OFF
const LIFECYCLE_HOOKS = new Set([
  "constructor",
  "connectedCallback",
  "disconnectedCallback",
  "render",
  "renderedCallback",
  "errorCallback"
]);

function getElementCategory(node) {
  const decorators = (node.decorators || []).map(
    (d) =>
      d.expression.name || (d.expression.callee && d.expression.callee.name)
  );

  const isApi = decorators.includes("api") || node._inheritedApi;
  const isTrack = decorators.includes("track");
  const isWire = decorators.includes("wire") || node._inheritedWire;

  const isProperty =
    node.type === "ClassProperty" || node.type === "ClassPrivateProperty";
  const isMethod =
    node.type === "ClassMethod" || node.type === "ClassPrivateMethod";
  const isArrowFunctionProp =
    isProperty &&
    node.value &&
    (node.value.type === "ArrowFunctionExpression" ||
      node.value.type === "FunctionExpression");

  const isGetter = node.kind === "get";
  const isSetter = node.kind === "set";

  let name = "";
  if (node.key) {
    name = node.key.name || node.key.value;
    if (node.key.type === "PrivateName") name = "#" + node.key.id.name;
  }

  const isLifecycle = isMethod && LIFECYCLE_HOOKS.has(name);

  if (isApi) {
    if (isGetter || isSetter) return { type: "api_gs", name, kind: node.kind };
    if (isMethod) return { type: "api_method", name, kind: "method" };
    return {
      type: "api_prop",
      name,
      kind: "prop",
      subtype: isMethod ? "method" : "property"
    };
  }

  if (isTrack) {
    return { type: "track_prop", name, kind: "prop" };
  }

  if (isWire) {
    if (isMethod) return { type: "wire_method", name, kind: "method" };
    return { type: "wire_prop", name, kind: "prop" };
  }

  if (isGetter || isSetter) {
    return { type: "private_gs", name, kind: node.kind };
  }

  if (isLifecycle) {
    return { type: "lifecycle", name, kind: "method" };
  }

  if (isArrowFunctionProp) {
    return { type: "private_method", subtype: "arrow", name, kind: "method" };
  }

  if (isMethod) {
    return { type: "private_method", subtype: "normal", name, kind: "method" };
  }

  if (isProperty) {
    return { type: "private_prop", name, kind: "prop" };
  }

  return { type: "unknown", name, kind: "unknown" };
}

const ORDER = {
  api_prop: 1,
  track_prop: 2,
  private_prop: 3,
  api_gs: 4,
  wire_prop: 5,
  wire_method: 6,
  private_gs: 7,
  private_method: 8,
  lifecycle: 9
};

function getTopLevelCategory(node) {
  if (node.type === "ImportDeclaration") {
    return { type: "import", name: node.source.value.toLowerCase() };
  }

  // Unwrap ExportNamedDeclaration if it contains a declaration (Variable or Function)
  let actualNode = node;
  if (node.type === "ExportNamedDeclaration" && node.declaration) {
    if (node.declaration.type === "ClassDeclaration") {
      return { type: "class", name: "" };
    }
    actualNode = node.declaration;
  }

  if (actualNode.type === "VariableDeclaration") {
    const isConst = actualNode.kind === "const";
    const dec = actualNode.declarations[0];
    let name = "";
    if (dec && dec.id) {
      if (dec.id.type === "Identifier") name = dec.id.name;
      else if (dec.id.type === "ObjectPattern" && dec.id.properties[0])
        name = dec.id.properties[0].value.name;
      else if (dec.id.type === "ArrayPattern" && dec.id.elements[0])
        name = dec.id.elements[0].name;
    }
    name = (name || "").toLowerCase();

    const isArrowFunction =
      dec &&
      dec.init &&
      (dec.init.type === "ArrowFunctionExpression" ||
        dec.init.type === "FunctionExpression");
    if (isArrowFunction) return { type: "helper", subtype: "arrow", name };
    if (isConst) return { type: "constant", name };
    return { type: "property", name };
  }
  if (actualNode.type === "FunctionDeclaration") {
    return {
      type: "helper",
      subtype: "normal",
      name: (actualNode.id.name || "").toLowerCase()
    };
  }
  if (node.type === "ExportDefaultDeclaration") {
    return { type: "class", name: "" };
  }
  if (node.type === "ExportNamedDeclaration") {
    return { type: "export", name: "" };
  }
  return { type: "unknown", name: "" };
}

const TOP_LEVEL_ORDER = {
  import: 1,
  constant: 2,
  property: 3,
  helper: 4,
  class: 5,
  export: 6,
  unknown: 7
};

function fixFile(filePath) {
  const code = fs.readFileSync(filePath, "utf-8");
  let ast;
  try {
    ast = recast.parse(code, {
      parser: require("recast/parsers/babel")
    });
  } catch (e) {
    console.error(`Error parsing ${filePath}: ${e.message}`);
    return;
  }

  // 1. Sort Top Level
  ast.program.body.forEach((node, index) => {
    node._originalIndex = index;
  });

  ast.program.body.sort((a, b) => {
    const catA = getTopLevelCategory(a);
    const catB = getTopLevelCategory(b);

    if (TOP_LEVEL_ORDER[catA.type] !== TOP_LEVEL_ORDER[catB.type]) {
      return TOP_LEVEL_ORDER[catA.type] - TOP_LEVEL_ORDER[catB.type];
    }

    if (catA.type === "helper") {
      if (catA.subtype !== catB.subtype) {
        return catA.subtype === "arrow" ? -1 : 1;
      }
    }

    if (catA.type === "import") {
      if (catA.name < catB.name) return -1;
      if (catA.name > catB.name) return 1;
      return 0;
    }

    // Preserve original order for constants, properties, helpers, etc. within the same subtype
    return a._originalIndex - b._originalIndex;
  });

  // 2. Sort Class Body
  recast.visit(ast, {
    visitClassDeclaration(path) {
      this.traverse(path);
      const body = path.node.body.body;

      // Pre-pass: propagate decorators between getter/setter pairs
      const gsPairs = {};
      body.forEach((node) => {
        if (node.kind === "get" || node.kind === "set") {
          const name = node.key.name || node.key.value;
          if (!gsPairs[name]) gsPairs[name] = [];
          gsPairs[name].push(node);
        }
      });
      Object.values(gsPairs).forEach((pair) => {
        if (pair.length > 1) {
          const hasApi = pair.some((n) =>
            (n.decorators || []).some(
              (d) =>
                d.expression.name === "api" ||
                (d.expression.callee && d.expression.callee.name === "api")
            )
          );
          const hasWire = pair.some((n) =>
            (n.decorators || []).some(
              (d) =>
                d.expression.name === "wire" ||
                (d.expression.callee && d.expression.callee.name === "wire")
            )
          );
          pair.forEach((n) => {
            if (
              hasApi &&
              !(n.decorators || []).some((d) => d.expression.name === "api")
            ) {
              n._inheritedApi = true;
            }
            if (
              hasWire &&
              !(n.decorators || []).some((d) => d.expression.name === "wire")
            ) {
              n._inheritedWire = true;
            }
          });
        }
      });

      body.sort((a, b) => {
        const catA = getElementCategory(a);
        const catB = getElementCategory(b);

        const phaseA = ORDER[catA.type] || 99;
        const phaseB = ORDER[catB.type] || 99;

        if (phaseA !== phaseB) {
          return phaseA - phaseB;
        }

        if (catA.type === "api_gs" || catA.type === "private_gs") {
          if (catA.name !== catB.name) {
            return catA.name
              .toLowerCase()
              .localeCompare(catB.name.toLowerCase());
          }
          return 0;
        }

        if (catA.type === "private_method") {
          if (catA.subtype !== catB.subtype) {
            return catA.subtype === "arrow" ? -1 : 1;
          }
        }

        if (catA.name && catB.name) {
          return catA.name.toLowerCase().localeCompare(catB.name.toLowerCase());
        }
        return 0;
      });
    }
  });

  // Print using Recast to preserve lines/whitespace
  const output = recast.print(ast).code;

  if (output !== code) {
    fs.writeFileSync(filePath, output, "utf-8");
    console.log(`Fixed ${filePath}`);
  }
}

function findJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !file.includes("node_modules")) {
      findJsFiles(fullPath, fileList);
    } else if (
      file.endsWith(".js") &&
      fullPath.includes("lwc") &&
      !fullPath.includes("validate-lwc.js") &&
      !fullPath.includes("fix-lwc.js") &&
      !fullPath.includes("__tests__") &&
      !fullPath.includes("__mocks__")
    ) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const args = process.argv.slice(2);
const targetArgs = args.length > 0 ? args : ["."];
const files = [];
for (const arg of targetArgs) {
  const stat = fs.statSync(arg);
  const fullPath = path.resolve(arg);
  if (stat.isDirectory()) {
    files.push(...findJsFiles(arg));
  } else if (
    stat.isFile() &&
    arg.endsWith(".js") &&
    !fullPath.includes("__tests__") &&
    !fullPath.includes("__mocks__")
  ) {
    files.push(arg);
  }
}

if (files.length > 0) {
  console.log("Found " + files.length + " files. Fixing...");
  files.forEach(fixFile);
} else {
  console.log("No files to fix.");
}
// CPD-ON
