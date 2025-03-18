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
      // console.log(this.iv);
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

// class Encrypt extends Transform {

// }

// export default async function encrypt(inputFilePath) {
//   const algorithm = "aes-192-cbc";
//   const password = "this is fake password";

//   const outputFilePath = `encrypted.enc`;

//   const writeFileHandle = await fs.open(outputFilePath, "w");
//   const writeStream = writeFileHandle.createWriteStream();

//   const readFileHandle = await fs.open(inputFilePath, "r");
//   const readStream = readFileHandle.createReadStream();

//   try {
//     scrypt(password, "salt", 24, (err, key) => {
//       if (err) {
//         throw err;
//       }

//       randomFill(new Uint8Array(16), (err, iv) => {
//         if (err) throw err;

//         const cipher = createCipheriv(algorithm, key, iv);

//         pipeline(readStream, cipher, writeStream, (err) => {
//           if (err) {
//             console.log("err: ", err.message);
//           }
//         });
//       });
//     });

//     // when the read stream closes
//     readStream.on("end", () => {
//       console.log("finished reading the contents");
//     });

//     // when the write stream closes
//     writeStream.on("finish", () => {
//       console.log("finished writing");
//     });
//   } catch (err) {
//     console.log(err);
//   }
// }
