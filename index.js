require('dotenv').config(); // loads MEGA_EMAIL / MEGA_PASSWORD from a local .env file (harmless if the file doesn't exist, e.g. on hosts using config vars instead)
const express = require('express');
const app = express();
__path = process.cwd()
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;
let code = require('./pair');
require('events').EventEmitter.defaultMaxListeners = 500;
app.use('/code', code);
app.use('/pair',async (req, res, next) => {
res.sendFile(__path + '/pair.html')
})
app.use('/',async (req, res, next) => {
res.sendFile(__path + '/main.html')
})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(PORT, () => {
    console.log(`
Don't Forgot To Give Star SHAVIYA-MD

 Server running on http://localhost:` + PORT)
})

module.exports = app
