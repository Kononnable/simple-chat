import { appLogic } from "./appLogic";

appLogic().then(port => console.log(`App listening on port ${port}!`));
