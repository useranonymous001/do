import { createHash } from "node:crypto";
import { Transform } from "stream";
import { pipeline } from "node:stream/promises";
import fs from "node:fs";
import path from "node:path";

export default async function hash(inputFilePath, algorithm, hashFilePath) {
  try {
    const hashOutput = hashFilePath
      ? hashFilePath
      : `${path
          .basename(inputFilePath)
          .split(".")
          .slice(0, -1)
          .join("")}_hashed.txt`;

    const readStream = fs.createReadStream(inputFilePath);
    const writeStream = fs.createWriteStream(hashOutput);

    // creating the state of the hash

    const hash = createHash(algorithm);

    const computeHash = new Transform({
      transform: (chunk, encoding, callback) => {
        hash.update(chunk);
        callback();
      },

      flush: function (callback) {
        this.push(hash.digest("hex"));
        callback();
      },
    });
    readStream.on("error", (err) => {
      console.error(`Error while reading: ${err.message}`);
    });

    writeStream.on("error", (err) => {
      console.error(`Error while writing: ${err.message}`);
    });

    readStream.on("close", () => {
      console.log(`Readstream closed`);
    });

    writeStream.on("end", () => {
      console.log("Writestream closed");
    });

    await pipeline(readStream, computeHash, writeStream);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}
