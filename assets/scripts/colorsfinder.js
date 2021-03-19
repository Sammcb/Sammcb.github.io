function findColors() {
  const c1 = document.getElementById('color1').value
  const c2 = document.getElementById('color2').value
  if (c1 === c2) {
    alert('Must choose different colors')
    return
  }
  const steps = parseInt(document.getElementById('steps').value)
  document.getElementById('content').style.backgroundImage = `linear-gradient(${c1},${c2})`
  const result = document.getElementById('result')
  result.innerHTML = ''

  const rgb1 = [parseInt(`0x${c1[1]}${c1[2]}`), parseInt(`0x${c1[3]}${c1[4]}`), parseInt(`0x${c1[5]}${c1[6]}`)]
  const rgb2 = [parseInt(`0x${c2[1]}${c2[2]}`), parseInt(`0x${c2[3]}${c2[4]}`), parseInt(`0x${c2[5]}${c2[6]}`)]
  const delta = [rgb1[0] - rgb2[0], rgb1[1] - rgb2[1], rgb1[2] - rgb2[2]]

  let prevRgb = [rgb1[0], rgb1[1], rgb1[2]]
  let resColors = [c1]
  for (let i = 1; i <= steps; i++) {
    const newRgb = [
      Math.round(rgb1[0] - (i * (delta[0] / (steps + 1)))),
      Math.round(rgb1[1] - (i * (delta[1] / (steps + 1)))),
      Math.round(rgb1[2] - (i * (delta[2] / (steps + 1))))
    ]

    if (newRgb[0] === prevRgb[0] && newRgb[1] === prevRgb[1] && newRgb[2] === prevRgb[2]) {
      continue
    }

    prevRgb = [newRgb[0], newRgb[1], newRgb[2]]

    let newC = '#'
    for (rgb of newRgb) newC += (rgb.toString(16).length < 2) ? `0${rgb.toString(16)}` : rgb.toString(16)
    resColors.push(newC)
  }
  resColors.push(c2)

  for (c of resColors) {
    result.innerHTML += `<div class="result-color"><p>${c}</p><div class="color-display" style="background: ${c};"></div></div>`
  }
}
