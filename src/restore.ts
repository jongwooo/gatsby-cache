import restoreImpl from "./restoreImpl";
import { StateProvider } from "./stateProvider";

async function run(): Promise<void> {
	await restoreImpl(new StateProvider());
}

void run();

export default run;
