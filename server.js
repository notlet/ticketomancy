const express = require('express');
const session = require('cookie-session');
const axios = require('axios');
const fs = require('fs');
const zlib = require('zlib');
const config = require('./config.json');

module.exports = () => {
    const app = express();
    app.use(session({ 
        secret: config.keys.cookie,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: true },
        maxAge: 864e6
    }));

    app.get('/', (req, res) => res.redirect('https://notlet.dev'));

    app.get('/oauth', async (req, res) => {
        if (Object.keys(req.query).length < 1) return res.send("<script>window.location.href = window.location.href.replace('#', '?')</script>");

        if (!req.query.access_token) return res.status(400).redirect('https://notlet.dev/error?code=400&nohome=1');
        req.session.token = req.query.access_token;
        req.session.token_type = req.query.token_type;
        req.session.authorized = true;
        redirect = req.session.redirect;
        delete req.session.redirect;

        return redirect ? res.redirect(redirect) : res.redirect('https://notlet.dev/error?code=200&nohome=1');
    })

    app.get('/transcript/:id', async (req, res) => {
        if (!fs.existsSync(`data/transcripts/${req.params.id}.html.br`)) return res.status(404).redirect('https://notlet.dev/error?code=404&nohome=1');
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
        if (!config.tickets.categories[ticket.type].team.map(r => memberData.data.roles.includes(r)).includes(true)) return res.status(403).redirect('https://notlet.dev/error?code=403&nohome=1');

        res.contentType('text/html');
        res.send(zlib.brotliDecompressSync(fs.readFileSync(`data/transcripts/${req.params.id}.html.br`)).toString());
    });

    app.listen(3000);
}