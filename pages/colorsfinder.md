---
layout: readable-centered
permalink: /colorsfinder
title: ColorsFinder
css: /assets/styles/colorsfinder.css
js: /assets/scripts/colorsfinder.js
---
<div id="inputs">
	<input id="color1" class="color-input" type="color">
	<input id="color2" class="color-input" type="color">
	<input id="steps" type="number" value="0" min="0" max="254">
</div>
<br>
<button id="submit" onclick="findColors()">Find colors</button>
<div id="result"></div>
