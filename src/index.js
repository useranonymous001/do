// import ClusterManager from "./cluster/ClusterManager.js";
import FileProcessor from "./core/FileProcessor.js";
import path from "node:path";
import { program } from "commander";

// todo: initialize all the here and assign to the cluster manager later on

const processor = new FileProcessor(path.resolve("./tasks"), 4);
await processor.loadTasks();

program
  .name("do")
  .description(
    " 'do' is a nodejs based cli tool for manipulating files and data"
  )
  .version("1.0.1");

// await processor.tasks.hash("merged.txt", "sha256", "hashed.txt");
program
  .command("hash")
  .description("hash the file for integrity check")
  .argument("<filepath>", "path to the file to create hash")
  .option("-o, --output <string>", "ouput hash file path")
  .option(
    "-a, --algorithm <string>",
    "algorithm to be used (sha256, sha512,...)"
  )
  .action(async (args, options) => {
    await processor.tasks.hash(args, options.algorithm, options.output);
  });

// await processor.tasks.verify_hash("merged.txt", "sha256");
program
  .command("verify_hash")
  .description(
    "compare the hash of the file(be sure to use the same algorithm)"
  )
  .argument("<filepath>", "path to the file to create hash")
  .option("-a, --algorithm <char>", "algorithm to be used (sha256, sha512,...)")
  .option("-h --hash <char>", "path to the hash file to compare with")
  .action(async (args, options) => {
    await processor.tasks.verify_hash(args, options.algorithm, options.hash);
  });

// await processor.tasks.resize("image.png", 500, 500, "fill");
program
  .command("resize")
  .description("resize the size of any given image (default fit: fill)")
  .argument("<image_path>", "path to the image to resize")
  .option("-h, --height <number>", "height of the image")
  .option("-w, --width <number>", "width of the image")
  .option(
    "-f, --fit <string>",
    "fit: fill, cover, contain, outside (default fit: fill)"
  )
  .action(async (args, options) => {
    await processor.tasks.resize(
      args,
      options.height,
      options.width,
      options.fit
    );
  });

// await processor.tasks.viewfile("../streams_practice/DB.json");
// todo: read specific lines of files
program
  .command("viewfile")
  .description("read any size of files in the chunk by chunk")
  .argument("<filpath>", "path to the file to read")
  .option("-t, --top <number>", "read top n lines of the files")
  .option("-b, --bottom <number>", "read the bottom n lines of the files")
  .action(async (args, options) => {
    await processor.tasks.viewfile(args);
  });

// await processor.tasks.csvtojson(
//   "../streams_practice/data.csv",
//   "../streams_practice/DB.json"
// );
program
  .command("csvtojson")
  .description("convert your csv file to json")
  .option("-i, --input <char>", "path to your csv data file")
  .option("-o, --output <char>", "path to your output json data file")
  .action(async (args, options) => {
    await processor.tasks.csvtojson(args.input, args.output);
  });

// await processor.tasks.copy("src.txt", "dest.txt");
program
  .command("copy")
  .description("copy the contents from one file to another")
  .option("-i, --input <char>", "path to the source file to copy")
  .option("-o, --output <char>", "path to the destination file to copy")
  .action(async (args, options) => {
    await processor.tasks.copy(args.input, args.output);
  });

// await processor.tasks.compress("src.txt", "compressed.txt.gz");
program
  .command("compress")
  .description("compress the given file using gzip")
  .argument("<filepath>", "path to the file to compress")
  .option("-o, --output <char>", "file path to the output")
  .action(async (args, options) => {
    await processor.tasks.compress(args, options?.output);
  });

// await processor.tasks.split("src.txt", "CHUNKS");
program
  .command("split")
  .description("split the data of the given file into multiple files in chunks")
  .argument("<filepath>", "path to the file to split")
  .option("-o, --output <char>", "file path to the output dir")
  .action(async (args, options) => {
    await processor.tasks.split(args, options?.output);
  });

// await processor.tasks.linecount("src.txt");
program
  .command("linecount")
  .description("counts the lines of the contents in a file")
  .argument("<filepath>", "path to the file to count line of")
  .action(async (args) => {
    await processor.tasks.linecount(args);
  });

// await processor.tasks.merge("CHUNKS", "merged.txt");
program
  .command("merge")
  .description("merge multiple files into a single file")
  .argument("<folder>", "path to the folder containing files to merge")
  .option("-o, --output", "path to the save the merged file")
  .option(
    "-s, --size",
    "choose the size of the chunk/block for each file in KB"
  )
  .action(async (args, options) => {
    await processor.tasks.merge(args, options?.output);
  });

// await processor.tasks.encrypt(
//   "merged.decrypt",   "merged.txt",
//   "G9X3LQ7Y8V5W0Z2M4A1C6DJP"
// ); // it takes 24 bit key
program
  .command("encrypt")
  .description("encrypt any file using encryption key")
  .argument("<filepath>", "path to the file to encrypt")
  .option("-k, --key", "32-bit key to encrypt and decrypt")
  .option("-o, --output", "path to the save the encrypted file")
  .action(async (args, options) => {
    if (!options.key) {
      console.log(
        "Alert!!\nUse 32 bit key to make it secure\nUsing default key\n"
      );
    }
    await processor.tasks.encrypt(args, options?.key, options?.output);
  });

// await processor.tasks.decrypt(
//   "encrypted.enc",
//   "12345678901234567890123456789012"
// );
program
  .command("decrypt")
  .description("decrypt the encrypted file using encryption key")
  .argument("<filepath>", "path to the file to decrypt")
  .option("-k, --key", "32-bit key to decrypt")
  .option("-o, --output", "path to the save the decrypted file")
  .action(async (args, options) => {
    if (!options.key) {
      console.log(
        "Alert!!\nUse 32 bit key\nUsing default key that may have been used to encrypt earlier\n"
      );
    }
    await processor.tasks.decrypt(args, options?.key, options?.output);
  });

program.parse(process.argv);
