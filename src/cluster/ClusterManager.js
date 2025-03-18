// import cluster from "cluster";
// import os from "node:os";

// class ClusterManager {
//   // worker task is the main task (from the entry point)
//   static setUpWorker(workerTask) {
//     if (cluster.isPrimary) {
//       console.log(`Main cluster ${process.pid} started`);

//       //   for (let i = 0; i < os.cpus.length; i++) {
//       //     const worker = cluster.fork();

//       //     worker.on("message", (message) => {
//       //       console.log(`message from worker ${message}`);
//       //     });
//       //   }

//       cluster.on("exit", (worker, code, signal) => {
//         console.log(
//           `Worker ${worker.process.pid} || was killed by ${signal}  || with error code ${code}  `
//         );
//         cluster.fork();
//       });
//     } else {
//       workerTask();
//     }
//   }
// }

// export default ClusterManager;
