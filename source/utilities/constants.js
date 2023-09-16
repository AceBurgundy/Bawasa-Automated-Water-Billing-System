const userRelationshipTypes = {
    Single: "Single",
    Married: "Married",
    RatherNotSay: "Rather not say",
}

const connectionStatusTypes = {
    Connected: "Connected",
    DueForDisconnection: "Due for Disconnection",
    Disconnected: "Disconnected",
}

const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
]

const relationshipOptions = [Object.values(userRelationshipTypes)]
const connectionStatusOptions = [Object.values(connectionStatusTypes)]

// Export the constants and function based on the environment
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = {
        relationshipOptions,
        connectionStatusOptions,
        userRelationshipTypes,
        connectionStatusTypes,
    }
} else {
    window.months = months
    window.relationshipOptions = relationshipOptions
    window.connectionStatusOptions = connectionStatusOptions
    window.userRelationshipTypes = userRelationshipTypes
    window.connectionStatusTypes = connectionStatusTypes
}
