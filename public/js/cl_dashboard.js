// Check for localstorage
document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("user")) {
    window.location.href = baseUrl;
  } else {
    const element = document.querySelector("[data-welcome]");
    const newText =
      element.innerHTML + " " + JSON.parse(localStorage.getItem("user")).label;
    element.innerHTML = newText;
  }
});

// Handle Navbar
document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item");

  const hideAllSections = () => {
    document.querySelectorAll(".cards").forEach((section) => {
      section.style.display = "none";
    });
  };

  const selectSection = (section) => {
    if (!section) {
      console.warn("Error: No section provided");
      return;
    }

    hideAllSections();

    console.log(section);
    switch (section) {
      case ".all":
        fetchAllTables();
        break;
      case ".menu":
        initializeMenu();
        break;
      case ".settings":
        initializeSettings();
        break;
      default:
        console.warn("Error: No specific function defined for this section");
    }

    // Handle routing
    if (section.includes("/")) {
      window.location.href = baseUrl + section;
    } else if (section.includes(".")) {
      const target = section.substring(1);
      const targetSection = document.querySelector(
        `.cards[data-section="${target}"]`
      );

      if (targetSection) {
        targetSection.style.display = "block";
      } else {
        console.warn(`Error: Section "${target}" does not exist`);
      }
    } else {
      console.warn("Error: Invalid section specified");
    }
  };

  const toggleSubmenu = (item) => {
    const submenu = item.querySelector(".submenu");
    if (submenu) {
      submenu.classList.toggle("active");
      const isVisible = submenu.classList.contains("active");
      submenu.style.display = isVisible ? "block" : "none";
    }
  };

  navItems.forEach((item) => {
    item.addEventListener("click", (event) => {
      event.stopPropagation();

      const hasSubmenu = item.querySelector(".submenu") !== null;

      if (hasSubmenu) {
        toggleSubmenu(item);
      } else {
        navItems.forEach((nav) => nav.classList.remove("active"));
        item.classList.add("active");

        const section = item.dataset.section;
        selectSection(section);
      }
    });

    const submenuItems = item.querySelectorAll(".submenu-item");
    submenuItems.forEach((submenuItem) => {
      submenuItem.addEventListener("click", (event) => {
        event.stopPropagation();
        const targetSection = submenuItem.dataset.section;
        selectSection(targetSection);
      });
    });
  });
});

// Fetch all tables function
function fetchAllTables() {
  // Implementation here
}

let checklistModified = false;
function initializeMenu() {
  function populateMenu() {
    makeServerRequest("fetch", "menu_view", {}).then((data) => {
      const menuItemsTable = document.getElementById("menu-items");
      menuItemsTable.innerHTML = "";

      if (data.type === "ERROR") {
        console.error("Error fetching data:", data.msg);
        return;
      } else {
        data.forEach((item) => {
          const newRow = document.createElement("tr");
          newRow.classList.add("menu-item-row");

          newRow.innerHTML = `
            <td>${item.menu_item_id}</td>
            <td><input type="text" value="${
              item.menu_item_name
            }" required disabled /></td>
            <td><input type="number" value="${
              item.menu_item_price
            }" required disabled /></td>
            <td>
              <input onfocus="openChecklist(this)" type="text" value="${
                item.tag_labels
              }" placeholder="Tags (comma-separated)" required disabled />
            </td>
            <td>
              <input onfocus="openImage(this)" type="text" value="${
                item.image ? item.image : "No image found"
              }" placeholder="Image path" required disabled />
            </td>
            <td>
              <button class="edit-btn action-button">Edit</button>
              <button class="delete-btn action-button">Delete</button>
            </td>
          `;

          menuItemsTable.appendChild(newRow);

          const deleteBtn = newRow.querySelector(".delete-btn");
          const editBtn = newRow.querySelector(".edit-btn");

          let originalValues = {
            name: item.menu_item_name,
            price: item.menu_item_price,
            tags: item.tag_labels,
          };

          deleteBtn.addEventListener("click", function () {
            if (deleteBtn.textContent === "Cancel") {
              const inputs = newRow.querySelectorAll("input");
              inputs[0].value = originalValues.name;
              inputs[1].value = originalValues.price;
              inputs[2].value = originalValues.tags;

              inputs.forEach((input) => {
                input.disabled = true;
              });

              editBtn.textContent = "Edit";
              deleteBtn.textContent = "Delete";
            } else {
              makeServerRequest(
                "delete",
                "menu_items",
                { id: item.menu_item_id },
                {}
              ).then((data) => {
                if (data.type === "ERROR") {
                  console.error("Error deleting data:", data.msg);
                  return;
                } else {
                  populateMenu();
                }
              });
            }
          });

          editBtn.addEventListener("click", function () {
            const inputs = newRow.querySelectorAll("input");
            const isEditing = editBtn.textContent === "Save";

            inputs.forEach((input) => {
              input.disabled = isEditing;
            });

            if (isEditing) {
              const itemId = item.menu_item_id;

              if (checklistModified) {
                console.log(checklistModified);
                makeServerRequest("delete", "menu_item_tags", {
                  menu_item_id: itemId,
                }).then((data) => {
                  checklistModified.forEach((tag) => {
                    makeServerRequest("insert", "menu_item_tags", {
                      menu_item_id: itemId,
                      menu_tag_id: tag.id,
                    }).then((data) => {
                      if (data.type === "ERROR") {
                        console.error("Error fetching data:", data.msg);
                        return;
                      }
                    });
                  });
                });
              }

              const updatedData = {
                name: inputs[0].value,
                price: parseFloat(inputs[1].value),
              };

              makeServerRequest(
                "update",
                "menu_items",
                { id: itemId },
                updatedData
              ).then((data) => {
                if (data.type === "ERROR") {
                  console.error("Error updating data:", data.msg);
                  return;
                } else {
                  inputs.forEach((input) => {
                    input.disabled = true;
                  });

                  editBtn.textContent = "Edit";
                  deleteBtn.textContent = "Delete";
                  originalValues = {
                    name: updatedData.name,
                    price: updatedData.price,
                    tags: updatedData.tags,
                  };
                }
              });
            } else {
              editBtn.textContent = "Save";
              deleteBtn.textContent = "Cancel";
            }
          });
        });
      }
    });
  }

  populateMenu();
}

const searchBar = document.getElementById("search-bar");
searchBar.addEventListener("input", function () {
  const searchTerm = searchBar.value.toLowerCase();
  const menuItemsTable = document.getElementById("menu-items");
  const rows = menuItemsTable.querySelectorAll(".menu-item-row");

  rows.forEach((row) => {
    const itemName = row
      .querySelector('input[type="text"]')
      .value.toLowerCase();

    if (itemName.includes(searchTerm)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});

const insertBtn = document.getElementById("add-menu-item-btn");
let currentInsertRow = null;
insertBtn.addEventListener("click", function () {
  const menuItemsTable = document.getElementById("menu-items");

  if (currentInsertRow) {
    menuItemsTable.removeChild(currentInsertRow);
  }

  const newRow = document.createElement("tr");
  newRow.classList.add("menu-item-row");

  newRow.innerHTML = `
    <td>?</td>
    <td><input type="text" required /></td>
    <td><input type="number" required /></td>
    <td>
      <input onfocus="openChecklist(this)" type="text" placeholder="Tags (comma-separated)" required />
    </td>
    <td>
      <input onfocus="openImage(this)" type="text" placeholder="Image path" required />
    </td>
    <td>
      <button class="save-btn action-button">Save</button>
      <button class="delete-btn action-button">Cancel</button>
    </td>
  `;

  menuItemsTable.insertBefore(newRow, menuItemsTable.firstChild);
  currentInsertRow = newRow;

  const saveBtn = newRow.querySelector(".save-btn");
  saveBtn.addEventListener("click", function () {
    const inputs = newRow.querySelectorAll("input");
    const newItem = {
      name: inputs[0].value,
      price: parseFloat(inputs[1].value),
      tags: inputs[2].value,
      image: inputs[3].value,
    };

    if (!newItem.name || isNaN(newItem.price)) {
      alert("Please fill in all required fields correctly.");
      return;
    }

    makeServerRequest("insert", "menu_items", {
      name: newItem.name,
      price: newItem.price,
      image: newItem.image,
    }).then((data) => {
      if (data.type === "ERROR") {
        console.error("Error inserting data:", data.msg);
        return;
      } else {
        const itemId = data[0].id;
        if (checklistModified) {
          makeServerRequest("delete", "menu_item_tags", {
            menu_item_id: itemId,
          }).then((data) => {
            checklistModified.forEach((tag) => {
              makeServerRequest("insert", "menu_item_tags", {
                menu_item_id: itemId,
                menu_tag_id: tag.id,
              }).then((data) => {
                if (data.type === "ERROR") {
                  console.error("Error fetching data:", data.msg);
                  return;
                } else {
                  initializeMenu();
                }
              });
            });
          });
        }
      }
    });
  });

  const cancelBtn = newRow.querySelector(".delete-btn");
  cancelBtn.addEventListener("click", function () {
    menuItemsTable.removeChild(newRow);
    currentInsertRow = null;
  });
});

function openChecklist(self) {
  const popup = document.getElementById("pop-up");
  if (!popup) {
    console.warn("Checklist popup element not found");
    return;
  }

  let activeTags = [];
  const forum = document.getElementById("dietary-form");

  makeServerRequest("fetch", "menu_tags", {}).then((data) => {
    if (data.type === "ERROR") {
      console.error("Error fetching data:", data.msg);
      return;
    } else {
      forum.innerHTML = "";
      popup.style.display = "block";

      data.forEach((item) => {
        if (
          self.value
            .split(",")
            .map((tag) => tag.trim())
            .includes(item.label)
        ) {
          activeTags.push(item.id);
        }

        const newInput = document.createElement("input");
        newInput.type = "checkbox";
        newInput.id = `${item.id}`;
        newInput.value = item.label;
        newInput.checked = activeTags.includes(item.id);

        const newLabel = document.createElement("label");
        newLabel.htmlFor = `${item.id}`;
        newLabel.textContent = item.label;

        forum.appendChild(newInput);
        forum.appendChild(newLabel);
      });
    }
  });

  const closeBtn = document.getElementById("close-dietary");
  closeBtn.addEventListener("click", function () {
    checklistModified = false;
  });

  const submitBtn = document.getElementById("submit-dietary");
  submitBtn.addEventListener("click", function () {
    const checkedItems = Array.from(
      forum.querySelectorAll('input[type="checkbox"]:checked')
    ).map((checkbox) => ({
      id: checkbox.id,
      value: checkbox.value,
    }));

    const tagsString = checkedItems.map((item) => item.value).join(", ");
    self.value = tagsString;
    checklistModified = checkedItems;
  });
}

const closeBtn = document.getElementById("close-dietary");
closeBtn.addEventListener("click", function () {
  const popup = document.getElementById("pop-up");
  popup.style.display = "none";
});

const submitBtn = document.getElementById("submit-dietary");
submitBtn.addEventListener("click", function () {
  const popup = document.getElementById("pop-up");
  popup.style.display = "none";
});

function openImage(self) {
  const popup = document.getElementById("pop-up");
  if (!popup) {
    console.warn("Image popup element not found");
    return;
  }

  const forum = document.getElementById("dietary-form");

  forum.innerHTML = "";
  popup.style.display = "block";

  const imageContainer = document.createElement("div");
  imageContainer.style.width = "300px";
  imageContainer.style.aspectRatio = "1/0.5";
  imageContainer.style.backgroundColor = "lightgrey";

  forum.appendChild(imageContainer);

  if (self.value !== "No image found") {
    const imagePath = self.value;

    const imageElement = document.createElement("img");
    imageElement.src = imagePath;
    imageElement.alt = "Image preview";
    imageElement.style.width = "100%";
    imageElement.style.height = "100%";

    imageContainer.appendChild(imageElement);
  }

  const imageInput = document.createElement("input");
  imageInput.type = "file";
  imageInput.accept = "image/*";
  imageInput.onchange = (event) => handleImageUpload(event, self);
  imageInput.style.position = "absolute";
  imageInput.style.top = "50%";
  imageInput.style.left = "50%";
  imageInput.style.transform = "translate(-50%, -50%)";
  imageInput.style.width = "40%";
  imageInput.style.opacity = "0.7";
  imageInput.style.zIndex = "10";

  imageContainer.appendChild(imageInput);

  function handleImageUpload(event, self) {}
}

function initializeSettings() {
  document
    .getElementById("add-user-btn")
    .addEventListener("click", function () {
      const email = prompt("Please enter a username:");
      const password = prompt("Please enter a password:");
      const confirmPassword = prompt("Please confirm the password:");
      if (!email || !password || !confirmPassword) {
        alert("Please fill in all required fields.");
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      const passwordStrengthRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordStrengthRegex.test(password)) {
        alert(
          "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
        );
        return;
      }

      makeServerRequest("insert", "workers", {
        username: email,
        secret_password: password,
      }).then((data) => {
        if (data.type === "ERROR") {
          console.error("Error logging in:", data.msg);
          return;
        } else {
          console.log("User added successfully");
        }
      });
    });

  document
    .getElementById("manage-users-btn")
    .addEventListener("click", function () {});
}
