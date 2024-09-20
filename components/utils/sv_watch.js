require("dotenv").config();
const path = require("path");
const livereload = require("livereload");
const chokidar = require("chokidar");

// Displays the files/folders that are being watched
const paths = [
  path.join(__dirname, "../../public"),
  // path.join(__dirname, "../sv_node.js"), // recommand using --watch form NodeJS for main file!
];
console.log("Watching the following paths:");
paths.forEach((p) => console.log(` - ${p}`));

// Refresh the browser on file changes
const server = livereload.createServer();
server.watch(paths);

// Log file changes to the console
const watcher = chokidar.watch(paths, {
  persistent: true,
});
watcher.on("change", (filePath) => {
  if (process.env.DEVELOPMENT_PRINT === "true") {
    console.log(`File ${filePath} has been changed`);
  }
  server.refresh(filePath);
});
