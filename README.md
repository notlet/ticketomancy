# Ticketomancy
### simple single-server-oriented tickets bot for discord
made by [@notlet](https://discord.com/users/478480501649309708)

## Features
- Highly configurable and supports modals
- Not too complicated to set up
- Selfhosted
- Dockerized

## Setup instructions
1. Download the [compose file](https://github.com/notlet/ticketomancy/blob/main/docker-compose.yml).

2. Create `config` and `data` directories.

3. Download the [example global config](https://github.com/notlet/ticketomancy/blob/main/config/global.example.json) into the newly created `config` directory and fill it out.

4. Create at least one category, relying on [the examples](https://github.com/notlet/ticketomancy/tree/main/config/categories.example).
- If a category does not have a `modal.json`, it will simply not show a modal on creation. If there are no `fields.json`, the output in ticket will show the IDs instead.
5. Set up at least one panel, relying on [the examples](https://github.com/notlet/ticketomancy/tree/main/config/categories.example).

6. Set up a domain (and a reverse proxy) for your transcript server on port `3000` by default (changeable in `docker-compose.yml`), and fill it in your global config.
- For testing you can use `http://localhost:3000`.

7. Add `https://[your domain]/oauth` in the Discord Developers panel under Application > OAuth2 > General > Redirects.

8. Run `docker compose up -d`.
- Done! Make sure to run `update.sh` when new updates come out to automatically apply them.
---



# Feedback and bug reports
If you want to suggest a feature or report a bug, please open a GitHub issue or pull request, or DM me directly on discord.