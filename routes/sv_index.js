const express = require("express");
const path = require("path");

const router = express.Router();
router.use(express.static(path.join(__dirname, "../public")));

module.exports = function (pageName, exportMysql) {
  pageName = pageName.replace("sv_", "").replace(".js", ".html");

  router.get("/test", (req, res) => {
    res.json({ message: "Server is connected to client!" });
  });

  router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, `../public/html/${pageName}`));
  });

  return router;
};
