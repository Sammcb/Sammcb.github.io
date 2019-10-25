var prevWidth = window.innerWidth;

function updateElements() {
  var navLinks = document.getElementsByClassName("nav-link");
  for (i = 0; i < navLinks.length; i++) {
    if (window.innerWidth < 767 && prevWidth >= 767) {
      navLinks[i].style.display = "none";
    } else if (window.innerWidth >= 767 && prevWidth < 767 && navLinks[i].style.display === "none") {
      navLinks[i].style.display = "flex";
    }
  }
  prevWidth = window.innerWidth;
}

function toggleNav() {
  var navLinks = document.getElementsByClassName("nav-link");
  for (i = 0; i < navLinks.length; i++) {
    if (navLinks[i].style.display !== "none" && navLinks[i].style.display !== "flex") {
      if (window.getComputedStyle(navLinks[i]).getPropertyValue("display") === "none") {
        navLinks[i].style.display = "flex";
      }
    } else if (navLinks[i].style.display === "none") {
      navLinks[i].style.display = "flex";
    } else {
      navLinks[i].style.display = "none";
    }
  }
}
