import * as wf from '@temporalio/workflow';
// Only import the activity types
import * as activities from './subscription.activities';

export type NewEmployeeNotJoined = {
  id: string;
  email: string;
  firstName: string,
  lastName: string,
  mobileNumber: string,
};

export type HRFollowUpTask = {
  id: string,
  name: string,
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL',
  status: 'NEW' | 'IN-PROGRESS' | 'COMPLETED'
}

export type NewEmpFormFillWorkflowState = {
  employee: NewEmployeeNotJoined,
  welcomeEmailSent: boolean,
  periodGivenForFormFillling: string | number,
  numberOfRemindersForFormFilling: number,
  formFilingReminderDuration: string | number,
  newEmployeeFormFilled: boolean,
  followUpTaskCreated: boolean,
  followUpTask: HRFollowUpTask | undefined,
}

export const signals = {
  rejectEmployeement: wf.defineSignal('rejectEmploymentSignal'),
  cancelEmployement: wf.defineSignal('cancelEmploymentSignal'),
  filledNewEmpForm: wf.defineSignal('fillNewEmployeeFormSignal'),
}
export const queries = {
  getWorkflowState: wf.defineQuery<NewEmpFormFillWorkflowState | undefined>('getWorkflowState')
}

const act = wf.proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
})

export async function NewEmpFormFillWorkflow(initialState: NewEmpFormFillWorkflowState): Promise<NewEmpFormFillWorkflowState> {
  let workflowState = { ...initialState };
  // destruct the required elements for workflow operation from workflow state
  const {
    periodGivenForFormFillling: periodGivenForFormFilling = '90 seconds',
    numberOfRemindersForFormFilling = 3,
    formFilingReminderDuration = '20 seconds',
    followUpTaskCreated = false,
    followUpTask = undefined
  } = workflowState
  
  // destruct signals and queries and set handlers
  const { filledNewEmpForm } = signals
  const { getWorkflowState } = queries
  wf.setHandler(filledNewEmpForm, () => void(workflowState.newEmployeeFormFilled = true))
  wf.setHandler(getWorkflowState, ()=>workflowState)
  
  mainLoop:
  // eslint-disable-next-line no-constant-condition
  while(true) {
    // code the workflow
    if(await wf.condition(() => workflowState.newEmployeeFormFilled, periodGivenForFormFilling)) {
      // new Employee form Filled, 
      if(followUpTaskCreated) {
        // TODO: call the activity to complete the follow up task
        console.log('Call the activty to complete the follow up task')
      }
      break mainLoop;
    } else {
      // what to do after periodGivenForFormFilling is over
      for(let i = 1; i<numberOfRemindersForFormFilling; i++) {
        // TODO: send the reminder
        // TODO: Create or update (if already exists) the follow up task
        if(await wf.condition(() => workflowState.newEmployeeFormFilled, formFilingReminderDuration)) {
          // TODO: call the activity to complete the follow up task
          console.log('Call the activty to complete the follow up task')
          break mainLoop;
        }
      }
    }
  }
  return workflowState;
}