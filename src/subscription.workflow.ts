import * as wf from '@temporalio/workflow';
// Only import the activity types
import * as activities from './subscription.activities';


export type SubscriptionWorkflowArgs = {
  email: string,
  trialPeriod: string | number
}

export type SubscriptionWorkflowState = {
  userEmail: string,
  welcomeEmailSent: boolean | null,
  
}

export const signals = {
  cancelSubscription: wf.defineSignal('cancellSignal'),
}

const act = wf.proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
})

export async function SubscriptionWorkflow({email, trialPeriod}: SubscriptionWorkflowArgs) {
  // define the workfllow state
  const workflowState = { isCanceled: false };

  // list destruct the activities we are going to use withint the workflow
  const {sendCancellationEmailDuringTrialPeriod, sendSubscriptionOverEmail, sendWelcomeEmail} = act;
  
  // Destruct the signals used in workflow and define the handlers
  /// NB: workflow state can only be mutated within a signal handler ONLY. 
  /// NEVER mutate workflow state within a query or within an activities, based on the outcome 
  /// of an activity, main workflow execution flow can update 
  /// We can pass the workflow state to activities so they can read about the workflow state
  const {cancelSubscription} = signals
  wf.setHandler(cancelSubscription, () => void ( workflowState.isCanceled = true ))

  await sendWelcomeEmail(email)
  await wf.sleep(trialPeriod)
  if(workflowState.isCanceled) {
    await sendCancellationEmailDuringTrialPeriod(email);
  } else {
    await sendSubscriptionOverEmail(email)
  }
}