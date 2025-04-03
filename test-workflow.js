import { startHandler } from "./workflow-update.sh";

const command = "node test-server.js";
const name = "Test Server";

startHandler({ command, name });