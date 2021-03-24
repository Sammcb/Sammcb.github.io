---
layout: title
permalink: /chesscolors
title: ChessColors
css: /assets/styles/chesscolors.css
js: /assets/scripts/chesscolors.js
onload: loadBoard()
onresize: resizeBoard()
---
<div id="inputs">
	<div class="input-group">
		Pieces
		<input id="pieceWhite" type="color" value="#ffffff" required oninput="theme()">
		<p id="pieceWhiteColor"></p>
		<input id="pieceBlack" type="color" value="#000000" required oninput="theme()">
		<p id="pieceBlackColor"></p>
	</div>
	<div class="input-group">
		Squares
		<input id="squareWhite" type="color" value="#c0c0c0" required oninput="theme()">
		<p id="squareWhiteColor"></p>
		<input id="squareBlack" type="color" value="#606060" required oninput="theme()">
		<p id="squareBlackColor"></p>
	</div>
</div>
<div id="board-container" class="center-column">
	<div id="board"></div>
</div>
