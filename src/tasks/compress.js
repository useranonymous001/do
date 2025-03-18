/**
 *  *** compress ***
 *
 * method: compress a large file into .gz format
 *
 * how to use:
 *     args: source filepath (.txt, .csv),    destination filepath (.gz)
 *
 */

import fs from "node:fs";
import zlib from "node:zlib";

export default async function compress(inputFilePath, outputFilePath) {
  try {
    const readStream = fs.createReadStream(inputFilePath);
    const writeStream = fs.createWriteStream(outputFilePath);

    const gzip = zlib.createGzip();

    readStream.pipe(gzip).pipe(writeStream);

    writeStream.on("finish", () => {
      console.log("all data has been flushed to the underlying system...");
    });

    readStream.on("end", () => {
      console.log("no more data to be consumed..");
    });

    readStream.on("error", (error) => {
      console.log(`Error in compresing: ${error.message}`);
    });
  } catch (error) {
    console.error(error.message);
  }
}
