const fullUrl = window.location.href;
const standardUrl = fullUrl.split("/").slice(0, 3).join("/");

// // Template
// const server = "create" || "insert" || "update" || "delete";
// const method = server === "update" ? "PATCH" : "POST";
// const table = "collum";
// const data = { row: "value" };
// const change = { row: "value" };

// // Example;
// const server = "fetch";
// const method = server === "update" ? "PATCH" : "POST";
// const table = "users";
// const data = {};
// const change = {};

// makeServerRequest(server, method, table, data, change).then((data) => {
//   if (data.type === "ERROR") {
//     console.error("Error fetching data:", data.msg);
//     return;
//   } else {
//     console.log(data);
//   }
// });

function makeServerRequest(server, method, table, data, change) {
  return fetch(`${standardUrl}/${server}`, {
    method: method,
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      table: table,
      data: data,
      change: change,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(({ data }) => {
      return data;
    })
    .catch((error) => {
      console.error(`Error during ${server} operation:`, error);
      throw error;
    });
}
