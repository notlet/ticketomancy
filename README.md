# Ticketomancy
### simple single-server-oriented tickets bot for discord
made by [@notlet](https://discord.com/users/478480501649309708)

## Features
- Highly configurable and supports modals
- Not too complicated to set up
- Selfhosted
- Dockerized

## Setup instructions
1. Clone the repo.
2. Rename everything ending with `.example` in `config`.
3. Fill out the global config and add at least one ticket category.
4. Edit the files in the category config to suit your needs*. 
5. Set up a domain (and a reverse proxy) for your transcript server on port `3000` by default (changeable in `docker-compose.yml`), and specify it in your global config.
6. Add `[your domain]/oauth` in the Discord Developers panel under Application > OAuth2 > General > Redirects.
7. Run `docker compose up -d`**.
- Done! Run `update.sh` when new commits come out to automatically apply them.
---
- *If a category does not have a `modal.json`, it will not show a modal on creation.
- **If you want to fix/debug an issue or manually modify the database, run `docker compose -f docker-compose.dev.yml -d` to run the bot with the database port exposed and realtime codebase without needing to rebuild the container.

# Feedback and bug reports
If you want to suggest a feature or report a bug, please open a GitHub issue or pull request, or DM me directly on discord.