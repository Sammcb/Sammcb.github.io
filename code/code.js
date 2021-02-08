const downArrow = '&#9660;'
const rightArrow = '&#9654;'
const categories = {
  'utilities': {shown: true, text: 'Utilities'},
  'games': {shown: true, text: 'Games'},
  'generative-art': {shown: true, text: 'Generative Art'},
  'tools': {shown: true, text: 'Tools'},
  'websites': {shown: true, text: 'Websites'}
}

function toggleCategory(id, senderId) {
  categories[id].shown = !categories[id].shown
  let sender = document.getElementById(senderId)
  sender.innerHTML = `${categories[id].text} ${categories[id].shown ? downArrow : rightArrow}`
  let category = document.getElementById(id)
  category.style.display = categories[id].shown ? 'block' : 'none'
}
