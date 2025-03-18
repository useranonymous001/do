import { read, write } from "node:fs";
import fs from "node:fs/promises";
import { Stream } from "node:stream";
// for later use
// const { Transform } = require('stream');

class StreamHandler {
  constructor(inputFilePath, outputFilePath) {
    this.inputFilePath = inputFilePath;
    this.outputFilePath = outputFilePath;
  }

  processStream() {
    const readStream = fs.createReadStream(this.inputFilePath);
    const writeStream = fs.createWriteStream(this.outputFilePath);

    readStream.pipe(writeStream);

    readStream.on("error", () => {});

    writeStream.on("finish", () => {
      console.log("writable stream finished");
    });
  }
}

export default StreamHandler;
