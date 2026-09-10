const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers, makeCacheableSignalKeyStore, getAggregateVotesInPollMessage, DisconnectReason, WA_DEFAULT_EPHEMERAL, jidNormalizedUser, proto, getDevice, generateWAMessageFromContent, fetchLatestBaileysVersion, makeInMemoryStore, getContentType, generateForwardMessageContent, downloadContentFromMessage, jidDecode } = require('@whiskeysockets/baileys')

const { upload } = require('./mega');
function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}
router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;
    async function SHAVIYA_X_MD() {
        const {
            state,
            saveCreds
        } = await useMultiFileAuthState('./temp/' + id);
        try {
var items = ["Safari"];
function selectRandomItem(array) {
  var randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}
var randomItem = selectRandomItem(items);
            
            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                generateHighQualityLinkPreview: true,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                syncFullHistory: false,
                browser: Browsers.macOS(randomItem)
            });
            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }
            sock.ev.on('creds.update', saveCreds);
            sock.ev.on("connection.update", async (s) => {

    const {
                    connection,
                    lastDisconnect
                } = s;
                
                if (connection == "open") {
                    await delay(5000);
                    let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    let rf = __dirname + `/temp/${id}/creds.json`;
                    function generateRandomText() {
                        const prefix = "3EB";
                        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                        let randomText = prefix;
                        for (let i = prefix.length; i < 22; i++) {
                            const randomIndex = Math.floor(Math.random() * characters.length);
                            randomText += characters.charAt(randomIndex);
                        }
                        return randomText;
                    }
                    const randomText = generateRandomText();
                    try {


                        
                        const { upload } = require('./mega');
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        let md = "shavi&" + string_session;
                        const ownJid = jidNormalizedUser(sock.user.id); // strip the ":device" suffix so it lands in the real inbox
                        console.log("📤 Sending session ID to:", ownJid);

                        // 1) Session ID as plain text
                        let code = await sock.sendMessage(ownJid, { text: md });
                        console.log("✅ Session ID text sent, id:", code?.key?.id);
                        await delay(1000);

                        // 2) creds.json sent as a real .json document attachment
                        const credsBuffer = fs.readFileSync(rf);
                        await sock.sendMessage(ownJid, {
                            document: credsBuffer,
                            fileName: 'creds.json',
                            mimetype: 'application/json',
                            caption: '📎 creds.json — keep this file private.'
                        }, { quoted: code });
                        console.log("✅ creds.json document sent");
                        await delay(1000);

                        // 3) Same content again as a .txt document (some users prefer plain .txt)
                        await sock.sendMessage(ownJid, {
                            document: credsBuffer,
                            fileName: 'creds.txt',
                            mimetype: 'text/plain',
                            caption: '📎 creds.txt — same content as creds.json, plain text format.'
                        }, { quoted: code });
                        console.log("✅ creds.txt document sent");
                        await delay(1000);

                        let desc = `*Hey there, SHAVIYA-XMD user!* 👋🏻

✅ Your session has been created successfully.

🔐 *Session ID:* Sent above  
⚠️ *Do NOT share this ID*

——————
📢 WhatsApp Channel : 👽

💬 Support : +94707085822

——————
> © Powered by SHAVIYA-XMD 🛟`; 
                        await sock.sendMessage(ownJid, {
text: desc,
contextInfo: {
externalAdReply: {
title: "SHAVIYA-XMD",
thumbnailUrl: "https://files.catbox.moe/eqmiio.jpg",
sourceUrl: "https://wa.me/message/MO4VBJYTBKUOD1",
mediaType: 1,
renderLargerThumbnail: true
}  
}
},
{quoted:code })
                    } catch (e) {
                            // Log the real error server-side so you can actually debug it
                            console.error("❌ Session upload/send failed:", e);
                            try {
                                await sock.sendMessage(jidNormalizedUser(sock.user.id), {
                                    text: `⚠️ Session generation failed.\n\nError: ${e.message || e}\n\nCheck your MEGA_EMAIL / MEGA_PASSWORD env vars and server logs.`
                                });
                            } catch (e2) {
                                console.error("❌ Even the error-notification message failed to send:", e2);
                            }
                    }
                    await delay(10);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    console.log(`👤 ${sock.user.id} 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱 ✅ 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝗽𝗿𝗼𝗰𝗲𝘀𝘀...`);
                    await delay(10);
                    process.exit();
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10);
                    SHAVIYA_X_MD();
                }
            });
        } catch (err) {
            console.log("service restated");
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "❗ Service Unavailable" });
            }
        }
    }
   return await SHAVIYA_X_MD();
});/*
setInterval(() => {
    console.log("☘️ 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝗽𝗿𝗼𝗰𝗲𝘀𝘀...");
    process.exit();
}, 180000); //30min*/
module.exports = router;
