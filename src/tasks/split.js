/**
 *  *** split ***
 *  method: splits a large file into smaller chunks and keep it inside a folder
 *
 *  args: large_file.txt,   foder_to_store_chunks
 *
 * todo: need to optimize more to create less folders.
 *
 */

import fs from "node:fs";
import util from "node:util";

export default async function split(inputFilePath, outputDir) {
  let chunk_index = 1;
  const mkdir = util.promisify(fs.mkdir);
  await mkdir(outputDir, { recursive: true });

  try {
    const readStream = fs.createReadStream(inputFilePath);

    readStream.on("data", (chunk) => {
      const filepath = `${outputDir}/chunk_${chunk_index}`;
      const writeStream = fs.createWriteStream(filepath);

      if (!writeStream.write(chunk)) {
        readStream.pause();
      }

      writeStream.on("drain", () => {
        readStream.resume();
      });
      writeStream.on("finish", () => {
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
