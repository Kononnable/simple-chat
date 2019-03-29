import { expect } from "chai";
import { AddressInfo } from "net";
import io = require("socket.io-client");
import { appLogic } from "../src/appLogic";
import { ISocketMessage } from "../src/schemaModelst";

it("should connect", async () => {

    const server = await appLogic();
    const port = (server.address() as AddressInfo).port
    const socket = io(`http://localhost:${port}`)

    const promise = new Promise<any>((resolve, reject) => {
        socket.once('connect', () => { resolve(true) });
        socket.once('error', (data: any) => { reject(data) });
    })
    const result = await promise;
    expect(result).to.be.eq(true);
    await server.close()
})

it("should send and recive messages", async () => {
    const server = await appLogic();
    const port = (server.address() as AddressInfo).port

    const socketClient = io(`http://localhost:${port}`)
    const socketCS = io(`http://localhost:${port}`)

    const promiseClient = new Promise<any>((resolve, reject) => {
        socketClient.once('connect', () => {
            resolve(true);
        });
        socketClient.once('error', (data: any) => { reject(data) });
    })
    const promiseCS = new Promise<any>((resolve, reject) => {
        socketCS.on('connect', () => {
            socketCS.emit('authenticateAsCS');
            resolve(true);
        });
        socketCS.on('message', (msg: ISocketMessage) => {
            const reply: ISocketMessage = { channelId: msg.channelId, message: msg.message.split("").reverse().join("") }
            socketCS.send(reply)
        })
        socketCS.once('error', (data: any) => { reject(data) });
    })
    const results = await Promise.all([promiseClient, promiseCS]);
    expect(results[0]).to.be.eq(true);
    expect(results[1]).to.be.eq(true);

    const MessageRecived = new Promise<any>((resolve, reject) => {
        socketClient.on('message', (msg: ISocketMessage) => {
                resolve(msg.message)
        })
    })
    const message: ISocketMessage = { message: 'abc', channelId: socketClient.id }
    socketClient.send(message)
    const response = await MessageRecived;
    expect(response).to.be.eq('cba')
    await server.close()

})
it("should get active messages", async () => {
    const server = await appLogic();
    const port = (server.address() as AddressInfo).port

    const socketClient = io(`http://localhost:${port}`)
    const socketCS = io(`http://localhost:${port}`)

    const promiseClient = new Promise<any>((resolve, reject) => {
        socketClient.once('connect', () => {
            resolve(true);
        });
        socketClient.once('error', (data: any) => { reject(data) });
    })
    const promiseCS = new Promise<any>((resolve, reject) => {
        socketCS.once('connect', () => {
            socketCS.emit('authenticateAsCS');
            resolve(true);
        });
        socketCS.once('error', (data: any) => { reject(data) });
    })
    const results = await Promise.all([promiseClient, promiseCS]);
    expect(results[0]).to.be.eq(true);
    expect(results[1]).to.be.eq(true);

    const MessageRecivedPromise = () => new Promise<any>((resolve, reject) => {
        socketCS.once('ActiveMessages', (msg: ISocketMessage[]) => resolve(msg))
    })
    socketCS.emit('ActiveMessages')
    const response = await MessageRecivedPromise();
    expect(response).to.length(0)

    const message: ISocketMessage = { message: 'abc', channelId: socketClient.id }
    socketClient.send(message)

    await sleep(100);

    socketCS.emit('ActiveMessages')
    const response2 = await MessageRecivedPromise();
    expect(response2).to.length(1)

    await server.close()

})

function sleep(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
