---
layout: readable
permalink: /devlogs/mountainscape/2
title: Look at that View!
css: /assets/styles/devlog.css
---
## Color Me Impressed

After the last devlog, all I needed to do to finish up an initial version of the mountain scape generator was to tweak the generation parameters and add a coloring system. I looked at some vector art and loved the look of a bluish haze over the layers of mountains. I wanted to make a flexible system that would allow me to choose between using solid colors or gradients.

```javascript
// mountains.js
if (gradient) {
	const gradient = context.createLinearGradient(0, 0, 0, height)
	gradient.addColorStop(0, colors[0])
	gradient.addColorStop(1, colors[1])
	context.fillStyle = gradient
} else {
	context.fillStyle = colors[0]
}
```

After adding adding this, I spent a little time tweaking generation parameters and color values and ended up with some pretty nice views ⛰🏔!

![](/assets/images/devlogs/mountainscape/devlog2/mountainscape.png){:.blog-image}
{:.center-column}

Feel free to check out the [code](https://github.com/Sammcb/MountainScape) and play around with the [generator](/MountainScape) and find your favorite mountain scape!

### Feedback
{:.feedback}

Thank you for reading! If you have any corrections, please create an [issue](https://github.com/Sammcb/Sammcb.github.io/issues/new/choose). If you have any general suggestions or feedback, check out my devlog [discussion](https://github.com/Sammcb/Sammcb.github.io/discussions/3)!
