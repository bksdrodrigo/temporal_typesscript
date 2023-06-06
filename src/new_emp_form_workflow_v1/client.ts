import { NewEmployeeFormFillWorkflow , signals, queries, NewEmpFormFillState} from './workflow';
import { nanoid } from 'nanoid';
import { getConnection, getNewClient, startWorkflow } from '../core/client'

export async function run() {
  const workflowExecutionArguments: NewEmpFormFillState = {
    employee: {
      id: 'emp0000057',
      email: 'surenr@99x.io',
      firstName: 'Suren',
      lastName: 'Rodrigo'
    },
    welcomeEmailSent: false,
    periodGivenForFormFilling: '50 seconds',
    reminderLimit: 3,
    numberOfRemindersSent: 0,
    formFilingReminderDuration: '10 seconds',
    newEmployeeFormFilled: false,
    thankyouEmailSent: false,
    followUpTaskCreated: false,
    followUpTask: undefined
  }
  const workflowExecuteQueue = 'newEmployeeFormFill-workflow';
  const workflowExecutionId = 'newEmployeeFormFill-workflow-' + nanoid();

  const connection = await getConnection();
  const client = getNewClient(connection);

  const handle = await startWorkflow(client, NewEmployeeFormFillWorkflow,
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
    await workflowHandle.signal(signals.formFillled) // await for the results for the signal
    console.log(await handle.query(queries.getWorkflowState)) // we can see immidiatly the impact of cancellation
  }, 75000)

}).catch(error=> {
  console.error(error);
  process.exit(1)
}))