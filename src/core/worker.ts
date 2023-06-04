import { Worker } from '@temporalio/worker';



export function getWorker(workflowsPath: string, listeningQueue: string, activities: Object) {
  return async function() {
    // Step 1: Register Workflows and Activities with the Worker and connect to
    // the Temporal server.
    const worker = await Worker.create({
      workflowsPath: require.resolve(`../${workflowsPath}`),
      activities,
      taskQueue: listeningQueue,
    });
    // Worker connects to localhost by default and uses console.error for logging.
    // Customize the Worker by passing more options to create():
    // https://typescript.temporal.io/api/classes/worker.Worker
    // If you need to configure server connection parameters, see docs:
    // https://docs.temporal.io/typescript/security#encryption-in-transit-with-mtls
  
    // Step 2: Start accepting tasks on the `hello-world` queue
    await worker.run();
  }
}

