import { AddressInfo } from "net";
import { appLogic } from "./appLogic";

appLogic().then(server =>
    console.log(
        `App listening on port ${(server.address() as AddressInfo).port}!`
    )
);
