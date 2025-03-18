import { parentPort, workerData } from "node:worker_threads";

(async () => {
  try {
    console.log("Worker initialized");
    const taskModule = await import(workerData.taskPath);
    const result = await taskModule.default(...workerData.args);
    parentPort.postMessage({
      output: result,
      message: `Task: ${taskModule.default.name || "Unnamed Task"} completed`,
    });
  } catch (error) {
    console.log("error in work: ", error);
  }
})();
