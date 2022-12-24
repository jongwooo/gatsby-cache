import saveImpl from "./saveImpl";
import { StateProvider } from "./stateProvider";

async function run(): Promise<void> {
  await saveImpl(new StateProvider());
}

void run();

export default run;
