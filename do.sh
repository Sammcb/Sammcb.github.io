#!/bin/sh

print_info() {
	printf "\e[1;35m$1\e[0m - \e[0;37m$2\e[0m\n"
}

help() {
	print_info help "Display callable targets"
	print_info up "Start Docker containers"
	print_info down "Stop and destroy running containers"
	print_info clean "Stop and aggressively remove everything"
	print_info init "Install gems"
	print_info update "Update all gems"
	print_info build "Build site files"
	print_info run "Start the web server"
	print_info server_clean "Clean build artifacts"
}

up() {
	docker compose up -d --build
}

down() {
	docker compose down
}

clean() {
	docker compose down --rmi 'all' -v --remove-orphans
	docker container prune -f
	docker image prune -af
	docker volume prune -f
	docker system prune -f
}

init() {
	bundle install
}

update() {
	bundle update --all
}

build() {
	jekyll b --disable-disk-cache
}

run() {
	jekyll s
}

server_clean() {
	jekyll clean
	rm -f Gemfile.lock
}

if [ ${1:+x} ]; then
	$1
else
	help
fi
