---
layout: readable
permalink: /art
title: Art
---
These are some digital artworks I made while practicing with vector graphics and pixel art.

{% for artwork in site.art %}
[{{ artwork.title }} • {{ artwork.year }}]({{ artwork.url }})
{% endfor %}
