const baseUrl = window.location.href.split("/").slice(0, 3).join("/");
const advancedUrl = baseUrl + "/menu";

// Check if the table information is stored in local storage
window.onload = function () {
  if (!localStorage.getItem("table")) {
    window.location.href = baseUrl + "/table";
  }

  const clockElement = document.querySelector("#clock");
  const initialTime = clockElement.textContent.trim(); // Get the time from the HTML
  const totalTimeInSeconds = parseTimeString(initialTime); // Convert "HH:MM:SS" to seconds

  const remainingTime = localStorage.getItem("remainingTime");

  if (remainingTime) {
    startCountdown(parseInt(remainingTime, 10), clockElement);
  } else {
    startCountdown(totalTimeInSeconds, clockElement);
  }
};

const dietaryPreferences = {
  vegan: "fas fa-leaf",
  vegetarian: "fas fa-leaf",
  glutenFree: "fas fa-gluten-free",
  nutFree: "fas fa-peanut",
  dairyFree: "fas fa-milk-alt",
  soyFree: "fas fa-soybean",
  eggFree: "fas fa-egg",
  lowCarb: "fas fa-bread-slice",
  paleo: "fas fa-carrot",
  keto: "fas fa-cheese",
};

const menuItems = [
  {
    image: "pizza.jpg",
    label: "Margherita Pizza",
    description: "Classic pizza with tomatoes, mozzarella, and basil.",
    category: "Main",
    price: 12.99,
    allergies: [dietaryPreferences.glutenFree],
  },
  {
    image: "burger.jpg",
    label: "Cheeseburger",
    description: "Juicy beef patty with cheddar cheese and pickles.",
    category: "Main",
    price: 9.99,
    allergies: [dietaryPreferences.dairyFree, dietaryPreferences.glutenFree],
  },
  {
    image: "salad.jpg",
    label: "Caesar Salad",
    description: "Crisp romaine lettuce with Caesar dressing and croutons.",
    category: "Salads",
    price: 7.99,
    allergies: [dietaryPreferences.glutenFree, dietaryPreferences.dairyFree],
  },
  {
    image: "soda.jpg",
    label: "Cola",
    description: "Classic fizzy cola drink.",
    category: "Drinks",
    price: 1.99,
    allergies: [],
  },
  {
    image: "taco.jpg",
    label: "Fish Taco",
    description: "Tacos filled with grilled fish and fresh salsa.",
    category: "Main",
    price: 11.99,
    allergies: [dietaryPreferences.glutenFree, dietaryPreferences.dairyFree],
  },
];

let basket = []; // Initialize a global basket array
let mainItemCount = 0; // Counter for main items in the basket

document.addEventListener("DOMContentLoaded", () => {
  createMenuGrid(); // Populate the grid with all items initially
  filterMenu("All"); // Show all items initially
});

function showRecipt(self) {
  const receiptElement = document.querySelector("#recipt");
  if (receiptElement.style.display === "block") {
    receiptElement.style.display = "none";
  } else {
    receiptElement.style.display = "block";
  }
}

// Function to create the initial menu grid
function createMenuGrid() {
  const contentDiv = document.querySelector(".content");
  menuItems.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("menu-item");
    itemDiv.classList.add(item.category.toLowerCase());

    // Create HTML structure with FontAwesome icons for allergies
    itemDiv.innerHTML = `
      <div class="image">
        <img src="../images/items/${item.image}" alt="${item.label}" />
      </div>
      <h3>${item.label}</h3>
      <p>${item.description}</p>
      <div class="allergies">
        ${item.allergies
          .map((iconClass) => `<i class="${iconClass}"></i>`)
          .join(" ")}
      </div>
      <div class="btn_container">
        <button onclick="order('${item.label}', ${item.price}, '${
      item.category
    }')">Order €${item.price}</button>
      </div>
    `;

    contentDiv.appendChild(itemDiv);
  });
}

// Function to render the receipt from the basket
// Function to render the receipt from the basket
function updateReceipt() {
  const receiptElement = document.querySelector("#recipt");
  receiptElement.innerHTML = ""; // Clear existing items

  if (basket.length === 0) {
    receiptElement.innerHTML = "<h4>Your basket is empty.</h4>";
    return;
  } else {
    receiptElement.innerHTML = `<h4>Tapas Basket ${mainItemCount}/5</h4>`;
  }

  let total = 0;
  basket.forEach((item, index) => {
    total += item.price * item.quantity; // Update total calculation

    const itemDiv = document.createElement("div");
    itemDiv.classList.add("receipt-item");
    itemDiv.onclick = () => removeFromBasket(index);

    itemDiv.innerHTML = `
      <p>${item.quantity}x ${item.label} <span>€${(
      item.price * item.quantity
    ).toFixed(2)}</span></p>
    `;

    receiptElement.appendChild(itemDiv);
  });

  // Add total amount to the receipt
  const totalDiv = document.createElement("div");
  totalDiv.classList.add("receipt-total");
  totalDiv.innerHTML = `<p><strong>Total:</strong> €${total.toFixed(2)}</p>`;
  receiptElement.appendChild(totalDiv);

  // Create and add "Place Order" button
  const placeOrderButton = document.createElement("button");
  placeOrderButton.textContent = "Place Order";
  placeOrderButton.classList.add("place-order-btn");
  placeOrderButton.onclick = placeOrder; // Call placeOrder function on click
  receiptElement.appendChild(placeOrderButton);
}

// Function to handle placing the order
function placeOrder() {
  if (basket.length === 0) {
    alert("Your basket is empty. Add items to order.");
    return;
  }

  // Here you can implement the functionality to process the order
  // For demonstration, we'll just log the basket to the console
  console.log("Order placed:", basket);

  // here should a server req be made to store the order

  basket = [];
  mainItemCount = 0;
  updateReceipt();
}

// Function to order food
function order(label, price, category) {
  const existingItem = basket.find((item) => item.label === label);

  if (existingItem) {
    // If the item is already in the basket, increase its quantity
    existingItem.quantity++;
  } else {
    // Check if the item is a main course and if the limit has been reached
    if (category === "Main" && mainItemCount >= 5) {
      alert("You can only order a maximum of 5 main courses.");
      return; // Exit the function to prevent adding more
    }

    // If it's a new item, add it to the basket with quantity 1
    basket.push({ label, price, category, quantity: 1 });

    // Increment main item count if the category is 'Main'
    if (category === "Main") {
      mainItemCount++;
    }
  }

  alert(`${label} has been added to your basket!`);
  updateReceipt(); // Update the receipt whenever an item is added
}

// Function to remove an item from the basket by index
function removeFromBasket(index) {
  const removedItem = basket[index];
  removedItem.quantity--; // Decrease the quantity

  if (removedItem.quantity <= 0) {
    // If quantity is zero, check if it's a main item to decrement the counter
    if (removedItem.category === "Main") {
      mainItemCount--;
    }
    basket.splice(index, 1); // Remove the item if quantity is zero
  }
  updateReceipt(); // Update the receipt after removal
}

// Function to handle dropdown menu
function dropDown(element) {
  const allDropdowns = document.querySelectorAll(".dropdown-content");

  // Close all dropdowns except the one clicked
  allDropdowns.forEach((dropdown) => {
    if (dropdown !== element.querySelector(".dropdown-content")) {
      dropdown.style.display = "none";
    }
  });

  const dropdownContent = element.querySelector(".dropdown-content");
  if (dropdownContent) {
    dropdownContent.style.display =
      dropdownContent.style.display === "block" ? "none" : "block";
  }
}

// Filter menu items based on the selected category
function filterMenu(category) {
  const contentDiv = document.querySelector(".content");
  contentDiv.innerHTML = ""; // Clear existing items

  const filteredItems =
    category === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === category);

  filteredItems.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("menu-item");
    itemDiv.classList.add(item.category.toLowerCase());

    // Create HTML structure with FontAwesome icons for allergies
    itemDiv.innerHTML = `
      <div class="image">
        <img src="../images/items/${item.image}" alt="${item.label}" />
      </div>
      <h3>${item.label}</h3>
      <p>${item.description}</p>
      <div class="allergies">
        ${item.allergies
          .map((iconClass) => `<i class="${iconClass}"></i>`)
          .join(" ")}
      </div>
      <div class="btn_container">
        <button onclick="order('${item.label}', ${item.price}, '${
      item.category
    }')">Order €${item.price}</button>
      </div>
    `;

    contentDiv.appendChild(itemDiv);
  });
}

// Function to filter menu by dietary preferences
function filterMenuByDietaryPreferences(allergies) {
  const contentDiv = document.querySelector(".content");
  contentDiv.innerHTML = ""; // Clear existing items

  const filteredItems = menuItems.filter(
    (item) => !item.allergies.some((allergy) => allergies.includes(allergy))
  );

  filteredItems.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("menu-item");
    itemDiv.classList.add(item.category.toLowerCase());

    // Create HTML structure with FontAwesome icons for allergies
    itemDiv.innerHTML = `
      <div class="image">
        <img src="../images/items/${item.image}" alt="${item.label}" />
      </div>
      <h3>${item.label}</h3>
      <p>${item.description}</p>
      <div class="allergies">
        ${item.allergies
          .map((iconClass) => `<i class="${iconClass}"></i>`)
          .join(" ")}
      </div>
      <div class="btn_container">
        <button onclick="order('${item.label}', ${item.price}, '${
      item.category
    }')">Order €${item.price}</button>
      </div>
    `;

    contentDiv.appendChild(itemDiv);
  });
}

// Function to parse the time string in the format "HH:MM:SS"
function parseTimeString(timeString) {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

// Function to start the countdown timer
function startCountdown(seconds, clockElement) {
  const countdownInterval = setInterval(() => {
    seconds--;

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    clockElement.textContent = `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;

    localStorage.setItem("remainingTime", seconds); // Store remaining time in local storage

    if (seconds <= 0) {
      clearInterval(countdownInterval);
      // Redirect to the payment page after the countdown ends
      window.location.href = advancedUrl + "/pay";
    }
  }, 1000);
}

// Function to pad numbers to two digits
function pad(number) {
  return String(number).padStart(2, "0");
}
