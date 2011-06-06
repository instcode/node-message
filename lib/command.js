var Command = {
    // AUTHORIZATION
    CONNECT: "connect",
    // MESSAGE
    MESSAGE: "message",
    // STATUS
    UPDATE: "status",
    // ROOM
    LIST: "list",
    CREATE: "create", // CREATED (requester)
    JOIN: "join", // JOINED (requester), JOIN (other)
    LEAVE: "leave", // LEFT (other)
    MODIFY: "modify", // MODIFY
    INVITE: "invite" // INVITE (invitee)
}

module.exports = Command;
