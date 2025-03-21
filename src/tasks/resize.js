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
import path from "node:path";

export default async function resize(
  iamgePath,
  height = 800,
  width = 800,
  fit = "fill"
) {
  const inputImagePath = path.resolve(iamgePath);
  const outputImagePath = `${path
    .basename(inputImagePath)
    .split(".")
    .slice(0, -1)
    .join("")}_resized${path.extname(inputImagePath)}`;

  const readStream = fs.createReadStream(inputImagePath);
  const writeStream = fs.createWriteStream(outputImagePath);

  const options = {
    height: parseInt(height),
    width: parseInt(width),
    fit: fit,
  };

  const imageResizer = new Transform({
    highWaterMark: 64 * 1024,
    transform(chunk, _, callback) {
      this.chunks = this.chunks || [];
      this.chunks.push(chunk);
      callback();
    },

    flush(callback) {
      const fullimageBuffer = Buffer.concat(this.chunks);

      sharp(fullimageBuffer)
        .resize(options)
        .toBuffer()
        .then((data) => callback(null, data))
        .catch((err) => callback(err));
    },
  });

  readStream.on("error", (err) => {
    console.log(err);
  });

  readStream.on("end", () => {
    console.log("Finished Reading Image Buffer");
  });

  imageResizer.on("finishc", () => {
    console.log("image resizing complete");
  });

  writeStream.on("error", (err) => console.error(err));

  writeStream.on("end", () => {
    console.log("image resized !! ");
  });

  pipeline(readStream, imageResizer, writeStream, (err) => {
    err ? console.log(err) : console.log("Done");
  });
}
