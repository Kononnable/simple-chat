import { expect } from "chai";
import io = require("socket.io-client");
import { appLogic } from "../src/appLogic";

it("should be able to connect", async () => {

    const port = await appLogic();

    const socket = io(`http://localhost:${port}`)

    const promise = new Promise<any>((resolve, reject) => {
        socket.on('connect', () => { resolve(true) });
        socket.on('error', (data: any) => { reject(data)});
    })
    const result = await promise;
    expect(result).to.be.eq(true);
})
