import express = require("express");
import http = require("http");
import Joi = require("joi");
import Mongo = require("mongodb");
import SocketIO = require("socket.io");

const messageSchema = Joi.object().keys({
    message: Joi.string()
        .min(1)
        .max(3000)
        .required()
});

const CSResponseSchema = messageSchema.keys({
    socketId: Joi.string().required()
});
export interface IMessage {
    message: string;
}
export interface ICSMessage extends IMessage {
    socketId: string;
}
const url = "mongodb://localhost:27017";

const dbName = "myproject";

export const appLogic = () => {
    return new Promise<http.Server>(async (resolve, reject) => {
        const app = express();
        const server = http.createServer(app);
        const port = process.env.PORT || 3000;

        app.get("/", (req, res) => res.send("Hello World!"));

        const io = SocketIO(server);
        const sockets: Set<SocketIO.Socket> = new Set();
        const CSSockets: Set<SocketIO.Socket> = new Set();
        io.on("connection", socket => {
            sockets.add(socket);
            socket.on("message", async (msg: IMessage) => {
                const validationResult = Joi.validate(msg, messageSchema);
                if (validationResult.error) {
                    socket.send({
                        message: `Error: ${validationResult.error.message}`
                    });
                } else {
                    const CSMessage: ICSMessage = {
                        message: msg.message,
                        socketId: socket.id
                    };
                    [...CSSockets].map(sock => {
                        sock.emit("CSMessage", CSMessage);
                    });
                    await messages.updateOne(
                        { socketId: socket.id },
                        {
                            $push: {
                                messages: {
                                    msg,
                                    sender: socket.id
                                }
                            },
                            $set: { unread: true }
                        },
                        { upsert: true }
                    );
                }
            });
            socket.on("authenticateAsCS", () => {
                // TODO: Add some kind of authentication
                CSSockets.add(socket);
            });
            socket.on("ActiveMessages", async () => {
                if (!CSSockets.has(socket)) {
                    socket.send({
                        message: `Error: Unauthorized`
                    });
                    return;
                }
                const activeConversations = await messages
                    .find(
                        { socketId: { $exists: true } },
                        { projection: { _id: 0 } }
                    )
                    .toArray();
                socket.emit("ActiveMessages", activeConversations);
            });
            socket.on("CSMessage", async (msg: ICSMessage) => {
                if (!CSSockets.has(socket)) {
                    socket.send({
                        message: `Error: Unauthorized`
                    });
                    return;
                }
                const validationResult = Joi.validate(msg, CSResponseSchema);
                if (validationResult.error) {
                    socket.send({
                        message: `Error: ${validationResult.error.message}`
                    });
                } else {
                    const result = await messages.findOneAndUpdate(
                        { socketId: msg.socketId },
                        {
                            $push: {
                                messages: msg.message
                            },
                            $set: {
                                sender: socket.id,
                                unread: false
                            }
                        }
                    );
                    const clientSocket = [...sockets].find(
                        s =>
                            result.value.socketId &&
                            s.id === result.value.socketId
                    );
                    if (clientSocket !== undefined) {
                        const message: IMessage = { message: msg.message };
                        await clientSocket.send(message);
                    }
                }
            });
            socket.on("close", async () => {
                sockets.delete(socket);
                CSSockets.delete(socket);
                await messages.updateOne(
                    { socketId: socket.id },
                    { $unset: { socketId: 1 } }
                );
            });
            /* … */
        });

        const mongoClient = new Mongo.MongoClient(url, {
            useNewUrlParser: true
        });
        let messages: Mongo.Collection;

        try {
            await mongoClient.connect();
            messages = mongoClient.db(dbName).collection("messages");
            await messages.createIndex({ socketId: 1 });
            await messages.updateMany({}, { $unset: { socketId: 1 } }); // in case of unclean shutdown
            server.listen(port, () => {
                resolve(server);
            });
        } catch (error) {
            reject(error);
        }
    });
};
