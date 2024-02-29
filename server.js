const express = require('express');
const session = require('cookie-session');
const ratelimit = require('express-rate-limit');
const axios = require('axios');
const fs = require('fs');
const zlib = require('zlib');
const config = require('./config.json');
const { dbs } = require('./ticketomancy.js');

module.exports = () => {
    const app = express();

    app.use(ratelimit({
        windowMs: 10 * 60 * 1000,
        max: 100
    }))

    app.use(session({
        secret: config.keys.cookie,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: true },
        maxAge: 864e6
    }));

    app.get('/', (req, res) => res.redirect('https://github.com/notlet/ticketomancy'));

    app.get('/oauth', async (req, res) => {
        if (Object.keys(req.query).length < 1) return res.send("<script>window.location.href = window.location.href.replace('#', '?')</script>");

        if (!req.query.access_token) return res.status(400).redirect('https://notlet.dev/error?code=400&nohome=1');
        req.session.token = req.query.access_token;
        req.session.token_type = req.query.token_type;
        req.session.authorized = true;
        let redirect = req.session.redirect;
        delete req.session.redirect;

        return redirect ? res.redirect(redirect) : res.redirect('https://notlet.dev/error?code=200&nohome=1');
    })

    app.get('/transcript/:id', async (req, res) => {
        const filepath = /^\d+$/.test(req.params.id) ? `data/transcripts/${req.params.id}.html.br` : null;

        if (!filepath || !fs.existsSync(filepath)) return res.status(404).redirect('https://notlet.dev/error?code=404&nohome=1');
        if (!req.session.authorized) {
            req.session.redirect = `${config.url}/transcript/${req.params.id}`;
            return res.redirect(`https://discord.com/oauth2/authorize?client_id=${config.keys.discord.clientID}&response_type=token&redirect_uri=${encodeURIComponent(`${config.url}/oauth`)}&scope=identify%20guilds.members.read`)
        }

        const memberData = await axios.get(`https://discord.com/api/users/@me/guilds/${config.tickets.server}/member`, {
            headers: { Authorization: `${req.session.token_type} ${req.session.token}` }
        }).catch(() => {});
        if (!memberData?.data) return;

        const ticket = await dbs.a.findOne({ channel: req.params.id });
        if (!ticket) return res.status(404).redirect('https://notlet.dev/error?code=404&nohome=1');
        if (!config.tickets.categories[ticket.type].team.map(r => memberData.data.roles.includes(r)).includes(true) && ticket.user !== memberData.data.user.id) return res.status(403).redirect('https://notlet.dev/error?code=403&nohome=1');

        res.contentType('text/html');
        res.send(zlib.brotliDecompressSync(fs.readFileSync(filepath)).toString());
    });

    app.listen(3000);
}
