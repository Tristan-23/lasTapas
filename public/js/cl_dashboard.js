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
      case "section3":
        functionForSection3();
        break;
      default:
        console.warn("Error: No specific function defined for this section");
    }

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

function fetchAllTables() {}

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
            <td><input type="text" value="${
              item.tag_labels
            }" placeholder="Tags (comma-separated)" disabled /></td>
            <td>${
              item.image
                ? `<img src="${item.image}" alt="${item.name}" style="max-width: 100px;" />`
                : "No Image"
            }</td>
            <td>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </td>
          `;
          menuItemsTable.appendChild(newRow);

          const deleteBtn = newRow.querySelector(".delete-btn");
          deleteBtn.addEventListener("click", function () {
            makeServerRequest("delete", "menu_items", { id: item.id }, {}).then(
              (data) => {
                if (data.type === "ERROR") {
                  console.error("Error deleting data:", data.msg);
                  return;
                } else {
                  populateMenu();
                }
              }
            );
          });

          const editBtn = newRow.querySelector(".edit-btn");
          editBtn.addEventListener("click", function () {
            const inputs = newRow.querySelectorAll("input");
            const isEditing = editBtn.textContent === "Save";

            inputs.forEach((input) => {
              input.disabled = isEditing;
            });
            editBtn.textContent = isEditing ? "Edit" : "Save";

            if (isEditing) {
              makeServerRequest(
                "update",
                "menu_items",
                { id: item.id },
                {
                  name: inputs[0].value,
                  price: parseFloat(inputs[1].value),
                  tags: inputs[2].value,
                }
              ).then((data) => {
                if (data.type === "ERROR") {
                  console.error("Error updating data:", data.msg);
                  return;
                } else {
                  populateMenu();
                }
              });
            }
          });

          const tagsInput = newRow.querySelector(
            'input[type="text"][placeholder="Tags (comma-separated)"]'
          );
          tagsInput.addEventListener("focus", function () {
            const dietaryForm = document.getElementById("dietary-form");
            dietaryForm.innerHTML = ""; // Clear previous entries

            makeServerRequest("fetch", "menu_tags", {}).then((data) => {
              if (data.type === "ERROR") {
                console.error("Error fetching tags:", data.msg);
                return;
              } else {
                const selectedTags = item.tag_labels
                  .split(",")
                  .map((tag) => tag.trim());

                data.forEach((tag) => {
                  const label = document.createElement("label");
                  const checkbox = document.createElement("input");
                  checkbox.type = "checkbox";
                  checkbox.value = tag.id;

                  checkbox.checked = selectedTags.includes(tag.label);

                  label.appendChild(checkbox);
                  label.appendChild(document.createTextNode(tag.label));

                  dietaryForm.appendChild(label);
                });
              }
            });

            // Show the popup
            document.getElementById("pop-up").style.display = "block";
            document.getElementById("pop-up").dataset.itemId = item.id;
          });

          // End off buttons
        });
      }
    });
  }

  populateMenu();

  document.getElementById("close-popup").addEventListener("click", () => {
    document.getElementById("pop-up").style.display = "none";
  });

  document.getElementById("pop-up").addEventListener("submit", (event) => {
    event.preventDefault();
    console.log("Form submitted");
  });
}
