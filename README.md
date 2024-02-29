# Ticketomancy
### simple single-server-oriented tickets bot for discord
made by [@notlet](https://discord.com/users/478480501649309708)

## Features
- Fully customizable messages, modals and ticket greeters.
- Not complicated to set up
- Selfhosted
- Dockerized

## Setup instructions
1. Clone the repo.
2. Rename `config.example.json` to `config.json` and `templates.example` to `templates`
3. Fill out your config and add at least one ticket category.
4. Edit the files in your `templates` directory to suit your needs*. 
5. Set up a domain for your transcript server at port `3000` by default (changeable in `docker-compose.yml`), and specify it in your `config.json`, and add `[your domain]/oauth` to your Application > OAuth2 > General > Redirects.
6. Run `docker compose up -d`**.
7. Done! Run `update.sh` when new commits come out to automatically apply them.
---
- *If a category does not have a respective file in `templates/modals`, it will not show a modal on creation.
- **If you want to fix an issue or manually modify the database, run `docker compose -f docker-compose.dev.yml -d` to run the bot with exposed database port and live code updating (restarting container with no need to rebuild)

# Feedback and bug reports
If you want to suggest a feature or report a bug, please open a GitHub issue or pull request, or DM me directly on discord.