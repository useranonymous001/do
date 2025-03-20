// import ClusterManager from "./cluster/ClusterManager.js";
import FileProcessor from "./core/FileProcessor.js";
import path from "node:path";
const main = async () => {
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
  // await processor.tasks.csvtojson(
  //   "../streams_practice/data.csv",
  //   "../streams_practice/DB.json"
  // );

  // await processor.tasks.viewfile("../streams_practice/DB.json");

  // await processor.tasks.resize("image.png", 500, 500, "outside");

  // await processor.tasks.hash("merged.txt", "sha256");
  await processor.tasks.verify_hash("merged.txt", "sha256");
};

main();
// initializing the cluster manager by passing the main work Task
// ClusterManager.setUpWorker(() => {
//   console.log("running cluster manager");
//   main();
// });
