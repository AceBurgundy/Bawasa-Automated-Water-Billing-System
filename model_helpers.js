const UserRelationshipTypes = {
    Single: "Single",
    Married: "Married",
    RatherNotSay: "Rather not say"
}

const UserTypes = {
    Admin: "Admin",
    MeterReader: "Meter reader"
}

const ConnectionStatusTypes = {
    Connected: "Connected",
    DueForDisconnection: "Due for Disconnection", 
    Disconnected: "Disconnected"
}

const validations = {
    relationshipOptions: [["Single", "Married", "Rather not say"]],
    userOptions: [["Admin", "Meter reader"]],
    connectionStatusOptions: [
        ["Connected", "Due for Disconnection", "Disconnected"],
    ],
};

const defaults = {
    generateNextAccountNumber: async function () {
        const lastClient = await Client.findOne({
            order: [["createdAt", "DESC"]],
        });

        if (!lastClient) {
            return "0000-AA";
        }

        let nextNumber = "0000";
        let nextLetter = "AA";

        const lastAccountNumber = lastClient.account_number;
        const lastNumberPart = parseInt(lastAccountNumber.slice(0, 4), 10);
        const lastLetterPart = lastAccountNumber.slice(5);

        if (lastNumberPart === 9999) {
            nextNumber = "0000";

            const lastLetterCharCode = lastLetterPart.charCodeAt(1);

            lastLetterCharCode === 90
                ? (nextLetter = "AA")
                : (nextLetter =
                      "A" + String.fromCharCode(lastLetterCharCode + 1));
        } else {
            nextNumber = String("0000" + (lastNumberPart + 1)).slice(-4);
            nextLetter = lastLetterPart;
        }

        return `${nextNumber}-${nextLetter}`;
    },
};

module.exports = {
    validations,
    defaults,
    UserRelationshipTypes,
    UserTypes,
    ConnectionStatusTypes
};
