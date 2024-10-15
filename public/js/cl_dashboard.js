const baseUrl = window.location.href.split("/").slice(0, 3).join("/");
const advancedUrl = baseUrl + "/dashboard";

document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("user")) {
    window.location.href = baseUrl;
  } else {
    const element = document.querySelector("[data-welcome]");
    const newText =
      element.innerHTML + " " + JSON.parse(localStorage.getItem("user")).label;
    element.innerHTML = newText;
  }

  // Dietary preferences array
  const dietaryPreferences = [
    { value: "vegan", label: "Vegan" },
    { value: "vegetarian", label: "Vegetarian" },
    { value: "gluten-free", label: "Gluten-Free" },
    { value: "nut-free", label: "Nut-Free" },
    { value: "keto", label: "Keto" },
    { value: "paleo", label: "Paleo" },
    { value: "dairy-free", label: "Dairy-Free" },
  ];

  // Function to create dietary checkboxes dynamically
  const createDietaryCheckboxes = () => {
    const dietaryForm = document.getElementById("dietary-form");
    dietaryForm.innerHTML = ""; // Clear existing checkboxes

    dietaryPreferences.forEach((preference) => {
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "diet";
      checkbox.value = preference.value;

      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(preference.label));
      dietaryForm.appendChild(label);
      dietaryForm.appendChild(document.createElement("br"));
    });
  };

  createDietaryCheckboxes();

  const navItems = document.querySelectorAll(".nav-item");
  const notificationButton = document.querySelector(".notification-btn");
  const profileButton = document.querySelector(".profile-btn");

  const hideAllSections = () => {
    document.querySelectorAll(".cards").forEach((section) => {
      section.style.display = "none";
    });
  };

  const selectSection = (section) => {
    hideAllSections();
    if (section.includes("/")) {
      window.location.href = baseUrl + section;
    } else if (section.includes(".")) {
      const target = section.substring(1);
      document.querySelector(`.cards[data-section="${target}"]`).style.display =
        "block";
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

  // Menu items array
  const menuItems = [
    {
      id: 1,
      name: "Cheeseburger",
      price: 9.99,
      tags: "Burger, Fast Food",
      image: "",
    },
    {
      id: 2,
      name: "Caesar Salad",
      price: 7.99,
      tags: "Salad, Healthy",
      image: "",
    },
    {
      id: 3,
      name: "Margherita Pizza",
      price: 11.99,
      tags: "Pizza, Italian",
      image: "",
    },
  ];

  // Function to populate the menu table
  const populateMenuTable = () => {
    const menuItemsTable = document.getElementById("menu-items");
    menuItemsTable.innerHTML = ""; // Clear existing rows
    menuItems.forEach((item) => {
      const newRow = document.createElement("tr");
      newRow.classList.add("menu-item-row"); // Add a class for easier targeting
      newRow.innerHTML = `
        <td>${item.id}</td>
        <td><input type="text" value="${item.name}" required disabled /></td>
        <td><input type="number" value="${item.price}" required disabled /></td>
        <td><input type="text" value="${
          item.tags
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

      // Add event listener for the delete button
      const deleteBtn = newRow.querySelector(".delete-btn");
      deleteBtn.addEventListener("click", function () {
        menuItems.splice(menuItems.indexOf(item), 1); // Remove item from array
        populateMenuTable(); // Re-populate the table
      });

      // Add event listener for the edit button
      const editBtn = newRow.querySelector(".edit-btn");
      editBtn.addEventListener("click", function () {
        const inputs = newRow.querySelectorAll("input");
        const isEditing = editBtn.textContent === "Save";

        inputs.forEach((input) => {
          input.disabled = isEditing; // Toggle disabled state
        });
        editBtn.textContent = isEditing ? "Edit" : "Save";

        if (isEditing) {
          // Save changes back to the menuItems array
          item.name = inputs[1].value;
          item.price = parseFloat(inputs[2].value);
          item.tags = inputs[3].value;
          // Handle image upload if necessary
        }
      });

      // Show pop-up on focusing the tags input
      const tagsInput = newRow.querySelector(
        'input[type="text"][placeholder="Tags (comma-separated)"]'
      );
      tagsInput.addEventListener("focus", function () {
        // Show the pop-up and set checked states
        document.getElementById("pop-up").style.display = "block"; // Show the pop-up
        setCheckboxesForItem(item); // Set the checkboxes based on the item's tags
        // Set the active class on the current row
        const allRows = document.querySelectorAll("#menu-items tr");
        allRows.forEach((row) => row.classList.remove("menu-item-row-active")); // Remove active class from all rows
        newRow.classList.add("menu-item-row-active"); // Set the current row as active
      });
    });
  };

  const setCheckboxesForItem = (item) => {
    const checkboxes = document.querySelectorAll(
      '#dietary-form input[type="checkbox"]'
    );
    const tags = item.tags.split(", ").map((tag) => tag.toLowerCase().trim());

    checkboxes.forEach((checkbox) => {
      checkbox.checked = tags.includes(checkbox.value);
    });
  };

  // Function to handle pop-up submission
  const handlePopupSubmission = () => {
    const checkboxes = document.querySelectorAll(
      '#dietary-form input[type="checkbox"]'
    );
    const checkedPreferences = [];

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        checkedPreferences.push(checkbox.value);
      }
    });

    // Update the corresponding menu item tag input with the selected preferences
    const activeRow = document.querySelector(".menu-item-row-active");
    if (activeRow) {
      const tagsInput = activeRow.querySelector(
        'input[placeholder="Tags (comma-separated)"]'
      );
      tagsInput.value = checkedPreferences.join(", "); // Update input value
    }

    document.getElementById("pop-up").style.display = "none"; // Hide the pop-up
  };

  populateMenuTable(); // Populate the menu items table

  navItems.forEach((item) => {
    item.addEventListener("click", (event) => {
      event.stopPropagation();

      const hasSubmenu = item.querySelector(".submenu") !== null;

      if (hasSubmenu) {
        toggleSubmenu(item);
      } else {
        navItems.forEach((nav) => nav.classList.remove("active"));
        item.classList.add("active");

        selectSection(item.dataset.section);
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

  // Close the pop-up when clicking outside of it
  window.addEventListener("click", (event) => {
    const popUp = document.getElementById("pop-up");
    if (event.target === popUp) {
      popUp.style.display = "none"; // Hide the pop-up
    }
  });

  // Close the pop-up on button click
  const closeButton = document.getElementById("close-popup");
  closeButton.addEventListener("click", () => {
    document.getElementById("pop-up").style.display = "none"; // Hide the pop-up
  });

  // Handle pop-up submission
  const submitButton = document.querySelector("#pop-up button[type='submit']");
  submitButton.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent the default form submission
    handlePopupSubmission(); // Handle the pop-up submission
  });
});
