import { SubscriptionWorkflowState } from "./new.emp.form.filll.workflow";

export async function greet(name: string): Promise<string> {
  return `Hello, ${name}!`;
}

export async function sendWelcomeEmail(workflowState: SubscriptionWorkflowState): Promise<SubscriptionWorkflowState> {
  const { customer: {
    email,
  }, welcomeEmailSent } = workflowState;
  if(welcomeEmailSent) return {...workflowState}
  // TODO: emailing logic goes here
  const newState = {...workflowState, welcomeEmailSent: true}
  console.log(JSON.stringify(newState))
  return newState;
}

export async function sendSubscriptionOverEmail(workflowState: SubscriptionWorkflowState): Promise<SubscriptionWorkflowState> {
  const { customer: {
    email,
  }, subscriptionOver } = workflowState;
  if(subscriptionOver) return {...workflowState}
  // TODO: emailing logic goes here
  const newState = {...workflowState, subscriptionOver: true, subscriptionOverEmailSent: true}
  console.log(JSON.stringify(newState))
  return newState;
}

export async function sendCancellationEmailDuringTrialPeriod(workflowState: SubscriptionWorkflowState): Promise<SubscriptionWorkflowState> {
  const { customer: {
    email,
  }, subscriptionCancelled } = workflowState;
  if(subscriptionCancelled) return {...workflowState};
  // TODO: emailing logic goes here.
  const newState = {...workflowState, subscriptionCancelled: true, subscriptionCancelledEmailSent: true}
  console.log(JSON.stringify(newState))
  return newState;
}

