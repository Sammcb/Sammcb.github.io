function changeOptions() {
  let player_id_sel = document.getElementById('player-id');
  player_id_sel.length = 1;
  let start_id_sel = document.getElementById('start-id');
  start_id_sel.length = 1;
  for (let i = 1; i < Number(document.getElementById('player-count').value); i++) {
    player_id_sel[player_id_sel.options.length] = new Option(i + 1, i, false, false);
    start_id_sel[start_id_sel.options.length] = new Option(i + 1, i, false, false);
  }
}

function play() {
  let seed = document.getElementById('seed').value;
  console.log(seed);
  if (seed == '' || Number(seed) < 0) {
    document.getElementById('seed-error').style.display = 'block';
  } else {
    document.getElementById('seed-error').style.display = 'none';
    localStorage.setItem('player_count', document.getElementById('player-count').value);
    localStorage.setItem('player_id', document.getElementById('player-id').value);
    localStorage.setItem('start_id', document.getElementById('start-id').value);
    localStorage.setItem('seed', seed);
    window.location.href = 's_play.html';
  }
}
