import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { Worker } from "node:worker_threads";
import os from "node:os";

export default class FileProcessor {
  constructor(taskFolder, maxWorkers = 4) {
    this.taskQueue = [];
    this.maxWorkers = maxWorkers;
    this.taskFolder = taskFolder;
    this.workerPool = [];
    this.tasks = {};
  }

  async loadTasks() {
    // reading list of task file from tasks
    const readdir = promisify(fs.readdir);

    const taskfiles = await readdir(this.taskFolder);
    for (const file of taskfiles) {
      // extract only filename without the extension
      const taskName = path.parse(file).name;

      // absolute path as file url as we are on windows
      const taskPath = `file://${path.resolve(this.taskFolder, file)}`;

      // importing all tasks from tasks folder (copy.js, merge.js .....)
      const taskModule = (await import(taskPath)).default;

      // let's categorize with cpu
      const isCPUHeavy = [
        "compress",
        "encrypt",
        "decrypt",
        "csvtojson",
        "hash",
      ].includes(taskName);

      this.tasks[taskName] = isCPUHeavy
        ? (...args) => this.runInWorker(taskPath, args)
        : taskModule.bind(this);
    }
  }

  async runInWorker(taskPath, args) {
    return new Promise((resolve, reject) => {
      if (this.workerPool.length < this.maxWorkers) {
        const worker = new Worker("./core/WorkerManager.js", {
          workerData: { taskPath, args },
        });

        worker.on("message", (data) => {
          console.log(`Task Allocated to Worker: ${data.message}`);
          resolve(data);
          this.workerPool = this.workerPool.filter((w) => w !== worker);
          this.assignNextTask();
        });

        worker.on("error", (err) => {
          console.log(err);
          reject(new Error(`Error occured ${err.message}`));
        });

        worker.on("exit", (code) => {
          this.workerPool = this.workerPool.filter((w) => w !== worker);
        });

        this.workerPool.push = worker;
      } else {
        this.taskQueue.push = { taskPath, args, resolve, reject };
      }
    });
  }

  async assignNextTask() {
    if (this.workerPool.length < this.maxWorkers && this.taskQueue.length > 0) {
      const { taskPath, args, resolve, reject } = this.taskQueue.shift();
      this.runInWorker(taskPath, args).then(resolve).catch(reject);
    }
  }
}
