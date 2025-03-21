/**
 * *** encrypt ***
 * 
method: encrypt content of the files using Cipher Decipher Methods



how to use: 
    args: source filepath, key

    todo: need to pass iv at the last of the content to use it to decrypt the file at the end

*/

import { pipeline, Transform } from "node:stream";
import fs from "node:fs/promises";
import { randomBytes, createCipheriv } from "node:crypto";
import path from "node:path";

class Encrypt extends Transform {
  constructor(key) {
    super();
    this.key = key;
    this.iv = randomBytes(16);
    this.cipher = createCipheriv("aes-256-ctr", this.key, this.iv);
  }

  _transform(chunk, encoding, callback) {
    try {
      const encryptedChunk = this.cipher.update(chunk);
      this.push(encryptedChunk);
      callback();
    } catch (error) {
      callback(error);
    }
  }

  _flush(callback) {
    try {
      const finalChunk = this.cipher.final();
      this.push(finalChunk);
      this.push(this.iv); // pushed at the end for decryption
      callback();
    } catch (error) {
      callback(error);
    }
  }
}

export default async function encrypt(inputFilePath, key, outputFilePath) {
  try {
    const sourcePath = path.resolve(inputFilePath);
    const encKey = key ? key : "G9X3LQ7Y8V5W0Z2M4A1C6DJP4A1C6DJP";
    const destPath = outputFilePath
      ? outputFilePath
      : `${path
          .basename(sourcePath)
          .split(".")
          .slice(0, -1)
          .join("")}_encrypted.enc`;

    const writeFd = await fs.open(destPath, "w");
    const readFd = await fs.open(sourcePath, "r");

    const writeStream = writeFd.createWriteStream();
    const readStream = readFd.createReadStream();

    const encrypt = new Encrypt(encKey);

    readStream.on("end", () => {
      console.log("");
    });

    writeStream.on("finish", () => {
      console.log("Done !!");
    });

    pipeline(readStream, encrypt, writeStream, (err) => {
      if (err) {
        console.log(`Pipeline err: ${err.message}`);
      }
    });
  } catch (error) {
    console.log(`Error in encrypting: ${error.message}`);
  }
}
