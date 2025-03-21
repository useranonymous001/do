// import ClusterManager from "./cluster/ClusterManager.js";
import FileProcessor from "./core/FileProcessor.js";
import path from "node:path";
import { program } from "commander";

// todo: initialize all the here and assign to the cluster manager later on

const processor = new FileProcessor(path.resolve("./tasks"), 4);
// await file.processFile("src.txt", "dest.txt", "copy");
// await file.processFile("src.txt", null, "linecount");
// await file.processFile("src.txt", "out.txt.gz", "compress");
// await file.processFile("src.txt", null, "split");
await processor.loadTasks();
// await processor.loadTasks("./tasks", 4);

// await processor.executeTasks("copy", "src.txt", "dest.txt");

// await processor.tasks.copy("src.txt", "dest.txt");

// await processor.tasks.compress("src.txt", "compressed.txt.gz");
// await processor.tasks.split("src.txt", "CHUNKS");
// await processor.tasks.linecount("src.txt");
// await processor.tasks.merge("CHUNKS", "merged.txt");
// await processor.tasks.encrypt(
//   "merged.txt",
//   "12345678901234567890123456789012"
// ); // it takes 24 bit key
// await processor.tasks.decrypt(
//   "encrypted.enc",
//   "12345678901234567890123456789012"
// );

program.name("do").description("cli tool").version("1.0.1");

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

program.parse(process.argv);
