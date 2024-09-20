const element = document.querySelector(".forum");
const header = element.querySelector("h1");
const input = element.querySelector("#re-password");

// Just visual effects
function switchForum() {
  if (element.classList.contains("register")) {
    element.classList.remove("register");
    void element.offsetWidth;
    element.classList.add("login");

    header.innerHTML = "Please LOGIN";
    input.style.visibility = "hidden";
    input.querySelector("input").value = "";
  } else {
    element.classList.remove("login");
    void element.offsetWidth;
    element.classList.add("register");

    header.innerHTML = "Please REGISTER";
    input.style.visibility = "visible";
  }
}

function clickCRUD(self) {
  const server = self.id;
  const method = server === "update" ? "PATCH" : "POST";
  const table = prompt("Please enter the table name:");
  let data;
  let change;

  let addMoreData = true;
  while (addMoreData) {
    let column = prompt(`Which column would you like to ${server}?`);
    let modify = prompt(`What data should be in the column '${column}'?`);
    if (!column || !modify) {
      if (server === "fetch") {
        data = {};
      } else {
        alert("Please fill in all fields.");
        return;
      }
    } else {
      data[column] = modify;
    }
    addMoreData = confirm("Would you like to add more data? ");
  }

  if (server === "update") {
    let addMoreChange = true;
    while (addMoreChange) {
      let column = prompt("On which column do you want to search?");
      let modify = prompt(`What is the data inside the column '${column}'?`);
      if (!column || !modify) {
        alert("Please fill in all fields.");
        return;
      }
      change[column] = modify;
      addMoreChange = confirm("Would you like to search on more columns?");
    }
  }

  console.log("Table:", table);
  console.log("Data:", data);
  console.log("Change:", change);

  makeServerRequest(server, method, table, data, change).then((data) => {
    if (data.type === "ERROR") {
      console.error("Error fetching data:", data.msg);
      return;
    } else {
      console.log(data);
    }
  });
}

function submitForm() {
  const username = element.querySelector("#username input");
  const password = element.querySelector("#password input");
  const re_password = input.querySelector("input");

  if (re_password.value !== "" && header.innerHTML === "Please REGISTER") {
    if (password.value !== re_password.value) {
      alert("Passwords do not match.");
      return;
    }

    const server = "insert";
    const method = server === "update" ? "PATCH" : "POST";
    const table = "users";
    const data = {
      email: username.value,
      secret_password: password.value,
    };
    const change = {};

    makeServerRequest(server, method, table, data, change).then((data) => {
      if (data.type === "ERROR") {
        console.log("Duplicate entry for email");
        return;
      } else {
        data.forEach((item) => {
          console.log("Registration was a succes with id " + item.id);
        });
      }
    });
  } else if (
    username.value !== "" &&
    password.value !== "" &&
    header.innerHTML === "Please LOGIN"
  ) {
    const server = "fetch";
    const method = server === "update" ? "PATCH" : "POST";
    const table = "users";
    const data = {
      email: username.value,
      secret_password: password.value,
    };
    const change = {};

    makeServerRequest(server, method, table, data, change).then((data) => {
      if (data.type === "ERROR") {
        console.log("This email isn't registered yet");
        return;
      } else {
        data.forEach((item) => {
          if (item.secret_password) {
            console.log("Login was a success");
          } else {
            console.log("Invalid password");
          }
        });
      }
    });
  } else {
    alert("Please fill in all fields.");
  }
}
