const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
const path = require('path');
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    Browsers,
    makeCacheableSignalKeyStore,
    jidNormalizedUser,
    fetchLatestBaileysVersion
} = require('@dnuzi/baileys');
const { upload } = require('./mega');

let router = express.Router();

function removeFile(FilePath) {
    try {
        if (!fs.existsSync(FilePath)) return false;
        fs.rmSync(FilePath, { recursive: true, force: true });
    } catch (_) {}
}

// WhatsApp pairing code alphabet (no 0/O/1/I/L)
function generateCustomPairCode() {
    const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 8; i++) out += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    return out;
}

router.get('/', async (req, res) => {
    const id = makeid();
    const tempDir = path.join(__dirname, 'temp', id);
    let num = req.query.number;
    let finished = false; // session eka giya passe reconnect loop eka nawathanna

    async function SHAVIYA_X_MD() {
        try {
            const { state, saveCreds } = await useMultiFileAuthState(tempDir);
            const { version } = await fetchLatestBaileysVersion();
            const silent = pino({ level: "fatal" }).child({ level: "fatal" });

            let sock = makeWASocket({
                version,
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, silent),
                },
                printQRInTerminal: false,
                generateHighQualityLinkPreview: true,
                logger: silent,
                syncFullHistory: false,
                browser: Browsers.macOS("Safari")
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = String(num || '').replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(num, generateCustomPairCode());
                console.log('🔗 Pairing code:', code);
                if (!res.headersSent) res.send({ code });
            }

            sock.ev.on('creds.update', saveCreds);

            let handled = false; // "open" event eka 2 parak process wenna epa

            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    if (handled) return;
                    handled = true;
                    finished = true;

                    await delay(5000); // creds.json eka disk ekata save wenna tikak welawa denawa

                    const rf = path.join(tempDir, 'creds.json');
                    const ownJid = jidNormalizedUser(sock.user.id);

                    try {
                        const credsBuffer = fs.readFileSync(rf);

                        // 1) creds.json — MEGA ekata depend nowe, ewenna ona nisa mulinma
                        const credsMsg = await sock.sendMessage(ownJid, {
                            document: credsBuffer,
                            fileName: 'creds.json',
                            mimetype: 'application/json',
                            caption: '📎 creds.json — keep this file private.'
                        });
                        console.log("✅ creds.json sent");
                        await delay(1000);

                        // 2) creds.txt
                        await sock.sendMessage(ownJid, {
                            document: credsBuffer,
                            fileName: 'creds.txt',
                            mimetype: 'text/plain',
                            caption: '📎 creds.txt — same content, plain text.'
                        }, { quoted: credsMsg });
                        console.log("✅ creds.txt sent");
                        await delay(1000);

                        // 3) MEGA upload -> Session ID
                        try {
                            const safeName = String(sock.user.id).split(':')[0].split('@')[0] + '.json';
                            const mega_url = await upload(credsBuffer, safeName);
                            const string_session = mega_url.replace('https://mega.nz/file/', '');
                            const md = "shavi&" + string_session;

                            const sidMsg = await sock.sendMessage(ownJid, { text: md });
                            console.log("✅ Session ID sent");
                            await delay(1000);

                            const desc = `*Hey there, SHAVIYA-XMD user!* 👋🏻

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
                            }, { quoted: sidMsg });
                        } catch (megaErr) {
                            console.error("❌ MEGA upload failed:", megaErr);
                            await sock.sendMessage(ownJid, {
                                text: `⚠️ MEGA Session ID eka hadanna bari wuna.\n\nError: ${megaErr.message || megaErr}\n\ncreds.json eka uda evala tiyenawa — eka bot ekata use karanna puluwan.\nOwner ta: MEGA_EMAIL / MEGA_PASSWORD config vars check karanna.`
                            });
                        }
                    } catch (e) {
                        console.error("❌ Send failed:", e);
                    }

                    await delay(3000); // messages deliver wenna welawa
                    try { sock.ws.close(); } catch (_) {}
                    removeFile(tempDir);
                    console.log(`👤 ${sock.user?.id} ✅ session done`);

                } else if (
                    connection === "close" &&
                    !finished &&
                    lastDisconnect?.error?.output?.statusCode !== 401
                ) {
                    // pair success wunata passe WhatsApp eka restart (515) illanawa — reconnect
                    await delay(10);
                    SHAVIYA_X_MD();
                }
            });
        } catch (err) {
            console.log("service restarted:", err?.message || err);
            removeFile(tempDir);
            if (!res.headersSent) res.send({ code: "❗ Service Unavailable" });
        }
    }

    return await SHAVIYA_X_MD();
});

module.exports = router;
