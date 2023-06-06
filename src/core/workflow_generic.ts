import * as wf from '@temporalio/workflow';

export type ConditionObject = {condition: boolean, waitPeriod?: string | number | undefined, loopTimes?: number | boolean,  breakOnConditionSuccess?: boolean,} 
export type ActivityFunction<S> = (state: S) => Promise<S>

export type WorkflowStep<S> = {
  stepToExecute: ActivityFunction<S> | ConditionObject | undefined;
  onSuccessStep?: WorkflowStep<S> | undefined;
  timeoutStep?: WorkflowStep<S> | undefined,
 
}

  export async function executeWorkflowSteps<S>(workflowState: S, workflowSteps: WorkflowStep<S>): Promise<S> {
    // const localWorkflowState = {...workflowState}
    const { onSuccessStep, stepToExecute, timeoutStep} = workflowSteps  
    if (!stepToExecute) return workflowState;
    if (stepToExecute instanceof Object) {
      // activity to execute is a condition
      const { condition: stateValueToCheck, waitPeriod} = stepToExecute as ConditionObject;
      if (!waitPeriod) {
        await wf.condition(() => stateValueToCheck)
        if (onSuccessStep) {
          return  await executeWorkflowSteps(workflowState,(onSuccessStep as WorkflowStep<S>))
        }
      } else {
        if (await wf.condition(() => stateValueToCheck, waitPeriod)) {
          if (onSuccessStep) {
            return await executeWorkflowSteps(workflowState,(onSuccessStep as WorkflowStep<S>))
          }
        } else {
          // time out condition
          if (timeoutStep) {
            return await executeWorkflowSteps(workflowState,(timeoutStep as WorkflowStep<S>))
          }
        }
      }
 
    } else {
      // activity to execute is a activity action
      const activity = stepToExecute as ActivityFunction<S>;
      const updatedWorkflowState = await activity(workflowState)
      if (!onSuccessStep) return updatedWorkflowState
      return await executeWorkflowSteps(updatedWorkflowState,(onSuccessStep as WorkflowStep<S>))
    }
    return workflowState;
  }