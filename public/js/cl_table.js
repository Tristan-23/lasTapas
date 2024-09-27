const baseUrl = window.location.href.split("/").slice(0, 3).join("/");
const advancedUrl = baseUrl + "/table";

function startSession() {
  window.location.href = baseUrl + "/menu";
}
