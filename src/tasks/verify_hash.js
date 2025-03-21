import fs from "node:fs";

import { createHash } from "node:crypto";

async function computeHash(filePath, alg) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(filePath);

    const hash = createHash(alg);

    try {
      readStream.on("data", (data) => {
        hash.update(data);
      });

      readStream.on("end", () => {
        resolve(hash.digest("hex"));
      });

      readStream.on("error", (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export default async function verify_hash(
  inputFilePath,
  algorithm,
  hashFilePath
) {
  try {
    const currentHash = await computeHash(
      inputFilePath,
      algorithm,
      hashFilePath
    );
    const storedhash = fs.readFileSync(hashFilePath, "utf-8");

    if (currentHash === storedhash) {
      console.log("integrity verified");
    } else {
      console.log("File integrity check failed! The file has been modified.");
    }
  } catch (error) {
    console.log(`Err: ${error}`);
  }
}
