.PHONY: help start stop run clean

# target: help - Display callable targets
help:
	@egrep "^# target:" Makefile | cut -c 10-

# target: start - Start the Docker containers
start:
	docker-compose up -d --build

# target: stop - Stop and destroy the running containers
stop:
	docker-compose down

# target: down - Stop and remove everything
down:
	docker-compose down --rmi 'all' -v
	docker container prune -f
	docker image prune -af
	docker volume prune -f

# target: run - Start the web server
run:
	bundle exec jekyll s

# target: clean - Clean build artifacts
clean:
	bundle exec jekyll clean
