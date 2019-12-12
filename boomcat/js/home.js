function rulesConf() {
  switch (document.getElementById('deck-type').value) {
    case 's_deck':
      window.location.href = 's_deck.html';
      break;
    case 'e_deck':
      window.location.href = 'e_deck.html';
      break;
    case 'p_deck':
      window.location.href = 'p_deck.html';
      break;
    default:
      window.location.href = 's_deck.html';
  }
}
