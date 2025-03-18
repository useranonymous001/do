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

async function copy(srcFile, destFile) {
  try {
    const readStream = fs.createReadStream(srcFile);
    const writeStream = fs.createWriteStream(destFile);

    console.time("COPY");
    readStream.on("data", (chunk) => {
      if (!writeStream.write(chunk)) {
        readStream.pause();
      }
    });

    writeStream.on("error", () => {
      console.log("some error occured");
    });

    writeStream.on("drain", () => {
      readStream.resume();
    });

    readStream.on("end", () => {
      console.log("reading file successfull");
      console.timeEnd("COPY");
    });
  } catch (error) {
    console.error(`Err at copy: ${error.message}`);
  }
}

export default copy;
