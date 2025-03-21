/**
 *  *** split ***
 *  method: splits a large file into smaller chunks and keep it inside a folder
 *
 *  args: large_file.txt,   foder_to_store_chunks
 *
 * todo: need to optimize more to create less folders.
 * todo: use pipeline and more error handler to create error and faster processing
 * todo: option to choose the size of the chunk in KB
 */

import fs from "node:fs";
import util from "node:util";
import path from "node:path";

export default async function split(inputFilePath, outputDir) {
  let chunk_index = 1;
  const mkdir = util.promisify(fs.mkdir);
  const destDir = outputDir
    ? path.dirname(path.resolve(outputDir))
    : `OUTPUT_FILES`;
  await mkdir(destDir, { recursive: true });
  try {
    const sourcePath = path.resolve(inputFilePath);

    const readStream = fs.createReadStream(sourcePath, {
      highWaterMark: 64 * 1024 * 10,
    });

    readStream.on("data", (chunk) => {
      const filepath = `${destDir}/chunk_${chunk_index}`;
      const writeStream = fs.createWriteStream(filepath, {
        highWaterMark: 64 * 1024 * 10,
      });

      if (!writeStream.write(chunk)) {
        readStream.pause();
      }

      writeStream.on("drain", () => {
        readStream.resume();
      });

      readStream.on("end", () => {
        console.log(`Wrote ${chunk_index} chunk of data to ${filepath}`);
      });

      chunk_index++;
    });

    readStream.on("error", (err) => {
      console.log(`Error while splitting: ${err.message}`);
    });

    readStream.on("end", () => {
      console.log("finished consuming all the data...");
    });
  } catch (error) {
    console.error("error in spliting: ", error.message);
  }
}
