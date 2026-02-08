+++
title = "ASCII art and single sources of truth"
description = "My first experiences with ASCII art."
date = 2026-02-08
updated = 2026-02-08

[taxonomies]
projects = ["website"]
art = ["ascii"]

[extra]
stylesheets = ["/readable.css", "/blog.css"]
+++
## Tiny art

Recently, I was inspired to try and make a new homepage artwork for my website. I aim for my site to be lightweight, but I was loading in a pretty large image for my homepage. I do use optimizations like `decoding="async"` to load images asynchronously and `loading="lazy"` to ensure images are only loaded when they need to be viewed, but it still felt like the image was adding a lot of weight to my landing page without adding much value.

I've known about sites like [The 512KB Club](https://512kb.club), which encourage web developers to focus on cutting bloat and improving performance, and wanted to see if I could create a cool piece of art while also keeping its size as small as possible. Originally, I planned to create some pixel art as it's one of my favorite art styles, but while thinking about what to make I had another idea: I could make some [ASCII art](https://en.wikipedia.org/wiki/ASCII_art)!

## ASCII-use me?

Broadly, ASCII art is a term used to refer to art made with text. Technically, [ASCII](https://en.wikipedia.org/wiki/ASCII) only includes a specific set of printable characters, but nowadays I would label any text-based art as ASCII art. ASCII art is pretty similar to pixel art. It usually uses a small canvas with a limited "pallet" of characters, and commonly resembles 1-bit (2 color) pixel art due to a lack of color (though depending on the program displaying the art, it can be colored as well). Because it can just be text, an ASCII artwork would also be one of the smallest visuals I could load on my homepage.

I'd never attempted to create any ASCII art beyond simple emoticons and a few small animations for some text-based games. I love mountain scapes. My favorite mountain (for all time and forever `<3`) is Mt. Hood, so of course I had to draw? (paint? type?) it! I started by finding some reference images to use. Personally, I found it easiest to begin by making the outline and then filling in with shading. I chose to stick with the traditional ASCII pallet, mainly because larger character sets felt overwhelming and were hard to type due to not having dedicated keyboard keys. Overall, I was really happy with how it turned out!

## Probably overthinking things

My main concern with using ASCII art for my homepage was the potential for text wrapping on small width displays. This got me thinking about what fundamentally "defined" my ASCII art. As a software engineer, this issue felt very similar to [single source of truth (SSOT)](https://en.wikipedia.org/wiki/Single_source_of_truth) problems I encounter when architecting systems. Should I accept that the ASCII art might not look correct if a display is too thin and just treat the SSOT as text, or should the SSOT be the way the art looked to me, using a particular monospaced font on my display?

I gave this some thought, and decided that one of the aspects I love about ASCII art _is_ that it is just text and can be easily copied and displayed anywhere text input is supported. However, for my homepage I really wanted to prevent the art from "breaking" as that could be confusing to visitors. Unfortunately, there is no way currently to scale text fonts dynamically to fit their container using just CSS, though hopefully this will change soon. I could have a number of pre-defined CSS media queries to change the font size or use JavaScript to dynamically recalculate the font size based on the window width, but neither of these options felt "clean" to me (and I want to avoid requiring JavaScript for my website). I tried using [SVG text elements](https://www.w3.org/TR/SVG2/text.html), which did scale with the SVG (yay! `:)`), but required hardcoding vertical spacing between lines (boo `:(`). Because I had to manually set the pixel spacing between lines, I was concerned this might break the look of the art depending on which monospace font was used to render the text. My website does not include or require a specific font, and instead simply directs the browser to use the system monospace font.

Ultimately, I decided to sacrifice the extremely small size and convert the text to SVG paths and simply treat the artwork as an SVG. This ensures the artwork will look consistent regardless of rendering variables like screen width or font. The only downside was that users wouldn't be able to copy the text to use it elsewhere. I mitigated this by sharing both the plaintext and SVG versions on my Art page. The best of both worlds! I still consider the plaintext version to be the "real" source of truth, but making both available is a nice convenience.

## Final thoughts

I hope you enjoyed reading this! While maybe not the most riveting of posts, I found the question about what fundamentally defines an ASCII art piece (and digital art in general) interesting to mull over. I'm sure every artist has their own thoughts, and I believe the answer is unique to each individual. ASCII was definitely a fun style to work with and I encourage everyone to give it a try, even if it's just making some fun emoticons `\o/`!
