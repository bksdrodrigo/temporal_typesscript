import * as wf from '@temporalio/workflow';
// Only import the activity types
import * as activities from './activities';


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
  let workflowState = { ...initialState };
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

   // eslint-disable-next-line no-constant-condition
   while(true) {
    workflowState = await sendWelcomeEmail(workflowState);
    if(await wf.condition(()=>workflowState.newEmployeeFormFilled, periodGivenForFormFilling)) {
      // New Employee has filled the form
      workflowState = await completeFolllowupTask(workflowState)
      workflowState = await sendThankyouEmail(workflowState)
      break;
    } else {
      // timeout
      for(let i=1; i<reminderLimit; i++) {
        workflowState = await sendReminderEmail(workflowState)
        workflowState = workflowState.followUpTaskCreated? await updateFolllowUpTask(workflowState) : await creteFollowupTask(workflowState)
        if(await wf.condition(() => workflowState.newEmployeeFormFilled, formFilingReminderDuration)) {
          break;
        } else {
          continue;
        }
        
      }
    }
   }
   return workflowState;
 
}

