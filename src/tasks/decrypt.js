/**
 * *** decrypt ***
 * 
method: decrypt the file that was encrypted using *** encrypt *** method
copies the content of one file to new file

how to use: 
    args: source file, key


    todo: haven't found the way to decrypt the whole file using iv.
    


*/

import { pipeline, Transform } from "node:stream";
import fs from "node:fs/promises";
import { createDecipheriv } from "node:crypto";

class Decrypt extends Transform {
  constructor(key) {
    super();
    this.key = key;
    this.iv = null; // will update after extracting iv from the encrypted data
    this.data = Buffer.alloc(0); // placeholder after extracting iv
  }

  _transform(chunk, encoding, callback) {
    try {
      if (this.iv === null) {
        this.data = Buffer.concat([this.data, chunk]);
        if (this.data.length > 16) {
          // separating the iv from the last 16 bit of data that was put into it while encrypting
          this.iv = this.data.slice(-16);

          // the remaining data aftr extracting the iv
          this.data = this.data.slice(0, -16);

          // create a decipher i.e., decrypted data using the same algorithm
          this.decipher = createDecipheriv("aes-256-ctr", this.key, this.iv);

          this.decryptedChunk = this.decipher.update(this.data);
          this.push(this.decryptedChunk);
          callback();
        }
      }
      //   else {
      //     this.decryptedChunk = this.decipher.update(chunk);
      //     this.push(this.decryptedChunk);
      //     callback();
      //   }
    } catch (error) {
      callback(error);
    }
  }

  _flush(callback) {
    try {
      const finalChunk = this.decipher.final();
      this.push(finalChunk);
      callback();
    } catch (error) {
      callback(error);
    }
  }
}

export default async function decrypt(inputFilePath, key) {
  try {
    const writeFd = await fs.open("decrypted.txt", "w");
    const readFd = await fs.open(inputFilePath, "r");

    const writeStream = writeFd.createWriteStream();
    const readStream = readFd.createReadStream();

    const decryptFile = new Decrypt(key);

    pipeline(readStream, decryptFile, writeStream, (err) => {
      if (err) {
        console.log(`Error in Pipeline: ${err.message}`);
      }
    });
  } catch (error) {
    console.log(`Error decrypting file: ${error.message}`);
  }
}
