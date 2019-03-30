import express = require("express");
import http = require("http");
import Joi = require("joi");
import Mongo = require("mongodb");
import SocketIO = require("socket.io");
import {
    ISocketMessage,
    socketMessageSchema,
    IConversation
} from "../communicationModels/schemas";

const url = process.env.CONNECTIONSTRING || "mongodb://chat-mongodb:27017";
const port = process.env.PORT || 3000;
const dbName = process.env.DBNAME || "simple-chat";

const sockets: Set<SocketIO.Socket> = new Set();
const CSSockets: Set<SocketIO.Socket> = new Set();
let messages: Mongo.Collection;

export const appLogic = () => {
    return new Promise<http.Server>(async (resolve, reject) => {
        const app = express();
        const server = http.createServer(app);

        serveStaticFiles(app);

        const io = SocketIO(server);

        io.on("connection", socket => {
            handleCommunication(socket);
        });

        try {
            await connectToMongo();
            server.listen(port, () => {
                resolve(server);
            });
        } catch (error) {
            reject(error);
        }
    });
};

function serveStaticFiles(app: any) {
    app.use("/client", express.static("public/client.html"));
    app.use("/host", express.static("public/host.html"));
    app.use("/bundle.js", express.static("dist/bundle.js"));
    app.use("/bundle.js.map", express.static("dist/bundle.js.map"));
}

function handleCommunication(socket: SocketIO.Socket) {
    sockets.add(socket);
    socket.on("message", async (msg: ISocketMessage) => {
        if (!validateMessage(msg, socket)) {
            return;
        }
        msg.authorId = socket.id;
        await forwardMessage(msg, socket);
    });
    socket.on("authenticateAsCS", () => {
        // TODO: Add some kind of authentication
        CSSockets.add(socket);
        socket.emit("authenticateAsCS");
    });
    socket.on("ActiveMessages", async () => {
        if (!CSSockets.has(socket)) {
            socket.emit("appError", {
                message: `Unauthorized`
            });
            return;
        }
        const activeConversations = await getActiveConversations();
        socket.emit("ActiveMessages", activeConversations);
    });
    socket.on("disconnect", async () => {
        sockets.delete(socket);
        CSSockets.delete(socket);
        [...CSSockets].map(v => v.emit("conversationEnded", socket.id));
        await messages.updateOne(
            { channelId: socket.id },
            { $unset: { channelId: 1 } }
        );
    });
}

async function connectToMongo() {
    const mongoClient = new Mongo.MongoClient(url, {
        useNewUrlParser: true,
        autoReconnect: true
    });

    await mongoClient.connect();

    messages = mongoClient.db(dbName).collection("messages");
    await messages.createIndex({ channelId: 1 }, { sparse: true });
    await messages.updateMany({}, { $unset: { channelId: 1 } }); // in case of unclean shutdown
}

function validateMessage(msg: ISocketMessage, socket: SocketIO.Socket) {
    const validationResult = Joi.validate(msg, socketMessageSchema);
    if (validationResult.error) {
        socket.emit("appError", {
            message: validationResult.error.message
        });
        return false;
    } else if (!CSSockets.has(socket) && msg.channelId !== socket.id) {
        socket.emit("appError", {
            message: "Wrong sender"
        });
        return false;
    }
    return true;
}

async function forwardMessage(msg: ISocketMessage, socket: SocketIO.Socket) {
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
}

async function getActiveConversations() {
    const activeConversations: Array<IConversation> = await messages
        .find({ channelId: { $exists: true } }, { projection: { _id: 0 } })
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
    return activeConversations;
}
