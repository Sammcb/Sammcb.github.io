---
layout: readable
permalink: /blog
title: Blog
css: list
---
### MountainScape
{% assign articles = site.blog | where_exp: "article", "article.project == 'MountainScape'" %}
{% for article in articles %}
[{{ article.title }}]({{ article.url }})
{% endfor %}

### Anniversary
{% assign articles = site.blog | where_exp: "article", "article.project == 'Anniversary'" %}
{% for article in articles %}
[{{ article.title }}]({{ article.url }})
{% endfor %}
