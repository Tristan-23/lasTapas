require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const livereload = require("connect-livereload");

const app = express();
const colors = {
  bad: "\x1b[31m", // red
  good: "\x1b[32m", // green
  sender: "\x1b[36m", // cyan
  default: "\x1b[37m", // white
};

const envFilePath = path.join(__dirname, "..", ".env");
const backupFilePath = path.join(__dirname, "..", "bkp.env");

if (!fs.existsSync(envFilePath)) {
  console.log(colors.bad + `↓ ENV has not been located ↓`);
  console.log(colors.default + "Please run this command : `npm run env`");
  process.exit(1);
} else {
  if (process.env.DEVELOPMENT_PRINT === "true") {
    console.log(
      colors.sender + `[${process.env.DEVELOPMENT_SENDER}]`,
      colors.good,
      `ENV file has been located : ` + colors.default,
      envFilePath,
      colors.default
    );
  }

  const overwrite = false;
  if (!fs.existsSync(backupFilePath)) {
    fs.copyFileSync(envFilePath, backupFilePath);
    if (process.env.DEVELOPMENT_PRINT === "true") {
      console.log(
        colors.sender + `[${process.env.DEVELOPMENT_SENDER}]`,
        colors.good,
        `Backup created: ` + colors.default,
        backupFilePath,
        colors.default
      );
    }
  } else if (overwrite) {
    fs.copyFileSync(envFilePath, backupFilePath);
    if (process.env.DEVELOPMENT_PRINT === "true") {
      console.log(
        colors.sender + `[${process.env.DEVELOPMENT_SENDER}]`,
        colors.good,
        `This backup was overwritten : ` + colors.default,
        backupFilePath,
        colors.default
      );
    }
  }
}

const allowedOrigins = [
  `${process.env.WEBSITE_URL}${
    process.env.WEBSITE_PORT === "80" ? "" : `:${process.env.WEBSITE_PORT}`
  }`,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (origin && process.env.DEVELOPMENT_PRINT === "true") {
        console.log("Request origin:", origin);
        console.log("Allowed origins:", allowedOrigins);
      }
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(livereload());

app.listen(process.env.WEBSITE_PORT, () => {
  if (process.env.DEVELOPMENT_PRINT === "true") {
    console.log(
      colors.sender + `[${process.env.DEVELOPMENT_SENDER}]`,
      colors.good,
      `Website has started : ` +
        `\x1b[4m${process.env.WEBSITE_URL}:${process.env.WEBSITE_PORT}\x1b[24m`,
      colors.default
    );
  }
});

process.on("SIGINT", () => {
  if (process.env.DEVELOPMENT_PRINT === "true") {
    console.log(
      colors.sender + `[${process.env.DEVELOPMENT_SENDER}]`,
      colors.bad,
      `Website has stopped : ` +
        `\x1b[9m${process.env.WEBSITE_URL}:${process.env.WEBSITE_PORT}\x1b[29m`,
      colors.default
    );
  }
  process.exit();
});

const routesPath = path.join(__dirname, "..", "routes");
const databasePath = require("./sv_mysql.js");

fs.readdirSync(routesPath).forEach((file) => {
  const routePath = path.join(routesPath, file);
  const route = require(routePath);

  if (file.startsWith("sv_") && file.endsWith(".js")) {
    let label = file.replace(/^sv_|\.js$/g, "");

    if (label !== "index") {
      label = label.split("-").join("/");
      app.use(`/${label}`, route(file, databasePath));
    } else {
      app.use(`/`, route(file, databasePath));
    }
  }
});

const CRUD = require("../components/models/sv_crud.js");

app.use("/insert", (req, res) => {
  CRUD.handleInsert(req, res, databasePath);
});

app.use("/update", (req, res) => {
  CRUD.handleUpdate(req, res, databasePath);
});

app.use("/delete", (req, res) => {
  CRUD.handleDelete(req, res, databasePath);
});

app.use("/fetch", (req, res) => {
  CRUD.handleFetch(req, res, databasePath);
});
