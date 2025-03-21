/**
 *  *** merge ***
 *
 *


 */

import fs from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { Transform, pipeline } from "node:stream";
import path from "node:path";

export default async function merge(dirname, outputPath = "merged.txt") {
  console.log(
    `\n*** Notice ***\n"merge" is under development due to memory leak issue`
  );
  console.log("It is being re-written\n");
}
