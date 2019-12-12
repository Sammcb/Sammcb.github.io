let deck_info = {
  'tacocat': {'info': '', 'count': 4},
  'cattermelon': {'info': '', 'count': 4},
  'beard-cat': {'info': '', 'count': 4},
  'hairy-potato-cat': {'info': '', 'count': 4},
  'rainbow-ralphing-cat': {'info': '', 'count': 4},
  'favor': {'info': 'one player must give you a card of their choice', 'count': 4},
  'skip': {'info': 'end your turn without drawing a card', 'count': 4},
  'see-the-future': {'info': 'privately view the top three cards of the deck', 'count': 5},
  'shuffle': {'info': 'shuffle the draw pile', 'count': 4},
  'attack': {'info': 'end your turn without drawing a card. force the next player to take two cards.', 'count': 4},
  'nope': {'info': 'stop the action of another player. you can play this at any time.', 'count': 5},
  'defuse': {'info': 'put your last drawn card back into the deck', 'count': 6},
  'exploding-kitten': {'info': 'show this card immediately', 'count': 4}
};

let deck = [
  {'type': 'tacocat', 'msg': ''},
  {'type': 'tacocat', 'msg': ''},
  {'type': 'tacocat', 'msg': ''},
  {'type': 'tacocat', 'msg': ''},
  {'type': 'cattermelon', 'msg': ''},
  {'type': 'cattermelon', 'msg': ''},
  {'type': 'cattermelon', 'msg': ''},
  {'type': 'cattermelon', 'msg': ''},
  {'type': 'beard-cat', 'msg': ''},
  {'type': 'beard-cat', 'msg': ''},
  {'type': 'beard-cat', 'msg': ''},
  {'type': 'beard-cat', 'msg': ''},
  {'type': 'hairy-potato-cat', 'msg': ''},
  {'type': 'hairy-potato-cat', 'msg': ''},
  {'type': 'hairy-potato-cat', 'msg': ''},
  {'type': 'hairy-potato-cat', 'msg': ''},
  {'type': 'rainbow-ralphing-cat', 'msg': ''},
  {'type': 'rainbow-ralphing-cat', 'msg': ''},
  {'type': 'rainbow-ralphing-cat', 'msg': ''},
  {'type': 'rainbow-ralphing-cat', 'msg': ''},
  {'type': 'favor', 'msg': 'get enslaved by party squirrels'},
  {'type': 'favor', 'msg': 'ask for a back hair shampoo'},
  {'type': 'favor', 'msg': 'rub peanut butter on your belly button and make some new friends'},
  {'type': 'favor', 'msg': 'take your friends beard-sailing on your beard boat'},
  {'type': 'skip', 'msg': 'commandeer a bunnyraptor'},
  {'type': 'skip', 'msg': 'crab walk with some crabs'},
  {'type': 'skip', 'msg': 'don a portable cheetah butt'},
  {'type': 'skip', 'msg': 'engage the hypergoat'},
  {'type': 'see-the-future', 'msg': 'ask the all-seeing goat wizard'},
  {'type': 'see-the-future', 'msg': 'summon the mantis shrimp'},
  {'type': 'see-the-future', 'msg': 'deploy the special-ops bunnies'},
  {'type': 'see-the-future', 'msg': 'feast upon a unicorn enchilada and gain its enchilada powers'},
  {'type': 'see-the-future', 'msg': 'rub the belly of a pig-a-corn'},
  {'type': 'shuffle', 'msg': 'abracrab lincoln is elected president'},
  {'type': 'shuffle', 'msg': 'a transdimensional litter box materializes'},
  {'type': 'shuffle', 'msg': 'an electromagnetic pomeranian storm rolls in from the east'},
  {'type': 'shuffle', 'msg': 'a plague of bat farts descends from the sky'},
  {'type': 'attack', 'msg': 'unleash the catterwocky'},
  {'type': 'attack', 'msg': 'deploy the thousand-year back hair'},
  {'type': 'attack', 'msg': 'fire the crab-a-pult'},
  {'type': 'attack', 'msg': 'awaken the bear-o-dactyl'},
  {'type': 'nope', 'msg': 'feed your opponent a nope sandwich with extra nopesauce'},
  {'type': 'nope', 'msg': 'nopestradamus speaks the truth'},
  {'type': 'nope', 'msg': 'win the nopebell peace prize'},
  {'type': 'nope', 'msg': 'a nope ninja delivers a wicked dragon kick'},
  {'type': 'nope', 'msg': 'a jackanope bounds into the room'},
  {'type': 'defuse', 'msg': 'via vatnip sandwiches'},
  {'type': 'defuse', 'msg': 'via laser pointer'},
  {'type': 'defuse', 'msg': 'via 3am flatulence'},
  {'type': 'defuse', 'msg': 'via participation in kitten yoga'},
  {'type': 'defuse', 'msg': 'via kitten therapy'},
  {'type': 'defuse', 'msg': 'via belly rubs'},
  {'type': 'exploding-kitten', 'msg': ''},
  {'type': 'exploding-kitten', 'msg': ''},
  {'type': 'exploding-kitten', 'msg': ''},
  {'type': 'exploding-kitten', 'msg': ''}
];

// JSF for seeding a random number generator
function JSF(seed) {
  function jsf() {
    let e = s[0] - (s[1] << 27 | s[1] >>> 5);
    s[0] = s[1] ^ (s[2] << 17 | s[2] >>> 15);
    s[1] = s[2] + s[3];
    s[2] = s[3] + e, s[3] = s[0] + e;
    return (s[3] >>> 0) / 4294967296;
  }
  seed >>>= 0;
  let s = [0xf1ea5eed, seed, seed, seed];
  for (let i = 0; i < 20; i++) {
    jsf();
  }
  return jsf();
}

function shuffle(arr, seed) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(JSF(seed) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr;
}

let player_count = localStorage.getItem('player_count');
let player_id = localStorage.getItem('player_id');
let start_id = localStorage.getItem('start_id');
let seed = localStorage.getItem('seed');

let hands = [];

function displayHand(player_id, play_cards=false) {
  let hand_cards = document.getElementById('hand-cards');
  while (hand_cards.firstChild) {
    hand_cards.removeChild(hand_cards.firstChild);
  }
  let player_hand = hands[player_id];
  for (let i = 0; i < player_hand.length; i++) {
    let hand_card = document.createElement('li');
    if (play_cards) {
      let card_select = document.createElement('input');
      card_select.type = 'checkbox';
      card_select.value = i;
      card_select.setAttribute('onchange', 'updateAction()');
      hand_card.appendChild(card_select);
    }
    let card_info = document.createElement('p');
    card_info.textContent = player_hand[i]['type'] + ' | ' + player_hand[i]['msg'];
    hand_card.appendChild(card_info);
    hand_cards.appendChild(hand_card);
  }
}

function displayCardChange(card_id, added=true) {
  let hand_cards = document.getElementById('hand-cards');
  for (let i = 0; i < hand_cards.children.length; i++) {
    if (i === card_id) {
      hand_cards.children[i].lastChild.textContent += added ? '(+)' : '(-)';
      hand_cards.children[i].lastChild.style.color = 'blue';
    }
  }
}

function startGame() {
  document.getElementById('start-btn').style.display = 'none';
  let defuses = [];
  let exploding_kittens = [];
  // Pull defuses and exploding kittens out of deck
  for (let i = deck.length - 1; i >= 0; i--) {
    if (deck[i]['type'] == 'defuse') {
      defuses.push(deck.splice(i, 1)[0]);
    } else if (deck[i]['type'] == 'exploding-kitten') {
      exploding_kittens.push(deck.splice(i, 1)[0]);
    }
  }
  // Set up player hands
  for (let i = 0; i < player_count; i++) {
    hands.push([]);
  }
  // Shuffle deck
  shuffle(deck, seed);
  // Deal cards to players
  for (let i = 0; i < 4 * player_count; i++) {
    hands[i % player_count].push(deck.splice(0, 1)[0]);
  }
  shuffle(defuses, seed);
  for (let i = 0; i < player_count; i++) {
    hands[i].push(defuses.splice(0, 1)[0]);
  }
  // Append extra defuse and exploding kitten cards to deck
  for (let i = 0; i < (player_count > 2 ? defuses.length : 2); i++) {
    deck.push(defuses[i]);
  }
  shuffle(exploding_kittens, seed);
  for (let i = 0; i < player_count - 1; i++) {
    deck.push(exploding_kittens[i]);
  }
  // Shuffle deck
  shuffle(deck, seed);
  // Update display
  document.getElementById('deck-info').textContent = 'Deck - ' + deck.length + '/' + deck.length + ' cards';
  document.getElementById('hand-info').textContent = 'Hand - ' + hands[player_id].length + ' cards';
  displayHand(player_id);
  document.getElementById('hand-cards').style.display = 'block';
  let action_info = document.getElementById('action-info');
  action_info.textContent = 'Player ' + (Number(start_id) + 1) + ' turn...';
  action_info.style.display = 'block';
  let player_sel = document.getElementById('player-sel');
  for (let i = 0; i < player_count; i++) {
    if (i !== Number(player_id)) {
      player_sel[player_sel.options.length] = new Option(i + 1, i, false, false);
    }
  }
  takeTurn(start_id);
}

function takeTurn(turn_id) {
  let player_prompt = document.getElementById('player-prompt');
  if (player_id === turn_id) {
    player_prompt.textContent = 'Your turn';
    player_prompt.style.display = 'block';
    displayHand(player_id, true);

    // actions
    // play 2 of a kind - pick player to draw random card from
    // play 3 of a kind - pick player and choose card to draw
    // play 5 different - pick card from discard
    // play favor - pick player to give you a card
    // skip - end turn
    // see the future - look at top three cards of the deck
    // shuffle - shuffle the deck
    // attack - end turn. force next player to take two cards

    // special actions
    // nope - stop action of another player
    // defuse - place exploding kitten card back into deck at spot of choice

  } else {
    player_prompt.textContent = 'What did player ' + (Number(turn_id) + 1) + ' do?';
    player_prompt.style.display = 'block';
  }
  document.getElementById('act-btn').style.display = 'block';
}

function updateAction() {
  let hand_cards = document.getElementById('hand-cards');
  let cards_selected = 0;
  for (let i = 0; i < hand_cards.children.length; i++) {
    if (hand_cards.children[i].firstChild.checked) {
      cards_selected++;
    }
  }
  let act_btn = document.getElementById('act-btn');
  if (cards_selected === 0) {
    act_btn.textContent = 'End turn';
  } else if (cards_selected === 1) {
    act_btn.textContent = 'Play card';
  } else {
    act_btn.textContent = 'Play cards';
  }
}

function displayCardSel(player_id) {
  document.getElementById('card-sel-msg').style.display = 'block';
  let card_sel = document.getElementById('card-sel');
  card_sel.length = 0;
  for (let i = 0; i < hands[player_id].length; i++) {
    card_sel[card_sel.options.length] = new Option(i + 1, i, false, false);
  }
  card_sel.style.display = 'block';
}

var action = {};

function updatePlayerId() {
  action['target_id'] = document.getElementById('player-sel').value;
  displayCardSel(action['target_id']);
  if (action['type'] === 'two_cards') {
    updateCardId()
  }
}

function updateCardId() {
  action['card_id'] = document.getElementById('card-sel').value;
}

function takeAction() {
  document.getElementById('act-btn').style.display = 'none';
  let hand_cards = document.getElementById('hand-cards');
  let sel_cards = [];
  for (let i = 0; i < hand_cards.children.length; i++) {
    if (hand_cards.children[i].firstChild.checked) {
      sel_cards.push(i);
    }
  }
  let player_hand = hands[player_id];
  if (sel_cards.length === 2 && player_hand[sel_cards[0]]['type'] === player_hand[sel_cards[0]]['type']) {
    document.getElementById('player-sel-msg').style.display = 'block';
    let player_sel = document.getElementById('player-sel');
    player_sel.style.display = 'block';
    displayCardSel(player_sel.value);
    document.getElementById('fin-act-btn').style.display = 'block';
    let card_sel = document.getElementById('card-sel');
    action = {'type': 'two_cards', 'target_id': player_sel.value, 'card_id': card_sel.value};
    // need to display message saying the spent two cards
    displayHand(player_id);
    displayCardChange(sel_cards[0], false);
    displayCardChange(sel_cards[1], false);
    // remove check boxes from cards
    // color cards red with (-)
  }

  // need to display number of cards each other player has

  // if player plays two cards, make sure they match
  // then display selector for player to take card from
  // then display selector for card chosen
  // display button to complete action

  // if player plays three cards, make sure they match
  // then display selector for player to take card from
  // then display selector for type of card
  // display button to complete action

  // if player plays 5 cards, make sure they are different
  // then display selector for cards in discard pile
  // display button to complete action

  // if player plays favor
  // then display selector for player to take card from
  // then display selector for card given
  // display button to complete action

  // if player plays skip
  // then end the turn

  // if player plays see the future
  // display list of top three cards of deck with positions
  // display button to complete action

  // if player plays shuffle
  // shuffle the deck with seed they choose

  // if player plays attack
  // end turn and pass indicator to next player turn
}

function finAction() {
  switch (action['type']) {
    case 'two_cards':
      console.log(hands);
      hands[player_id].push(hands[action['target_id']].splice(action['card_id'], 1)[0]);
      shuffle(hands[player_id], seed);
      displayHand(player_id, true);
      // remove extra selectors
      // remove finish action button
      // put back action button
      // display messages saying they gained card
      // color card green with (+)
      // replace checkboxes
      break;
    default:
      console.log('bad');
      // display invalid action message
  }
}
