const RecoveryCode = require("../../../models/RecoveryCode")

const response = require("../../utilities/response")

const bcrypt = require("bcrypt")
const crypto = require("crypto")

/**
 * Generates a secure access key.
 * 
 * @async
 * @returns {string} - A securely generated access key.
 * @usage
 * const accessKey = generateAccessKey();
 * console.log(accessKey); // Output: 'generatedAccessKey'
 */
async function generateAccessKey() {
    const randomString = crypto.randomBytes(32).toString("hex")
    const hash = bcrypt.hashSync(randomString, 10)
    return hash.slice(0, 64)
}

/**
 * Generates recovery codes for a user and stores them securely.
 *
 * @async
 * @param {string} userId - The ID of the user for whom recovery codes are generated.
 * @param {Transaction} manager - The database transaction manager.
 * @returns {Response} A response object with success status and recovery codes.
 * @throws {Response} An response object with failed status if code generation or storage fails.
 * @usage
 * ```
 * const userId = "user123";
 * const manager = // Obtain the database transaction manager;
 * 
 * try {
 *    const result = await generateRecoveryCodes(userId, manager);
 *    console.log(result); // Output: { success: true, recoveryCodes: ['code1', 'code2', ...] }
 * } catch (error) {
 *    console.error(error); // Output: { error: 'Failed to add recovery codes' }
 * }
 * ```
 */
async function generateRecoveryCodes(userId, manager) {
    
    const characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const promises = [];
    const codes = []

    for (let outer = 0; outer < 12; outer++) {

        const code = Array.from({ length: 8 }, () => characters[Math.floor(Math.random() * characters.length)]).join('');

        codes.push(code)

        const insertNewCodePromise = RecoveryCode.create({
            code: await bcrypt.hash(code, 10),
            userId: userId
        }, { transaction: manager })

        promises.push(insertNewCodePromise);
    }

    try {

        await Promise.all(promises);
        return response.success().addObject("recoveryCodes", codes).getResponse();
    
    } catch (error) {
        console.log(error);
        return response.Error(`Failed to add recovery codes`)
    }

}

module.exports = {
    generateRecoveryCodes,
    generateAccessKey
}