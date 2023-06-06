import * as wf from '@temporalio/workflow';

export type ConditionObject = {stateValueToCheck: any, waitPeriod: string | number | undefined} 
export type ActivityFunction<S> = (state: S) => Promise<S>

export type WorkflowStep<S> = {
  stepToExecute: ActivityFunction<S> | ConditionObject | undefined;
  onSuccessStep?: WorkflowStep<S> | undefined;
  timeoutStep?: WorkflowStep<S> | undefined
}

  export async function executeWorkflowSteps<S>(workflowState: S, workflowSteps: WorkflowStep<S>): Promise<S> {
    const localWorkflowState = {...workflowState}
    const { onSuccessStep, stepToExecute, timeoutStep} = workflowSteps  
    if (!stepToExecute) return localWorkflowState;
    if (stepToExecute instanceof Object) {
      // activity to execute is a condition
      const { stateValueToCheck, waitPeriod='5 seconds'} = stepToExecute as ConditionObject;
      if (await wf.condition(() => stateValueToCheck, waitPeriod)) {
        if (!onSuccessStep) return localWorkflowState
        return await executeWorkflowSteps(localWorkflowState,(onSuccessStep as WorkflowStep<S>))
      } else {
        // time out condition
        if (!timeoutStep) return localWorkflowState
        return await executeWorkflowSteps(localWorkflowState,(timeoutStep as WorkflowStep<S>))
      }
    } else {
      // activity to execute is a activity action
      const activity = stepToExecute as ActivityFunction<S>;
      const updatedWorkflowState = await activity(localWorkflowState)
      if (!onSuccessStep) return updatedWorkflowState
        return await executeWorkflowSteps(updatedWorkflowState,(onSuccessStep as WorkflowStep<S>))
    }
  }