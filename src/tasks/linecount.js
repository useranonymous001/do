/**
 *  *** linecount ***
 *  method: counts  the total number of lines in a file
 *
 *  args: src_file to count lines
 *
 *  todo: let's seee
 *
 */

import fs from "node:fs";

export default async function linecount(inputFilePath) {
  try {
    const readStream = fs.createReadStream(inputFilePath);
    let linesCount = 0;
    readStream.on("data", (chunk) => {
      linesCount += chunk.toString().split("\n").length;
    });

    readStream.on("end", () => {
      console.log(`Total Line Count: ${linesCount}`);
    });
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}
