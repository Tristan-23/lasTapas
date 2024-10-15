// Create HTML structure
const body = document.body;

// Create overlay
const overlay = document.createElement("div");
overlay.id = "overlay";
overlay.style.display = "none";
body.appendChild(overlay);

const numpadContainer = document.createElement("div");
numpadContainer.id = "numpad";
numpadContainer.style.display = "none";

const header = document.createElement("header");
const acceptButton = document.createElement("button");
acceptButton.textContent = "Accepteer";
const inputField = document.createElement("input");
inputField.readOnly = true;
inputField.placeholder = "Voer code in";
const cancelButton = document.createElement("button");
cancelButton.textContent = "Annuleer";

header.appendChild(acceptButton);
header.appendChild(inputField);
header.appendChild(cancelButton);
numpadContainer.appendChild(header);

const section = document.createElement("section");
const buttons = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "BACKSPACE",
  "0",
  "CLEAR",
];

buttons.forEach((text) => {
  const button = document.createElement("div");
  button.textContent = text;
  section.appendChild(button);
});

numpadContainer.appendChild(section);
body.appendChild(numpadContainer);

// CSS styles
const style = document.createElement("style");
style.textContent = `
  #overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(5px);
    z-index: 900;
  }

  #numpad {
    font-family: 'Arial', sans-serif;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50%;
    height: 50%;
    background-color: #DEA30C;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    display: flex;
    flex-direction: column;
  }

  #numpad header {
    height: 20%;
    width: 100%;
    background-color: #FFD057;
    color: #ffffff;
    display: flex;
    justify-content: space-around;
    align-items: center;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }
  
  #numpad header * {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50%;
    font-size: 1rem;
  }
  
  #numpad header input {
    width: 50%;
    text-align: center;
    padding: 0 0.5rem;
    border: none;
    border-radius: 5px;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  #numpad header button {
    width: 20%;
    padding: 0.5rem;
    border: none;
    border-radius: 5px;
    background-color: #A72F1E;
    color: #ffffff;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  #numpad header button:hover {
    background-color: #92291A;
  }
  
  #numpad section {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 10px;
    background-color: #FFD057;
    padding-left: 10px;
    padding-right: 10px;
    padding-bottom: 10px;
  }
  
  #numpad section div {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    background-color: #A72F1E;
    color: #ffffff;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
  }
  
  #numpad section div:hover {
    background-color: #92291A;
  }
  
  #numpad section div:active {
    transform: scale(0.95);
  }
`;

document.head.appendChild(style);

let listenersAttached = false; // Flag to check if listeners are already attached

function toggleNumpad(amountOfDigits, headerText, callback) {
  const numpadContainer = document.getElementById("numpad");
  const inputField = document.querySelector("#numpad input");
  const numpadButtons = document.querySelectorAll("#numpad section div");

  // Clear the input field and set the header text
  inputField.value = "";
  overlay.style.display = "block";
  numpadContainer.style.display = "flex";
  inputField.placeholder = headerText;

  // Only add event listeners if they haven't been attached yet
  if (!listenersAttached) {
    numpadButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (button.textContent === "BACKSPACE") {
          inputField.value = inputField.value.slice(0, -1);
        } else if (button.textContent === "CLEAR") {
          inputField.value = "";
        } else {
          if (inputField.value.length < amountOfDigits) {
            inputField.value += button.textContent;
          }
        }
      });
    });

    // Add event listener for the accept button
    document
      .querySelector("#numpad header button:nth-of-type(1)")
      .addEventListener("click", () => {
        const value = inputField.value;
        overlay.style.display = "none";
        numpadContainer.style.display = "none";
        callback(value);
      });

    // Add event listener for the cancel button
    document
      .querySelector("#numpad header button:nth-of-type(2)")
      .addEventListener("click", () => {
        overlay.style.display = "none";
        numpadContainer.style.display = "none";
        callback(false);
      });

    listenersAttached = true; // Mark listeners as attached
  }
}

// Example usage
// toggleNumpad(4, "Voer hier een 4-cijfrige code in!", (result) => {
//   if (result) {
//     console.log("Numpad result:", result);
//   } else {
//     console.log("Numpad was cancelled.");
//   }
// });
