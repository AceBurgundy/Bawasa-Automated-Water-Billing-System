// session.js

const Store = require("electron-store")
const User = require("./models/User")
const crypto = require("crypto")

const SESSION_KEY = "user_session";

class SessionManager {

    constructor() {
        this.store = new Store();
    }

    login(userId) {
        const encryptedUserId = this.encrypt(userId);
        this.store.set(SESSION_KEY, encryptedUserId);
    }

    logout() {
        this.store.delete(SESSION_KEY);
    }

    async current_user() {
        const encryptedUserId = this.store.get(SESSION_KEY);
        if (encryptedUserId) {
            return await User.findByPk(this.decrypt(encryptedUserId));
        }
        return null;
    }

    encrypt(data) {
        const algorithm = "aes-256-gcm";
        const key = crypto.scryptSync("your-secret-key", "salt", 32);
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encryptedData = cipher.update(data, "utf8", "hex");
        encryptedData += cipher.final("hex");

        const tag = cipher.getAuthTag();
        const encryptedDataWithIV = `${iv.toString("hex")}:${encryptedData}:${tag.toString("hex")}`;
        return encryptedDataWithIV;
    }

    decrypt(encryptedDataWithIV) {
        const algorithm = "aes-256-gcm";
        const key = crypto.scryptSync("your-secret-key", "salt", 32);

        const [ivHex, encryptedDataHex, tagHex] =
            encryptedDataWithIV.split(":");
        const iv = Buffer.from(ivHex, "hex");
        const encryptedData = Buffer.from(encryptedDataHex, "hex");
        const tag = Buffer.from(tagHex, "hex");

        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        decipher.setAuthTag(tag); // Set the authentication tag

        let decryptedData = decipher.update(encryptedData, "binary", "utf8");
        decryptedData += decipher.final("utf8");

        return decryptedData;
    }

}

const session = new SessionManager()

module.exports = session;
