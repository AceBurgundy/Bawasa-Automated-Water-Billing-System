const Store = require("electron-store")

const UserPhoneNumber = require("../../models/UserPhoneNumber")
const UserAddress = require("../../models/UserAddress")
const User = require("../../models/User")

const SESSION_KEY = "user_session"

class SessionManager {

    constructor() {
        this.store = new Store()
    }

    login(accessKey) {
        this.store.set(SESSION_KEY, accessKey)
    }

    logout() {        
        this.store.clear()
    }

    async current_user() {
        const accessKey = this.store.get(SESSION_KEY)

        if (!accessKey) {
            console.log("\n\nAccess key not found\n\n");
            return null
        }

        try {

            const user = await User.findOne({ 
                where: { 
                    accessKey: accessKey 
                },
                attributes: {
                    exclude: [
                        "password",
                        "updatedAt",
                    ]
                },
                include: [
                    {
                        model: UserPhoneNumber,
                        as: 'phoneNumbers',
                        order: [
                            ['createdAt', 'DESC']
                        ],
                        limit: 1,
                    },
                    { 
                        model: UserAddress, 
                        as: "mainAddress"
                    },
                    { 
                        model: UserAddress, 
                        as: "presentAddress"
                    },
                ],
            })
            
            if (user) {
                return user.toJSON()
            } else {
                return null
            }

        } catch(error) {
            console.log(error);
        }         

    }

}

const session = new SessionManager()

module.exports = session
