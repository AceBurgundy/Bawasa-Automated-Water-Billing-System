
const userRelationshipTypes = {
    Single: "Single",
    Married: "Married",
    RatherNotSay: "Rather not say"
}

const userTypes = {
    Admin: "Admin",
    MeterReader: "Meter reader"
}

const connectionStatusTypes = {
    Connected: "Connected",
    DueForDisconnection: "Due for Disconnection",
    Disconnected: "Disconnected"
}

const validations = {
    relationshipOptions: [Object.values(userRelationshipTypes)],
    userOptions: [Object.values(userTypes)],
    connectionStatusOptions: [Object.values(connectionStatusTypes)],
};

// Export the constants and function based on the environment
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = {
        validations,
        userRelationshipTypes,
        userTypes,
        connectionStatusTypes,
    };
} else {
    window.validations = validations;
    window.userRelationshipTypes = userRelationshipTypes;
    window.userTypes = userTypes;
    window.connectionStatusTypes = connectionStatusTypes;
}
