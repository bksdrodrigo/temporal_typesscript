import * as wf from '@temporalio/workflow';
// Only import the activity types
import * as activities from './subscription.activities';


export type SubscriptionWorkflowArgs = {
  email: string,
  trialPeriod: string | number
}

export type Customer = {
  email: string;
  trialPeriod: string | number;
  billingPeriod: number;
  maxBillingPeriods: number;
  initialBillingPeriodCharge: number;
  id: string;
};

export type SubscriptionWorkflowState = {
  customer: Customer,
  welcomeEmailSent: boolean,
  subscriptionCancelled: boolean,
  subscriptionOver: boolean,
  subscriptionOverEmailSent: boolean,
  subscriptionCancelledEmailSent: boolean
}

export const signals = {
  cancelSubscription: wf.defineSignal('cancellSignal'),
}
export const queries = {
  getWorkflowState: wf.defineQuery<SubscriptionWorkflowState | undefined>('getWorkflowState')
}

const act = wf.proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
})

export async function SubscriptionWorkflowV1(initialState: SubscriptionWorkflowState): Promise<SubscriptionWorkflowState> {
  // define the workfllow state
  let workflowState = { ...initialState };
  const {
    customer: {
      trialPeriod,
    }
  } = workflowState;
  // list destruct the activities we are going to use withint the workflow
  const {sendCancellationEmailDuringTrialPeriod, sendSubscriptionOverEmail, sendWelcomeEmail} = act;
  
  // Destruct the signals used in workflow and define the handlers
  /// NB: workflow state can only be mutated within a signal handler ONLY. 
  /// NEVER mutate workflow state within a query or within an activities, based on the outcome 
  /// of an activity, main workflow execution flow can update 
  /// We can pass the workflow state to activities so they can read about the workflow state
  const {cancelSubscription} = signals
  const {getWorkflowState} = queries
  wf.setHandler(cancelSubscription, () => void ( workflowState.subscriptionCancelled = true ))
  wf.setHandler(getWorkflowState, ()=>workflowState)

  workflowState = await sendWelcomeEmail({...workflowState})
  
  if(await wf.condition(() => workflowState.subscriptionCancelled, trialPeriod)) {
    // reach here is subscriptionCancelled is true
    workflowState = await sendCancellationEmailDuringTrialPeriod({...workflowState});
  } else {
    //reach here if the trial period expires
    workflowState = await sendSubscriptionOverEmail({...workflowState})
  }
  return workflowState;
}