function themeInvalid() {
	const theme = document.getElementById('theme-error')
	const html = '<p>Theme invalid!</p>'
	theme.innerHTML = html
}

function loadTheme() {
	const theme = document.getElementById('theme')
	const url = new URL(window.location.href)
	const symbol = url.searchParams.get('symbol')
	const game = url.searchParams.get('game')

	if (symbol === null) {
		themeInvalid()
		return
	}

	const validGames = ['chess', 'reversi', 'checkers']
	if (!validGames.includes(game)) {
		themeInvalid()
		return
	}

	const colorKeys = colorKeysForGame(game)
	if (colorKeys.length < 1) {
		themeInvalid()
		return
	}

	const colors = colorKeys.map(colorKey => url.searchParams.get(colorKey)).filter(color => color !== null)
	if (colors.length < colorKeys.length) {
		themeInvalid()
		return
	}

	const colorHTMLs = colorKeys.map(colorKey => colorHTML(colorKey, url.searchParams.get(colorKey))).join('\n')
	const html = `
	<p>Game</p><p>${displayNameForGame(game)}</p>
	<p>Symbol</p><p>${symbol}</p>
	${colorHTMLs}
	`
	theme.innerHTML = html
}

function colorKeysForGame(game) {
	switch (game) {
	case 'chess':
		return ['pieceLight', 'pieceDark', 'squareLight', 'squareDark']
	case 'reversi':
		return ['pieceLight', 'pieceDark', 'borders', 'squares']
	case 'checkers':
		return ['pieceLight', 'pieceDark', 'squareLight', 'squareDark']
	default:
		return []
	}
}

function displayNameForColorKey(colorKey) {
	switch (colorKey) {
	case 'pieceLight':
		return 'Light pieces'
	case 'pieceDark':
		return 'Dark pieces'
	case 'squareLight':
		return 'Light squares'
	case 'squareDark':
		return 'Dark squares'
	case 'borders':
		return 'Borders'
	case 'squares':
		return 'Squares'
	default:
		return ''
	}
}

function displayNameForGame(game) {
	switch (game) {
	case 'chess':
		return 'Chess'
	case 'reversi':
		return 'Reversi'
	case 'checkers':
		return 'Checkers'
	default:
		return ''
	}
}

function colorHTML(colorKey, color) {
	const displayName = displayNameForColorKey(colorKey)
	const html = `
	<p>${displayName}</p>
	<div class="color-display" style="background: #${color};"></div>
	`
	return html
}
