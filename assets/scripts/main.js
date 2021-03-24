const navLinkGroups = document.getElementsByClassName('nav-link-group')
let navOpen = false

function toggleNav() {
  for (navLinkGroup of navLinkGroups) {
    if (navLinkGroup.id === 'home-link-group') {
      continue
    }
    
    navLinkGroup.style.display = navOpen ? '' : 'unset'
  }
  navOpen = !navOpen
}
