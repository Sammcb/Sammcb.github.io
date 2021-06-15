.PHONY: help up down clean run server-clean

# target: help - Display callable targets
help:
	@egrep "^# target:" Makefile | cut -c 10-

# target: up - Start the Docker containers
up:
	docker compose up -d --build

# target: down - Stop and destroy the running containers
down:
	docker compose down

# target: clean - Stop and aggressively remove everything
clean:
	docker compose down --rmi 'all' -v --remove-orphans
	docker container prune -f
	docker image prune -af
	docker volume prune -f
	docker system prune -f

# target: run - Start the web server
run:
	bundle exec jekyll s

# target: server-clean - Clean build artifacts
server-clean:
	bundle exec jekyll clean
