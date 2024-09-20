const baseUrl = "http://127.0.0.1:5000";
const advancedUrl = baseUrl + "/";

const modal = document.getElementById("receipt-modal");
const cardButton = document.querySelector(".card-button");
const closeBtn = document.querySelector(".close-btn");

cardButton.addEventListener("click", () => {
  modal.style.display = "block";
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const hamburgerButton = document.querySelector(".hamburger-button");
  const closeSidebarButton = document.querySelector(".close-sidebar");

  function openSidebar() {
    sidebar.classList.add("open");
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
  }

  hamburgerButton.addEventListener("click", openSidebar);
  closeSidebarButton.addEventListener("click", closeSidebar);

  document.addEventListener("click", function (event) {
    if (
      sidebar.classList.contains("open") &&
      !sidebar.contains(event.target) &&
      !hamburgerButton.contains(event.target)
    ) {
      closeSidebar();
    }
  });
});

document.getElementById("call-ober-btn").addEventListener("click", function () {
  alert("A server is on their way!");
});

document
  .getElementById("call-salt-pepper-btn")
  .addEventListener("click", function () {
    alert("Salt or pepper is being brought to your table.");
  });

document
  .getElementById("call-napkins-btn")
  .addEventListener("click", function () {
    alert("Napkins are on their way!");
  });

window.onload = function () {
  let tijdContainer = document.querySelector(".tijd-container");
  let timeString = tijdContainer.innerText;

  let timeParts = timeString.split(":");
  let hours = parseInt(timeParts[0], 10);
  let minutes = parseInt(timeParts[1], 10);
  let seconds = parseInt(timeParts[2], 10);

  function startTimer() {
    let totalSeconds = hours * 3600 + minutes * 60 + seconds;

    let timerInterval = setInterval(function () {
      totalSeconds--;

      if (totalSeconds < 0) {
        clearInterval(timerInterval);
        window.location.href = baseUrl + "/";
        return;
      }

      let newHours = Math.floor(totalSeconds / 3600);
      let newMinutes = Math.floor((totalSeconds % 3600) / 60);
      let newSeconds = totalSeconds % 60;

      tijdContainer.innerText =
        (newHours < 10 ? "0" : "") +
        newHours +
        ":" +
        (newMinutes < 10 ? "0" : "") +
        newMinutes +
        ":" +
        (newSeconds < 10 ? "0" : "") +
        newSeconds;
    }, 1000);
  }

  startTimer();
};

let receipt = {};
function addToRecipt(item) {
  const itemKey = item.menu_item;

  if (item.menu_category === "Tapas" || item.menu_category === "Drinks") {
    const totalCount = Object.values(receipt)
      .filter(
        (i) => i.menu_category === "Tapas" || i.menu_category === "Drinks"
      )
      .reduce((count, i) => count + i.quantity, 0);

    if (totalCount >= 3) {
      alert(
        "You can only order a maximum of 3 items from Tapas and Drinks combined."
      );
      return;
    }
  }

  if (receipt[itemKey]) {
    receipt[itemKey].quantity += 1;
  } else {
    receipt[itemKey] = { ...item, quantity: 1 };
  }

  updateReceiptDisplay();
}

function removeFromRecipt(key) {
  if (receipt[key]) {
    if (receipt[key].quantity > 1) {
      receipt[key].quantity -= 1;
    } else {
      delete receipt[key];
    }
    updateReceiptDisplay();
  }
}

function updateReceiptDisplay() {
  const receiptContainer = document.querySelector(".receipt-content");
  receiptContainer.innerHTML = "";

  for (const key in receipt) {
    const item = receipt[key];

    const receiptItemDiv = document.createElement("div");
    receiptItemDiv.classList.add("receipt-item");

    const receiptItemText = document.createElement("p");
    receiptItemText.innerText = `${item.quantity}x ${item.menu_item}`;

    const removeButton = document.createElement("button");
    removeButton.innerText = "Remove";
    removeButton.onclick = () => removeFromRecipt(key);

    receiptItemDiv.appendChild(receiptItemText);
    receiptItemDiv.appendChild(removeButton);

    receiptContainer.appendChild(receiptItemDiv);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const tapasButton = document.querySelector(".tapas-button");
  const dessertButton = document.querySelector(".dessert-button");
  const drinksButton = document.querySelector(".drinks-button");
  const contentContainer = document.querySelector(".content-container");

  const buttons = [tapasButton, dessertButton, drinksButton]; // Grouping all buttons

  const server = "fetch";
  const method = server === "update" ? "PATCH" : "POST";
  const table = "menu_details";
  const data = {};
  const change = {};

  let tapasContent = "";
  let dessertContent = "";
  let drinksContent = "";
  makeServerRequest(server, method, table, data, change).then((data) => {
    if (data.type === "ERROR") {
      console.error("Error fetching data:", data.msg);
      return;
    } else {
      data.forEach((item, index) => {
        if (item.menu_category === "Tapas") {
          tapasContent += `
            <div class="placeholder-container">
              <div class="placeholder-boven-container">
                <div class="placeholder-foto-container"></div>
                <div class="placeholder-name-container">${item.menu_item}</div>
                <div class="placeholder-description-container">${item.menu_description}</div>
              </div>
              <div class="placeholder-onder-container">
                <button onclick="addToRecipt({menu_category : '${item.menu_category}',  menu_item: '${item.menu_item}', menu_price: '${item.menu_price}' })" class="placeholder-orderbutton">Bestel hier</button>
              </div>
            </div>
            <!-- Add more Tapas items if necessary -->
          `;
        }
        if (item.menu_category === "Dessert") {
          dessertContent += `
            <div class="placeholder-container">
              <div class="placeholder-boven-container">
                <div class="placeholder-foto-container"></div>
                <div class="placeholder-name-container">${item.menu_item}</div>
                <div class="placeholder-description-container">${item.menu_description}</div>
              </div>
              <div class="placeholder-onder-container">
                <button onclick="addToRecipt({menu_category : '${item.menu_category}',  menu_item: '${item.menu_item}', menu_price: '${item.menu_price}' })" class="placeholder-orderbutton">Bestel hier</button>
              </div>
            </div>
            <!-- Add more Tapas items if necessary -->
          `;
        }
        if (item.menu_category === "Drinks") {
          drinksContent += `
            <div class="placeholder-container">
              <div class="placeholder-boven-container">
                <div class="placeholder-foto-container"></div>
                <div class="placeholder-name-container">${item.menu_item}</div>
                <div class="placeholder-description-container">${item.menu_description}</div>
              </div>
              <div class="placeholder-onder-container">
                 <button onclick="addToRecipt({menu_category : '${item.menu_category}',  menu_item: '${item.menu_item}', menu_price: '${item.menu_price}' })" class="placeholder-orderbutton">€${item.menu_price}</button>
              </div>
            </div>
            <!-- Add more Tapas items if necessary -->
          `;
        }
      });
      switchContent(tapasContent, tapasButton);
    }
  });

  function switchContent(content, activeButton) {
    contentContainer.innerHTML = content;
    buttons.forEach((button) => button.classList.remove("active"));
    activeButton.classList.add("active");
  }

  switchContent(tapasContent, tapasButton);

  tapasButton.addEventListener("click", () =>
    switchContent(tapasContent, tapasButton)
  );

  dessertButton.addEventListener("click", () =>
    switchContent(dessertContent, dessertButton)
  );

  drinksButton.addEventListener("click", () =>
    switchContent(drinksContent, drinksButton)
  );
});

// Fetches form user with the correct email
// const server = "fetch";
// const method = server === "update" ? "PATCH" : "POST";
// const table = "users";
// const data = {};
// const change = {};

// makeServerRequest(server, method, table, data, change).then((data) => {
//   if (data.type === "ERROR") {
//     test = confirm(
//       server + " failder, " + data.msg + "! Want to see our documentation?"
//     );
//     if (test) {
//       window.location.href = baseUrl + "/explain";
//     }
//     return;
//   } else {
//     console.log(data);
//     test = confirm(server + " was a succes! Want to see our documentation?");
//     if (test) {
//       window.location.href = baseUrl + "/explain";
//     }
//   }
// });
