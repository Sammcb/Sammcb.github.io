---
layout: title
permalink: /mountains
title: Mountains
css: /assets/styles/mountains.css
js: /assets/scripts/mountains.js
onload: mtnGen()
onresize: scaleRes()
---
<div class="center-column">
	<a id="submit" onclick="mtnGen()">Generate mountainscape</a>
	<canvas id="mtn" />
</div>
