import { SubscriptionWorkflowV1 , signals, queries, SubscriptionWorkflowState} from './subscription.workflow';
import { nanoid } from 'nanoid';
import { getConnection, getNewClient, startWorkflow } from './core/client'

export async function run() {
  const workflowExecutionArguments: SubscriptionWorkflowState = {
    customer: {
      id: 'uxd8383843',
      email: 'surenr@99x.io',
      trialPeriod: '30 seconds',
      billingPeriod: 3000,
      initialBillingPeriodCharge: 40,
      maxBillingPeriods: 5000
    },
    welcomeEmailSent: false,
    subscriptionCancelled: false,
    subscriptionOver: false,
    subscriptionOverEmailSent: false,
    subscriptionCancelledEmailSent: false
  }
  const workflowExecuteQueue = 'subscription-workflow';
  const workflowExecutionId = 'subscription-workflow-' + nanoid();

  const connection = await getConnection();
  const client = getNewClient(connection);

  const handle = await startWorkflow(client, SubscriptionWorkflowV1,
    workflowExecutionArguments, 
    workflowExecuteQueue, 
    workflowExecutionId).catch(error => {
      console.error(error);
      process.exit(1);
  })
  return handle;
  // const workflowHandle = getWorkflowHndle(client, workflowExecutionId);
 
}
(run().then(async (handle) => {
  console.log('Workflow Handle:')
  // console.log(JSON.stringify(handle));
  console.log(`Workflow ID for handle: ${handle.workflowId}`)
  console.log(await handle.query(queries.getWorkflowState))
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
    console.log(await handle.query(queries.getWorkflowState))
    const workflowHandle = newClient.getHandle(handle.workflowId)
    console.log('Sending cancelation signal')
    await workflowHandle.signal(signals.cancelSubscription) // await for the results for the signal
    console.log(await handle.query(queries.getWorkflowState)) // we can see immidiatly the impact of cancellation
  }, 15000)

}).catch(error=> {
  console.error(error);
  process.exit(1)
}))