import express = require("express");
import http = require("http");
import Joi = require("joi");
import Mongo = require("mongodb");
import SocketIO = require("socket.io");

const socketMessageSchema = Joi.object().keys({
    authorId: Joi.string(),
    channelId: Joi.string().required(),
    message: Joi.string()
        .min(1)
        .max(3000)
        .required()
});

export interface ISocketMessage {
    authorId?: string;
    channelId: string;
    message: string;
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
            socket.on("message", async (msg: ISocketMessage) => {
                const validationResult = Joi.validate(msg, socketMessageSchema);
                if (validationResult.error) {
                    socket.emit("error", {
                        message: validationResult.error.message
                    });
                    return;
                }
                if (!CSSockets.has(socket) && msg.channelId !== socket.id) {
                    socket.emit("error", {
                        message: "Wrong sender"
                    });
                    return;
                }
                msg.authorId = socket.id;

                [...CSSockets]
                    .filter(v => v.id !== socket.id)
                    .map(sock => {
                        sock.send(msg);
                    });
                const clientSocket = [...sockets].find(
                    v => v.id === msg.channelId && v.id !== socket.id
                );
                if (clientSocket) {
                    clientSocket.send(msg);
                }
                await messages.updateOne(
                    { channelId: msg.channelId },
                    {
                        $push: {
                            messages: {
                                author: msg.authorId,
                                value: msg.message
                            }
                        }
                    },
                    { upsert: true }
                );
            });
            socket.on("authenticateAsCS", () => {
                // TODO: Add some kind of authentication
                CSSockets.add(socket);
            });
            socket.on("ActiveMessages", async () => {
                if (!CSSockets.has(socket)) {
                    socket.emit("error", {
                        message: `Unauthorized`
                    });
                    return;
                }
                const activeConversations: Array<{
                    channelId: string;
                    messages: Array<{
                        value: string;
                        author: string;
                    }>;
                }> = await messages
                    .find(
                        { channelId: { $exists: true } },
                        { projection: { _id: 0 } }
                    )
                    .toArray();

                activeConversations
                    .map(v =>
                        v.messages.map(v2 => {
                            const retVal: ISocketMessage = {
                                authorId: v2.author,
                                channelId: v.channelId,
                                message: v2.value
                            };
                            return retVal;
                        })
                    )
                    .reduce((pv, cv) => {
                        pv.push(...cv);
                        return pv;
                    }, []);
                socket.emit("ActiveMessages", activeConversations);
            });

            socket.on("close", async () => {
                sockets.delete(socket);
                CSSockets.delete(socket);
                await messages.updateOne(
                    { channelId: socket.id },
                    { $unset: { channelId: 1 } }
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
            await messages.createIndex({ channelId: 1 });
            await messages.updateMany({}, { $unset: { channelId: 1 } }); // in case of unclean shutdown
            server.listen(port, () => {
                resolve(server);
            });
        } catch (error) {
            reject(error);
        }
    });
};
