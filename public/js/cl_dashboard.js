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

        const target = submenuItem.dataset.subsection;
        navItems.forEach((nav) => nav.classList.remove("active"));
        item.classList.add("active");

        selectSection(target);
      });
    });
  });

  notificationButton.addEventListener("click", () => {
    alert("Notification settings will be available soon!");
  });

  profileButton.addEventListener("click", () => {
    alert("Profile settings will be available soon!");
  });
});
