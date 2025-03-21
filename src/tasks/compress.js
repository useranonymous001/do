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
import path from "node:path";

export default async function compress(inputFilePath, outputFilePath) {
  try {
    const sourcePath = path.resolve(inputFilePath);

    const destPath = outputFilePath
      ? path.resolve(outputFilePath)
      : `compressed_${path
          .basename(sourcePath)
          .split(".")
          .slice(0, -1)
          .join("")}${path.extname(path.basename(sourcePath))}.gz`;

    const readStream = fs.createReadStream(sourcePath);
    const writeStream = fs.createWriteStream(destPath);

    const gzip = zlib.createGzip();

    writeStream.on("finish", () => {
      console.log("Done !!");
    });

    readStream.on("end", () => {
      console.log("Reading Source Complete");
    });

    readStream.on("error", (error) => {
      console.log(`Error in compresing: ${error.message}`);
    });
    readStream.pipe(gzip).pipe(writeStream);
  } catch (error) {
    console.error(error.message);
  }
}
