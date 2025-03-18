// A main File Processor Class
// reading and writing large text files
// compressing using zlib gzip
//

// import fs from "node:fs";
// import zlib from "node:zlib";
// import util from "node:util";

// class FileProcessor {
//   constructor() {
//     this.tasks = {};
//   }

//   async processFile(inputFilePath, outputFilePath, task) {
//     try {
//       let readStream;
//       let writeStream;
//       if (inputFilePath) {
//         readStream = fs.createReadStream(inputFilePath, {
//           encoding: "utf-8",
//           highWaterMark: 64 * 1024,
//         });
//       }
//       if (outputFilePath) {
//         writeStream = fs.createWriteStream(outputFilePath, {
//           highWaterMark: 16 * 1024,
//         });
//       }
//       switch (task) {
//         case "copy":
//           this.copy(readStream, writeStream);
//           break;

//         case "compress":
//           // compress file
//           this.compress(readStream, writeStream);
//           break;
//         case "linecount":
//           this.countLine(readStream);
//           break;
//         case "split":
//           this.split(readStream, writeStream);
//           break;
//         case "merge":
//           this.merge(readStream, writeStream);
//           break;

//         default:
//           await fileReadHandle.close();
//           await fileWriteHandle.close();
//           break;
//       }
//     } catch (error) {
//       console.error(`Err: ${error.message}`);
//     }
//   }

//   // copy contents of one file to another file
//   copy(readStream, writeStream) {
//     readStream.on("data", (chunk) => {
//       const buff = Buffer.from(chunk);
//       if (!writeStream.write(buff)) {
//         readStream.pause();
//       }
//     });
//     writeStream.on("drain", () => {
//       readStream.resume();
//     });
//     // shortcut
//     // readStream.pipe(writeStream);
//     readStream.on("end", () => {
//       console.log("file copied successfully");
//     });
//   }

//   // counts the total number of lines in a file
//   async countLine(readStream) {
//     let lineCount = 0;
//     await readStream.on("data", (chunk) => {
//       lineCount += chunk.toString().split("\n").length;
//       console.log(`Total Line Count = ${lineCount}`);
//     });
//   }

//   // compress  a file to .gz  format
//   compress(readStream, writeStream) {
//     const gzip = zlib.createGzip();
//     readStream.pipe(gzip).pipe(writeStream);
//     writeStream.on("finish", () => {
//       console.log("zipped data successfuly");
//     });
//   }

//   // file spliting (chunk based)
//   async split(readStream) {
//     let chunk_index = 1;
//     const outputDir = `CHUNKS`;
//     const mkdir = util.promisify(fs.mkdir);
//     await mkdir(outputDir, { recursive: true });

//     try {
//       readStream.on("data", (chunk) => {
//         const filename = `chunk_${chunk_index}`;
//         const filepath = `${outputDir}/${filename}`;
//         const writeStream = fs.createWriteStream(filepath);

//         if (!writeStream.write(chunk)) {
//           readStream.pause();
//         }

//         writeStream.on("drain", () => {
//           readStream.resume();
//         });

//         writeStream.on("error", (error) => {
//           console.log(`Writing error: ${error.message}`);
//         });

//         chunk_index++;
//       });

//       readStream.on("end", () => {
//         console.log("reading complete");
//       });

//       readStream.on("error", (error) => {
//         console.log(`Error while reading: ${error.message}`);
//       });
//     } catch (error) {
//       console.error("Error while reading file:", err.message);
//     }
//   }
// }

// export default FileProcessor;

import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import {
  parentPort,
  Worker,
  isMainThread,
  workerData,
} from "node:worker_threads";
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
          console.log(`Message From Worker: ${data.message}`);
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
