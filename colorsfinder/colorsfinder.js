function findColors() {
  c1 = document.getElementById('color1').value;
  c2 = document.getElementById('color2').value;
  if (c1 === c2) {
    alert('Must choose different colors');
    return;
  }
  steps = parseInt(document.getElementById('steps').value);
  document.getElementById('content').style.backgroundImage = 'linear-gradient(' + c1 + ', ' + c2 + ')';
  result = document.getElementById('result');
  result.innerHTML = '';

  rgb1 = [parseInt('0x' + c1[1] + c1[2]), parseInt('0x' + c1[3] + c1[4]), parseInt('0x' + c1[5] + c1[6])];
  rgb2 = [parseInt('0x' + c2[1] + c2[2]), parseInt('0x' + c2[3] + c2[4]), parseInt('0x' + c2[5] + c2[6])];
  delta = [rgb1[0] - rgb2[0], rgb1[1] - rgb2[1], rgb1[2] - rgb2[2]];
  console.log(delta);

  prevRgb = [rgb1[0], rgb1[1], rgb1[2]];
  resColors = [c1];
  for (i = 1; i <= steps; i++) {
    newRgb = [
      Math.round(rgb1[0] - (i * (delta[0] / (steps + 1)))),
      Math.round(rgb1[1] - (i * (delta[1] / (steps + 1)))),
      Math.round(rgb1[2] - (i * (delta[2] / (steps + 1))))
    ];
    console.log(newRgb);

    if (newRgb[0] === prevRgb[0] && newRgb[1] === prevRgb[1] && newRgb[2] === prevRgb[2]) continue;

    prevRgb = [newRgb[0], newRgb[1], newRgb[2]];

    newC = '#';
    for (rgb of newRgb) newC += (rgb.toString(16).length < 2) ? '0' + rgb.toString(16) : rgb.toString(16);
    resColors.push(newC);
  }
  resColors.push(c2);

  for (c of resColors) {
    result.innerHTML += '<div class="result-color"><input type="text" value="' + c + '" id="' + c + '" class="copy-input" readonly><div class="color-display" style="background: ' + c + ';"></div><button onclick="copyColor(\'' + c + '\')">Copy</button></div>';
  }
}

function resetPage() {
  result = document.getElementById('result');
  result.innerHTML = '';
  document.getElementById('content').style.backgroundImage = '';
}

function copyColor(c) {
  colorField = document.getElementById(c);
  colorField.select();
  document.execCommand('copy');
  window.getSelection().removeAllRanges();
}
