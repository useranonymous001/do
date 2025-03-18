/**
 *  *** image-resize ***
 *
 * method: resize the image without saving the entire image into memory
 *
 * how to use:
 *     args: source image (.jpg, .png),
 *
 *      do image-resize <input-image>
 */

import { pipeline, Transform } from "stream";
import fs from "node:fs";
import sharp from "sharp";

export default async function resize(iamgePath, height = 800, width = 800) {
  const readStream = fs.createReadStream(iamgePath);
  const writeStream = fs.createWriteStream(`resized.png`);

  const imageResizer = new Transform({
    highWaterMark: 64 * 1024,
    transform(chunk, encoding, callback) {
      sharp(chunk)
        .resize({ height, width, fit: "fill" }) // Example: Resize to width 800px, adjust as needed
        .toBuffer()
        .then((data) => callback(null, data))
        .catch((err) => callback(err));
    },
  });

  pipeline(readStream, imageResizer, writeStream, (err) => {
    (err) => (err ? console.error(err) : console.log("Done!"));
  });

  readStream.on("end", () => {
    console.log("finish reading the image buffer");
  });

  writeStream.on("finish", () => {
    console.log("image resized !! ");
  });
}
