import * as wf from '@temporalio/workflow';
// Only import the activity types
import * as activities from './activities';
import {WorkflowStep, executeWorkflowSteps } from '../core/workflow';


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
  const workflowState = { ...initialState };
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

  const workflowSteps: WorkflowStep<SubscriptionWorkflowState> = {
    stepToExecute: sendWelcomeEmail,
    onSuccessStep: {
      stepToExecute: { condition: workflowState.subscriptionCancelled, waitPeriod: trialPeriod},
      onSuccessStep: {
        stepToExecute: sendCancellationEmailDuringTrialPeriod,
      },
      timeoutStep: {
        stepToExecute: sendSubscriptionOverEmail,
      }
    },
  }
  return await executeWorkflowSteps(workflowState, workflowSteps)
}

