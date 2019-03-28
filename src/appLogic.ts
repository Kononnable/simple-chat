import express = require("express");
import http = require("http");
import SocketIO = require("socket.io");

export const appLogic = () => {
    return new Promise<any>((resolve, reject) => {
        const app = express();
        const server = http.createServer(app);
        const port = process.env.PORT || 3000;

        app.get("/", (req, res) => res.send("Hello World!"));

        const io = SocketIO(server);
        io.on("connection", () => {
            /* … */
        });

        server.listen(port, () => {
            resolve(port);
        });
    });
};
