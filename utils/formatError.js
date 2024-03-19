const formatError = (err) => {
  // also display call stack (without node_modules)
  const filteredStack = err.stack
    .split("\n")
    .filter((frame) => !frame.includes("node:internal"))
    .join("\n");
  console.log(filteredStack);
};

module.exports = formatError;
