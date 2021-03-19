// Randomizer seed
let seed = 1

function mtnGen() {
	// Rng
	let lcg = x => seed = (1103515245 * x + 12345) % Math.pow(2, 31)
	let rMax = Math.pow(2, 31) - 1
	let rRange = (min, max) => lcg(seed) / rMax * (max - min) + min

	// Canvas setup
	let c = document.getElementById('mtn')
	c.style.height = `${Math.floor(c.offsetWidth / 2)}px`
	let ctx = c.getContext('2d')
	let w = c.offsetWidth
	let h = c.offsetWidth / 2
	let scale = window.devicePixelRatio
	c.width = w * scale
	c.height = h * scale
	ctx.scale(scale, scale)
	ctx.clearRect(0, 0, c.width, c.height)
	ctx.strokeStyle = 'rgba(0, 0, 0, 0)'

	let mtn = (x, params, sh=0) => {
		let y = 0
		params.forEach(p => y += p.a * (p.sin ? Math.sin(x * p.b + p.c) : Math.cos(x * p.b + p.c)))
		return h * y + sh
	};

	// Background
	// bg color gradient fill (pink to purple, purple to blue, etc)
	var grd = ctx.createLinearGradient(0, 0, 0, c.height)
	grd.addColorStop(0, 'rebeccapurple')
	// Range for pink to purple transition = [0.2, 0.4]
	grd.addColorStop(rRange(0.2, 0.4), 'lightpink')
	ctx.fillStyle = grd
	ctx.fillRect(0, 0, c.width, c.height)

	// Sun/Moon
	// Range for y = [100, 400]
	let skyY = rRange(100, 400)
	grd = ctx.createRadialGradient(800, skyY, 10, 800, skyY, 60)
	grd.addColorStop(0, 'gold')
	grd.addColorStop(1, 'rgba(255, 215, 0, 0.1')
	ctx.fillStyle = grd
	ctx.beginPath()
	ctx.arc(800, skyY, 50, 0, 2 * Math.PI)
	ctx.fill()

	// Background mountains
	// Range for a = [0.01, 0.15]
	// Range for b = [0.005, 0.03]
	// Range for c = [-100, 100]
	let bgParams = []
	// Range for number of functions = [4, 10]
	let bgMax = rRange(4, 10)
	for (let i = 1; i < bgMax; i++) bgParams.push({'sin': rRange(0, 1) >= 0.5, a: rRange(0.01, 0.15), b: rRange(0.005, 0.03), c: rRange(-100, 100)})
	grd = ctx.createLinearGradient(0, 0, 0, c.height)
	grd.addColorStop(0, 'tan')
	// Range for dark brown to light brown transition = [0.3, 0.5]
	grd.addColorStop(rRange(0.3, 0.5), 'sienna')
	ctx.fillStyle = grd
	ctx.beginPath()
	ctx.moveTo(0, h)
	// Range for step size = [20, 30]
	for (let x = 0; x <= w + 30; x += rRange(10, 20)) ctx.lineTo(x, mtn(x, bgParams, h / 2 - 50))
	ctx.lineTo(w, h)
	ctx.closePath()
	ctx.fill()
	
	// Midground mountains
	// Range for a = [0.01, 0.1]
	// Range for b = [0.01, 0.03]
	// Range for c = [-100, 100]
	let mgParams = []
	// Range for number of functions = [4, 8]
	let mgMax = rRange(4, 8)
	for (let i = 0; i < mgMax; i++) mgParams.push({'sin': rRange(0, 1) >= 0.5, a: rRange(0.01, 0.1), b: rRange(0.01, 0.03), c: rRange(-100, 100)})
	grd = ctx.createLinearGradient(0, 0, 0, c.height)
	grd.addColorStop(0.3, 'darkolivegreen')
	// Range for dark green to light green transition = [0.6, 0.8]
	grd.addColorStop(rRange(0.4, 0.5), 'darkgreen')
	ctx.fillStyle = grd
	ctx.beginPath()
	ctx.moveTo(0, h)
	// Range for step size = [20, 30]
	for (let x = 0; x <= w + 30; x += rRange(20, 30)) ctx.lineTo(x, mtn(x, mgParams, h / 2 + 20))
	ctx.lineTo(w, h)
	ctx.closePath()
	ctx.fill()

	// Foreground mountains
	// Range for a = [0.01, 0.07]
	// Range for b = [0.01, 0.03]
	// Range for c = [-100, 100]
	let fgParams = []
	// Range for number of functions = [4, 10]
	let fgMax = rRange(4, 10)
	for (let i = 0; i < fgMax; i++) fgParams.push({'sin': rRange(0, 1) >= 0.5, a: rRange(0.01, 0.07), b: rRange(0.01, 0.03), c: rRange(-100, 100)})
	grd = ctx.createLinearGradient(0, 0, 0, c.height)
	grd.addColorStop(0, 'lightgreen')
	// Range for dark green to light green transition = [0.7, 0.9]
	grd.addColorStop(rRange(0.7, 0.9), 'forestgreen')
	ctx.fillStyle = grd
	ctx.beginPath()
	ctx.moveTo(0, h)
	// Range for step size = [20, 30]
	for (let x = 0; x <= w + 30; x += rRange(20, 30)) ctx.lineTo(x, mtn(x, fgParams, h / 2 + 100))
	ctx.lineTo(w, h)
	ctx.closePath()
	ctx.fill()

	// Lake
	// Range for a = [0.06, 0.12]
	// Range for b = [0.004, 0.0045]
	// Range for c = [675, 725]
	let lParams = [
		{'sin': true, a: rRange(0.06, 0.12), b: rRange(0.004, 0.0045), c: rRange(675, 725)}
	]
	grd = ctx.createLinearGradient(0, 0, 0, c.height)
	// Range for dark blue to light blue transition = [0.75, 0.85]
	grd.addColorStop(rRange(0.75, 0.85), 'dodgerblue')
	grd.addColorStop(1, 'mediumblue')
	ctx.fillStyle = grd
	ctx.beginPath()
	ctx.moveTo(0, h)
	for (let x = 0; x <= w; x++) ctx.lineTo(x, mtn(x, lParams, h / 2 + 250))
	ctx.lineTo(w, h)
	ctx.closePath()
	ctx.fill()
}

function scaleRes() {
	let c = document.getElementById('mtn')
	c.style.height = `${Math.floor(c.offsetWidth / 2)}px`
}
