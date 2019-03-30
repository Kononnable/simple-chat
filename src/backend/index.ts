import { AddressInfo } from "net";
import { appLogic } from "./appLogic";

setTimeout(
    () =>
        appLogic().then(server =>
            console.log(
                `App listening on port ${
                    (server.address() as AddressInfo).port
                }!`
            )
        ),
    5000
);
