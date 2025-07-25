.PHONY: build clean serve
.DEFAULT_GOAL: build

build:
	zola build

clean:
	rm -rf public

serve:
	zola serve

