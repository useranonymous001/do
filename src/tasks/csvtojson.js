/*
    *** csvtodb ***

    csvtodb: converts the csv data into ndjson format and then saves it to the database(mongodb);

    Note: No filter is done because csv file may vary.


 */

import { pipeline } from "node:stream/promises";
import fs from "node:fs";
import { Transform } from "node:stream";
import path from "node:path";
import csv from "csvtojson";

export default async function csvtojson(
  csvFilePath,
  outputFilepath = "jsonFormat.json"
) {
  // transform : converts to json data.
  const convertToJson = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      const toNdJson = JSON.stringify(chunk) + "\n";
      callback(null, toNdJson);
    },
  });

  // you can use multiple data to transform

  try {
    const readStream = fs.createReadStream(path.resolve(csvFilePath));
    const writeStream = fs.createWriteStream(path.resolve(outputFilepath));

    await pipeline(
      readStream,
      csv({ delimiter: ";" }, { objectMode: true }),
      convertToJson, // idfk what i am doing here xD
      writeStream
    );
  } catch (error) {
    console.log(`Error: ${error}`);
  }
}
