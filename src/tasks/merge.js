/**
 *  *** merge ***
 *
 *


 */

import fs from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
// import { pipeline } from "node:stream/promises";
import { PassThrough, Transform, pipeline } from "node:stream";
import path from "node:path";

// function concatStreams(streams) {
//   let pass = new PassThrough();
//   let waiting = streams.length;
//   for (let stream of streams) {
//     pass = stream.pipe(pass, { end: false });
//     stream.once("end", () => {
//       if (--waiting === 0) pass.emit("end");
//     });
//   }
//   return pass;
// }

function concatStreamsPipeline(streams, output) {
  return new Promise((resolve, reject) => {
    const pass = new PassThrough();

    // Pipe all input streams into the PassThrough
    let waiting = streams.length;

    for (const stream of streams) {
      stream.pipe(pass, { end: false });
      stream.once("end", () => {
        if (--waiting === 0) pass.emit("end");
      });
    }

    // Pipe the PassThrough into the output stream
    pipeline(pass, output, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export default async function merge(dirname, outputPath = "merged.txt") {
  try {
    const files = await fs.readdir(path.resolve(dirname));

    const sortedFiles = files.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0], 10); // Extract numeric part from file name
      const numB = parseInt(b.match(/\d+/)[0], 10);
      return numA - numB; // Sort numerically
    });

    const filePaths = sortedFiles.map((file) => path.join(dirname, file));

    const streams = filePaths.map((f) => createReadStream(f));
    const output = createWriteStream(path.resolve(outputPath));

    // const concatenatedStreams = concatStreams(inputStreams);

    // pipeline(concatenatedStreams, output, (err) => {
    //   if (err) {
    //     console.log(`Pipeline error: ${err}`);
    //   } else {
    //     console.log("done merging !! ");
    //   }
    // });
    await concatStreamsPipeline(streams, output);
  } catch (error) {
    console.error(`Error merging files: ${error.message}`);
  }
}
