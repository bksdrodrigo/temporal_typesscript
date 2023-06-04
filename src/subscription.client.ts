import { SubscriptionWorkflow , signals, SubscriptionWorkflowArgs} from './subscription.workflow';
import { nanoid } from 'nanoid';
import { getConnection, getNewClient, startWorkflow } from './core/client'
import { stringify } from 'querystring';

export async function run() {
  const workflowExecutionArguments: SubscriptionWorkflowArgs = {
    email: 'surenr@99x.io',
    trialPeriod: '30 seconds'
  }
  const workflowExecuteQueue = 'subscription-workflow';
  const workflowExecutionId = 'subscription-workflow-' + nanoid();

  const connection = await getConnection();
  const client = getNewClient(connection);

  const handle = await startWorkflow(client, SubscriptionWorkflow,
    workflowExecutionArguments, 
    workflowExecuteQueue, 
    workflowExecutionId).catch(error => {
      console.error(error);
      process.exit(1);
  })
  return handle;
  // const workflowHandle = getWorkflowHndle(client, workflowExecutionId);
 
}
(run().then(handle => {
  console.log('Workflow Handle:')
  // console.log(JSON.stringify(handle));
  console.log(`Workflow ID for handle: ${handle.workflowId}`)
  // NB: We can now interact with the workflow by querying the workflow status and sending signals to
  /// Interact with the workflow using the handle we have obtained 
  // setTimeout(async () => {
  //   console.log('Sending Cancellation signal to workflow..');
  //   await handle.signal(signals.cancelSubscription)
  // }, 10000)

  // NB: Below is how you need to create a handle from the workflow ID and interact with any workflow
  setTimeout(async () => {
    console.log('Creating new connection..')
    const newConnection = await getConnection()
    console.log('Creating new client..')
    const newClient = getNewClient(newConnection)
    console.log(`Obtaining and handle to the workflow with ID: ${handle.workflowId}`)
    const workflowHandle = newClient.getHandle(handle.workflowId)
    console.log('Sending cancelation signal')
    workflowHandle.signal(signals.cancelSubscription)
  }, 15000)

}).catch(error=> {
  console.error(error);
  process.exit(1)
}))