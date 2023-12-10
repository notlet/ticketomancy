const express = require('express');
const fs = require('fs');
const zlib = require('zlib');

module.exports = () => {
    const app = express();
    app.get('/', (req, res) => res.redirect('https://notlet.dev'));

    app.get('/:id', (req, res) => {
        if (!fs.existsSync(`data/transcripts/${req.params.id}.html.gz`)) return res.sendStatus(404);
        res.contentType('text/html');
        res.send(zlib.gunzipSync(fs.readFileSync(`data/transcripts/${req.params.id}.html.gz`)).toString());
    });

    app.listen(3000);
}