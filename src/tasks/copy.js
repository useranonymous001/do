/**
 * *** copy ***
 * 
method: copy one file to new file
copies the content of one file to new file

how to use: 
    args: source filepath, destination filepath


    todo: use pipe for more optimization
    todo: will do after learning to use pipes

*/

import fs from "node:fs";
import path from "node:path";

async function copy(srcFile, destFile) {
  try {
    const sourcePath = path.resolve(srcFile);
    const destPath = path.resolve(destFile);

    if (!sourcePath || !destPath) {
      console.log(
        `Err: Source/Destination path not found || does not exists !!`
      );
    }

    const readStream = fs.createReadStream(sourcePath, {
      highWaterMark: 64 * 1024,
    });
    const writeStream = fs.createWriteStream(destPath, {
      highWaterMark: 64 * 1024,
    });

    readStream.on("data", (chunk) => {
      if (!writeStream.write(chunk)) {
        readStream.pause();
      }
    });

    writeStream.on("error", (error) => {
      console.log("Error writing the file");
    });

    readStream.on("error", (error) => {
      console.log("Error reading the file");
    });

    writeStream.on("drain", () => {
      readStream.resume();
    });

    readStream.on("end", () => {
      console.log("reading file successfull");
    });
  } catch (error) {
    console.error(`Err at copy: ${error.message}`);
  }
}

export default copy;
