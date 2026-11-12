const mega = require("megajs");

// MEGA account eka .env / Heroku Config Vars walin set karanna:
//   MEGA_EMAIL=your_mega_email
//   MEGA_PASSWORD=your_mega_password

const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36";

/**
 * Buffer (or Readable stream) ekak MEGA ekata upload karala public link eka denawa.
 * Hamawelema reject/resolve wenawa (hang wenne nah), timeout ekak ekka.
 */
function upload(data, fileName, timeoutMs = 45000) {
    return new Promise(async (resolve, reject) => {
        const email = (process.env.MEGA_EMAIL || "").trim();
        const password = process.env.MEGA_PASSWORD || "";

        if (!email || !password) {
            return reject(new Error("MEGA_EMAIL / MEGA_PASSWORD env vars set karala nah"));
        }

        // stream ekak awoth buffer ekakata harawanna
        let buffer = data;
        if (!Buffer.isBuffer(data)) {
            try {
                const chunks = [];
                for await (const c of data) chunks.push(Buffer.from(c));
                buffer = Buffer.concat(chunks);
            } catch (e) {
                return reject(e);
            }
        }

        let storage;
        let settled = false;
        const finish = (err, url) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            try { storage && storage.close(); } catch (_) {}
            err ? reject(err instanceof Error ? err : new Error(String(err))) : resolve(url);
        };
        const timer = setTimeout(
            () => finish(new Error("MEGA upload timeout (login/upload hang wuna)")),
            timeoutMs
        );

        try {
            // IMPORTANT: hama upload ekakatama aluth auth object ekak.
            // megajs login ekedi `password` eka delete karanawa, so shared object ekak
            // use kaloth 2 weni session eken passe login fail wenawa.
            storage = new mega.Storage({ email, password, userAgent: UA }, (err) => {
                if (err) return finish(err); // <- kalin me error eka ignore wela tibuna

                try {
                    storage.upload({ name: fileName, size: buffer.length }, buffer, (upErr, file) => {
                        if (upErr) return finish(upErr);
                        file.link((linkErr, url) => finish(linkErr, url));
                    });
                } catch (e) {
                    finish(e);
                }
            });
            storage.on("error", (e) => finish(e));
        } catch (e) {
            finish(e);
        }
    });
}

module.exports = { upload };
