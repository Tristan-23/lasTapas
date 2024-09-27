const baseUrl = window.location.href.split("/").slice(0, 3).join("/");
const advancedUrl = baseUrl + "/dashboard";

document.addEventListener("DOMContentLoaded", () => {
  const loginToggle = document.getElementById("login-toggle");
  const registerToggle = document.getElementById("register-toggle");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  let shouldShowRegisterButton = false;

  makeServerRequest("fetch", "workers", {
    permission_level: 50,
  }).then((data) => {
    if (data.type === "ERROR") {
      console.error("Error fetching data:", data.msg);
      shouldShowRegisterButton = true;
    } else {
      shouldShowRegisterButton = false;
    }
  });

  loginToggle.addEventListener("click", () => {
    loginToggle.classList.add("active");
    registerToggle.classList.remove("active");
    loginForm.classList.add("active");
    registerForm.classList.remove("active");
  });

  registerToggle.addEventListener("click", () => {
    if (shouldShowRegisterButton) {
      registerToggle.classList.add("active");
      loginToggle.classList.remove("active");
      registerForm.classList.add("active");
      loginForm.classList.remove("active");
    } else {
      alert("There is already an owner!");
    }
  });

  const showError = (input, message) => {
    const formGroup = input.parentElement;
    formGroup.classList.add("error");
    const errorMessage = formGroup.querySelector(".error-message");
    errorMessage.innerText = message;
  };

  const clearError = (input) => {
    const formGroup = input.parentElement;
    formGroup.classList.remove("error");
    const errorMessage = formGroup.querySelector(".error-message");
    errorMessage.innerText = "";
  };

  const validateEmail = (email) => {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email");
    const password = document.getElementById("login-password");
    let isValid = true;

    if (!validateEmail(email.value.trim())) {
      showError(email, "Please enter a valid email.");
      isValid = false;
    } else {
      clearError(email);
    }

    if (password.value.trim().length < 6) {
      showError(password, "Password must be at least 6 characters.");
      isValid = false;
    } else {
      clearError(password);
    }

    if (isValid) {
      makeServerRequest("fetch", "workers", {
        username: email.value.trim(),
        secret_password: password.value.trim(),
      }).then((data) => {
        if (data.type === "ERROR") {
          console.error("Error fetching data:", data.msg);
          return;
        } else {
          data.forEach((item, index) => {
            if (item.secret_password) {
              clearError(password);
              localStorage.setItem("user", JSON.stringify(item));
              window.location.href = baseUrl + "/dashboard";
            } else {
              showError(password, "Invalid password.");
            }
          });
        }
      });
      loginForm.reset();
    }
  });

  // Register Form Validation
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("register-username");
    const email = document.getElementById("register-email");
    const password = document.getElementById("register-password");
    const confirmPassword = document.getElementById(
      "register-confirm-password"
    );
    let isValid = true;

    if (username.value.trim().length < 3) {
      showError(username, "Username must be at least 3 characters.");
      isValid = false;
    } else {
      clearError(username);
    }

    if (!validateEmail(email.value.trim())) {
      showError(email, "Please enter a valid email.");
      isValid = false;
    } else {
      clearError(email);
    }

    if (password.value.trim().length < 6) {
      showError(password, "Password must be at least 6 characters.");
      isValid = false;
    } else {
      clearError(password);
    }

    if (confirmPassword.value.trim() !== password.value.trim()) {
      showError(confirmPassword, "Passwords do not match.");
      isValid = false;
    } else {
      clearError(confirmPassword);
    }

    if (isValid) {
      makeServerRequest("insert", "workers", {
        label: username.value.trim(),
        username: email.value.trim(),
        secret_password: password.value.trim(),
        permission_level: 50,
      }).then((data) => {
        if (data.type === "ERROR") {
          console.error("Error fetching data:", data.msg);
          return;
        } else {
          console.log(data);
        }
      });
      registerForm.reset();
    }
  });
});
