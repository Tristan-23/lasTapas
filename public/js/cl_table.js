const baseUrl = window.location.href.split("/").slice(0, 3).join("/");
const advancedUrl = baseUrl + "/table";

function registerTable(self) {
  function generateDayCode(maxDigits, factor) {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, "0");
    const month = (today.getMonth() + 1).toString().padStart(2, "0");

    const dayMonthCode = day + month;

    let result = (parseInt(dayMonthCode) * factor).toString();

    if (result.length > maxDigits) {
      result = result.slice(0, maxDigits);
    } else if (result.length < maxDigits) {
      result = result.padStart(maxDigits, "0");
    }

    return result;
  }

  const dayCodeDigits = 4;
  const seatingCodeDigits = 2;
  const generatedDayCode = generateDayCode(dayCodeDigits, 2);
  console.log(generatedDayCode);

  let pasword = false;
  toggleNumpad(
    dayCodeDigits,
    `Voer de ${dayCodeDigits}-cijfrige dag code in!`,
    (result) => {
      if (result) {
        if (generatedDayCode === result) {
          pasword = true;
        } else if (pasword) {
          pasword = false;
          handleHtmlChange(result);
          return;
        }

        if (pasword) {
          toggleNumpad(
            seatingCodeDigits,
            `Hoeveel zitplaatsen zijn beschikbaar? (${seatingCodeDigits} cijfers)`,
            (seatingResult) => {}
          );
        }
      }
    }
  );
}

function handleHtmlChange(numSeats) {
  const circle = document.querySelector("#circle");
  const tooltip = document.querySelector("#tooltip");

  localStorage.removeItem("table");

  // Hide other elements but keep the start button
  document.querySelector("section .container").style.display = "none";
  document.querySelector("section #start").style.display = "none";

  // Clear the existing seats but keep the start button
  const seatDivs = circle.querySelectorAll("div:not(#startButton)"); // Select only the seat divs
  seatDivs.forEach((div) => div.remove()); // Remove only seat divs

  circle.style.display = "block";

  const radius = 200;

  for (let i = 0; i < numSeats; i++) {
    const childDiv = document.createElement("div");
    childDiv.className = "seat";
    childDiv.id = `seat-${i + 1}`; // Changed to 1-based index

    const angle = i * (360 / numSeats) * (Math.PI / 180);
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    childDiv.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    childDiv.onclick = (event) => startFunction(i + 1, childDiv, tooltip); // Pass 1-based index

    circle.appendChild(childDiv);
  }

  // Automatically open the tooltip for the first seat
  if (numSeats > 0) {
    const seats = circle.querySelectorAll(".seat"); // Select all seat elements
    if (seats.length > 0) {
      startFunction(1, seats[0], tooltip); // Open tooltip for the first seat (1-based)
    }
  }

  initializeSavedData(numSeats);
}

// Create an object to hold the saved data for each seat
const savedData = {};

// Global allergies array
const allergies = [
  { id: "vegan", label: "Vegan" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "glutenFree", label: "Gluten-Free" },
  { id: "nutFree", label: "Nut-Free" },
  { id: "dairyFree", label: "Dairy-Free" },
  { id: "soyFree", label: "Soy-Free" },
  { id: "eggFree", label: "Egg-Free" },
  { id: "lowCarb", label: "Low Carb" },
  { id: "paleo", label: "Paleo" },
  { id: "keto", label: "Keto" },
];

// Function to initialize the tooltip's content
function initializeTooltipContent(self, tooltip, seatInfo, allergiesChecklist) {
  // Define default values if seatInfo properties are undefined
  const nameValue = seatInfo.name !== undefined ? seatInfo.name : "";
  const ageValue = seatInfo.age !== undefined ? seatInfo.age : "";

  tooltip.innerHTML = `
    <div id="header">
      <strong>Seat ${self} Information</strong><br> <!-- Changed to 1-based index -->
    </div>
    <div id="section">
      <div>
        <label>Name:</label> 
        <input type="text" id="name" placeholder="John Doe" value="${nameValue}" ${
    nameValue ? "disabled" : ""
  }><br>
      </div>
      <div>
        <label>Age:</label> 
        <input type="number" id="age" placeholder="18" value="${ageValue}" ${
    nameValue ? "disabled" : ""
  }><br>
      </div>
      <label>Allergies Checklist (optional):</label><br>
      ${allergiesChecklist}
    </div>
    <div id="footer">
      <div id="errorMsg" style="color: red; display: none;"></div>
      <button id="closeBtn">Close</button>
      <button id="confirmBtn">${nameValue ? "Change" : "Confirm"}</button>
    </div>
  `;
}

function generateAllergiesChecklist(self) {
  return allergies
    .map(
      (allergy) => `
    <div>
      <label for="${allergy.id}">${allergy.label}:</label>
      <input type="checkbox" id="${allergy.id}" name="${allergy.id}" value="${
        allergy.label
      }"
        ${savedData[self].allergies[allergy.id] ? "checked" : ""}
        ${savedData[self].name ? "disabled" : ""}><br>
    </div>
  `
    )
    .join("");
}

function resetAllSeatsColor() {
  const seats = document.querySelectorAll(".seat"); // Assuming seat elements have a class "seat"
  seats.forEach((seat) => {
    seat.classList.remove("selected", "correct", "invalid"); // Reset seat classes
  });
}

function handleConfirmChange(self, allergies, seat) {
  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  // Validate name
  if (!name) {
    errorMsg.textContent = "Name cannot be empty.";
    errorMsg.style.display = "block";
    seat.classList.add("invalid");
    return;
  }

  // Validate age
  if (isNaN(age) || age < 1 || age > 120) {
    errorMsg.textContent = "Please enter a valid age (1-120).";
    errorMsg.style.display = "block";
    seat.classList.add("invalid");
    return;
  }

  errorMsg.style.display = "none"; // Hide error message

  // Determine the button action
  const confirmButton = document.getElementById("confirmBtn");

  // Save data when confirming the seat
  if (confirmButton.innerText === "Confirm") {
    saveSeatData(self, name, age, allergies); // Ensure self is used correctly
    setFieldsDisabled(true, allergies);
    confirmButton.innerText = "Change"; // Change button text to "Change"
    seat.classList.add("correct"); // Mark seat as confirmed
  } else {
    // Allow re-editing of the confirmed seat
    seat.classList.remove("correct"); // Remove the confirmed style
    setFieldsDisabled(false, allergies); // Enable fields for editing
    confirmButton.innerText = "Confirm"; // Reset button text to "Confirm"
  }
}

function saveSeatData(self, name, age, allergies) {
  const seatKey = self; // Use self directly as it's 1-based now

  // Initialize the seat data object if it is not already created
  if (!savedData[seatKey]) {
    savedData[seatKey] = { name: "", age: "", allergies: {} }; // Create a new seat data object
  }

  // Save the name and age if provided
  savedData[seatKey].name = name; // Always save the name, even if empty
  savedData[seatKey].age = age; // Always save the age, even if empty

  // Save allergy states, initializing the allergies object if not present
  if (!savedData[seatKey].allergies) {
    savedData[seatKey].allergies = {};
  }

  allergies.forEach((allergy) => {
    // Save the checkbox state for each allergy
    savedData[seatKey].allergies[allergy.id] = document.getElementById(
      allergy.id
    ).checked;
  });

  console.log(`Data saved for seat ${seatKey}`, savedData[seatKey]); // Log saved data for debugging
}

function initializeSavedData(totalSeats) {
  for (let i = 1; i <= totalSeats; i++) {
    if (!savedData[i]) {
      savedData[i] = {
        allergies: {},
      };
    }
  }

  delete savedData[0];
}

function setFieldsDisabled(isDisabled, allergies) {
  document.getElementById("name").disabled = isDisabled;
  document.getElementById("age").disabled = isDisabled;
  allergies.forEach((allergy) => {
    document.getElementById(allergy.id).disabled = isDisabled;
  });
}

function positionTooltip(tooltip) {
  // Position the tooltip at a fixed location, e.g., bottom-right of the screen
  tooltip.style.position = "fixed";
  tooltip.style.bottom = "10px";
  tooltip.style.right = "10px";
  tooltip.style.zIndex = "1000"; // Make sure the tooltip stays on top of other elements
  tooltip.style.display = "block"; // Show tooltip after setting the position
}

function startFunction(self, seat, tooltip) {
  const allSeats = document.querySelectorAll(".seat");
  allSeats.forEach((s) => s.classList.remove("selected"));
  seat.classList.add("selected");

  if (!savedData[self]) {
    savedData[self] = { name: "", age: "", allergies: {} };
  }

  const seatInfo = savedData[self];
  const allergiesChecklist = generateAllergiesChecklist(self);
  initializeTooltipContent(self, tooltip, seatInfo, allergiesChecklist);

  // Place the tooltip at a fixed location
  positionTooltip(tooltip);

  document.getElementById("closeBtn").addEventListener("click", () => {
    tooltip.style.display = "none";
    seat.classList.remove("selected"); // Remove selected class when closing
  });

  document.getElementById("confirmBtn").addEventListener("click", () => {
    handleConfirmChange(self, allergies, seat);
  });
}

function validateData() {
  const circle = document.querySelector("#circle");
  const totalSeats = circle.querySelectorAll(".seat").length;

  const filledSeats = Object.values(savedData).filter(
    (seat) => seat.name && seat.age
  ).length;

  const emptySeats = totalSeats - filledSeats;

  console.log(emptySeats);

  if (emptySeats >= 3) {
    alert(`You have filled ${filledSeats} out of ${totalSeats} seats. 
           There are still ${emptySeats} empty seats. 
           We recommend a smaller table.`);
  } else if (filledSeats <= 0) {
    // Open the tooltip for the first seat
    const firstSeat = circle.querySelector(".seat"); // Get the first seat element
    if (firstSeat) {
      startFunction(1, firstSeat, document.querySelector("#tooltip")); // Call startFunction with the first seat
    }
  } else {
    Object.keys(savedData).forEach((key) => {
      if (savedData[key].name) {
        // Ensure that allergies are defined
        if (
          !savedData[key].allergies ||
          Object.keys(savedData[key].allergies).length === 0
        ) {
          savedData[key].allergies = { none: true }; // Set a default value for no allergies
        }
      } else {
        savedData[key] = "empty"; // Mark seat as empty if no name is provided
      }
    });

    if (confirm("Are you sure?")) {
      localStorage.setItem("table", JSON.stringify(savedData));
      localStorage.removeItem("remainingTime");
      window.location.href = baseUrl + "/menu";
    }
  }
}
