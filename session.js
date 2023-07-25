// session.js

const Store = require("electron-store")
const User = require("./models/User")
const crypto = require("crypto")

const SESSION_KEY = "user_session";

class SessionManager {

    constructor() {
        this.store = new Store();
    }

    login(access_key) {
        this.store.set(SESSION_KEY, access_key);
    }

    logout() {
        this.store.delete(SESSION_KEY);
    }

    async current_user() {
        const access_key = this.store.get(SESSION_KEY);
        if (access_key) {
            return await User.findOne({
                where: { 
                    access_key: access_key
                }
            });
        }
        return null;
    }

}

const session = new SessionManager()

module.exports = session;
