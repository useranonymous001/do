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

class Encrypt extends Transform {
  constructor(key) {
    super();
    this.key = key;
    this.iv = randomBytes(16);
    this.cipher = createCipheriv("aes-256-ctr", this.key, this.iv);
  }

  _transform(chunk, encoding, callback) {
    try {
      console.log(typeof chunk);
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
      callback;
    } catch (error) {
      callback(error);
    }
  }
}

export default async function encrypt(inputFilePath, key) {
  try {
    const writeFd = await fs.open("encrypted.enc", "w");
    const readFd = await fs.open(inputFilePath, "r");

    const writeStream = writeFd.createWriteStream();
    const readStream = readFd.createReadStream();

    const encrypt = new Encrypt(key);
    // console.log(encrypt.iv);

    pipeline(readStream, encrypt, writeStream, (err) => {
      if (err) {
        console.log(`Pipeline err: ${err.message}`);
      }
    });

    readStream.on("end", () => {
      console.log("finished reading..");
    });

    writeStream.on("finish", () => {
      console.log("finished writing..");
    });
  } catch (error) {
    console.log(`Error in encrypting: ${error.message}`);
  }
}
