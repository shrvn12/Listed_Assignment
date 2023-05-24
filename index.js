const express = require('express');
const axios = require('axios');
const qs = require('qs');
const fs = require('fs');
const credentials = require('./credentials.json');
const { Autoreply } = require('./gmail');

const app = express();

app.use(express.json());

app.get('/',(req, res) => {
    res.sendFile(`${__dirname}/index.html`);
})

app.get('/gmaiListed', async (req, res) => {
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?scope=https://mail.google.com&access_type=offline&redirect_uri=http://localhost:7000/gamiListed/auth&response_type=code&client_id=${credentials.client_id}`)
})

app.get('/gamiListed/auth',(req, res) => {
    const {code} = req.query;
    credentials.code = code;
    fs.writeFileSync(`${__dirname}/credentials.json`,JSON.stringify(credentials));
    Autoreply();
    res.sendFile(`${__dirname}/auth.html`);
})

app.listen(7000,() => {
    console.log('Server is running at 7000');
})
