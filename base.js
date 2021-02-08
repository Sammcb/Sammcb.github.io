const mobileWidth = 767
const navLinks = document.getElementsByClassName('nav-link')
let isDesktopView = window.innerWidth >= mobileWidth
let navOpen = false

function updateElements() {
  const changedToMobileView = window.innerWidth < mobileWidth && isDesktopView
  const changedToDesktopView = window.innerWidth >= mobileWidth && !isDesktopView
  for (navLink of navLinks) {
    if (changedToMobileView) {
      navLink.style.display = 'none'
    } else if (changedToDesktopView) {
      navLink.style.display = 'flex'
    }
  }

  if (changedToDesktopView) {
    navOpen = false
  }

  isDesktopView = window.innerWidth >= mobileWidth
}

function toggleNav() {
  for (navLink of navLinks) {
    navLink.style.display = navOpen ? 'none' : 'flex'
  }
  navOpen = !navOpen
}
