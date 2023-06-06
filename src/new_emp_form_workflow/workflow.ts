import * as wf from '@temporalio/workflow';
// Only import the activity types
import * as activities from './activities';
import {WorkflowStep, executeWorkflowSteps } from '../core/workflow';


export type Employee = {
  id?: string,
  email: string;
  firstName: string,
  lastName: string
};

export type HRFollowUpTask = {
  id: string,
  name: string,
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL',
  status: 'NEW' | 'IN-PROGRESS' | 'COMPLETED'
}

export type NewEmpFormFillState = {
  employee: Employee,
  welcomeEmailSent: boolean,
  periodGivenForFormFilling: string | number,
  reminderLimit: number,
  numberOfRemindersSent: number,
  formFilingReminderDuration: string | number,
  newEmployeeFormFilled: boolean,
  thankyouEmailSent: boolean,
  followUpTaskCreated: boolean,
  followUpTask: HRFollowUpTask | undefined,
}

export const signals = {
  formFillled: wf.defineSignal('formFilledSignal'),
}
export const queries = {
  getWorkflowState: wf.defineQuery<NewEmpFormFillState | undefined>('getWorkflowState')
}

const act = wf.proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
})

export async function NewEmployeeFormFillWorkflow(initialState: NewEmpFormFillState): Promise<NewEmpFormFillState> {
  // define the workfllow state
  const workflowState = { ...initialState };
  const {
    periodGivenForFormFilling, reminderLimit, formFilingReminderDuration
  } = workflowState;
  // list destruct the activities we are going to use withint the workflow
  const {sendWelcomeEmail,sendThankyouEmail, sendReminderEmail, creteFollowupTask, updateFolllowUpTask, completeFolllowupTask} = act;
  
  // Destruct the signals used in workflow and define the handlers
  /// NB: workflow state can only be mutated within a signal handler ONLY. 
  /// NEVER mutate workflow state within a query or within an activities, based on the outcome 
  /// of an activity, main workflow execution flow can update 
  /// We can pass the workflow state to activities so they can read about the workflow state
  const { formFillled } = signals
  const {getWorkflowState} = queries
  wf.setHandler(formFillled, () => void ( workflowState.newEmployeeFormFilled = true ))
  wf.setHandler(getWorkflowState, ()=>workflowState)

  
  const workflowSteps: WorkflowStep<NewEmpFormFillState> = {
    stepToExecute: sendWelcomeEmail,
    onSuccessStep: {
      stepToExecute: { condition: workflowState.newEmployeeFormFilled==true, waitPeriod: periodGivenForFormFilling },
      onSuccessStep: { // if and when new employee fill the form and the newEmployeeFormFilled set to true
        stepToExecute: completeFolllowupTask,
        onSuccessStep: {
          stepToExecute: sendThankyouEmail
        }
      },
      timeoutStep: { // periodGivenForFormFilling time has expired and user has not filled the form
        stepToExecute:  { 
          condition: (workflowState.numberOfRemindersSent===reminderLimit || workflowState.newEmployeeFormFilled==true), waitPeriod: formFilingReminderDuration, loopTimes: 3
        },
        // If the condition returns true, then exit the workflow graceeuly
        timeoutStep: { // if form reminder period is expires
          stepToExecute: sendReminderEmail,
          onSuccessStep: {
            stepToExecute: creteFollowupTask,
            onSuccessStep: {
              stepToExecute: updateFolllowUpTask
            }
          }
        }
      }
    },
  }
  return await executeWorkflowSteps(workflowState, workflowSteps)
}

