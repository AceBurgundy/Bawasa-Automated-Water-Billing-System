const Store = require('electron-store')

const UserPhoneNumber = require('../../models/UserPhoneNumber')
const UserAddress = require('../../models/UserAddress')
const User = require('../../models/User')

const SESSION_KEY = 'user_session'

/**
 * Manages user sessions using Electron Store.
 * @private
 * @class
 */
class SessionManager {

    /**
     * Creates an instance of SessionManager.
     * @constructor
     */
    constructor() {
        this.store = new Store()
   }

    /**
     * Logs in a user by storing the access key in the session.
     * @method
     * @param {string} accessKey - The access key associated with the user.
     */
    login(accessKey) {
        this.store.set(SESSION_KEY, accessKey)
   }

    /**
     * Logs out the current user by clearing the session.
     * @method
     */
    logout() {       
        this.store.clear()
   }

    /**
     * Retrieves the current user based on the stored access key.
     * @async
     * @method
     * @throws {Error} Throws an error if there is an issue retrieving the user information.
     * @returns {Promise<Object|null>} A Promise that resolves to the user object or null if the access key is not found.
     */
    async currentUser() {
        
        const accessKey = this.store.get(SESSION_KEY)

        if (!accessKey) {
            console.log('Access key not found');
            return null
       }

        try {

            const user = await User.findOne({
                where: {
                    accessKey: accessKey 
               },
                attributes: {
                    exclude: [
                        'password',
                        'updatedAt',
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
                        as: 'mainAddress'
                   },
                    {
                        model: UserAddress, 
                        as: 'presentAddress'
                   },
                ],
           })
            
            return user ? user.toJSON() : null

       } catch(error) {
            console.log(error);
            return null
       }         

   }

}

/**
 * Default instance of the SessionManager class.
 * @const {Object}
 */
const session = new SessionManager()

module.exports = session
