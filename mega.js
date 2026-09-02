const mega = require("megajs");

// IMPORTANT: Use YOUR OWN MEGA account, not someone else's hardcoded credentials.
// Set these as environment variables (e.g. in a .env file, Heroku config vars,
// or your host's dashboard) instead of writing them directly in this file:
//
//   MEGA_EMAIL=your_own_mega_email@example.com
//   MEGA_PASSWORD=your_own_mega_password
//
// Never commit real credentials to a public repo.
const email = process.env.MEGA_EMAIL;
const password = process.env.MEGA_PASSWORD;

if (!email || !password) {
    console.warn(
        "⚠️  MEGA_EMAIL / MEGA_PASSWORD environment variables are not set. " +
        "Session upload to MEGA will fail until you configure your own MEGA account."
    );
}

const auth = {
    email,
    password,
    userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
};

/**
 * Uploads a readable stream to MEGA and resolves with the public share link.
 * @param {NodeJS.ReadableStream} readStream - e.g. fs.createReadStream(path)
 * @param {string} fileName - name to give the file on MEGA
 * @returns {Promise<string>} the MEGA share URL for the uploaded file
 */
function upload(readStream, fileName) {
    return new Promise((resolve, reject) => {
        try {
            const storage = new mega.Storage(auth, () => {
                const uploadStream = storage.upload({
                    name: fileName,
                    allowUploadBuffering: true,
                });

                readStream.pipe(uploadStream);

                uploadStream.on("complete", (file) => {
                    file.link((err, url) => {
                        if (err) {
                            storage.close();
                            return reject(err);
                        }
                        storage.close();
                        resolve(url);
                    });
                });

                uploadStream.on("error", (err) => {
                    storage.close();
                    reject(err);
                });
            });

            storage.on("error", (err) => reject(err));
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = { upload };
