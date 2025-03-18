/*
    *** viewfile ***

    this utility allows you to read the file chunk by chunk, instead of reading it at once.

    args: sourceFile

*/

import { Transform } from "node:stream";
import path from "node:path";
import fs, { read } from "node:fs";

export default async function viewfile(inputFilepath) {
  try {
    const readStream = fs.createReadStream(path.resolve(inputFilepath), {
      highWaterMark: 1000,
    });

    readStream.on("data", (chunk) => {
      console.log("Chunk: ", chunk.toString() + `\n`);
      readStream.pause();
    });

    readStream.on("end", () => {
      console.log("File Reading Completed!");
      process.exit();
    });

    readStream.on("error", (error) => {
      console.error(`Error reading file: ${error}`);
      process.exit(1);
    });

    process.stdin.on("data", (input) => {
      if (input.toString().trim() === "n") {
        readStream.resume();
      } else if (input.toString().trim() === "q") {
        console.log("Quitting view mode !");
        readStream.destroy();
        process.exit();
      }
    });
  } catch (error) {
    console.log(`Error in viewing: ${error}`);
  }
}
