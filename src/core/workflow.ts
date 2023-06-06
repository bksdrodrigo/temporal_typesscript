// await wf.condition(()=>workflowState.newEmployeeFormFilled, periodGivenForFormFilling)
import * as wf from '@temporalio/workflow';

export function till(outcome: boolean) {
  return {
    or: {
      timeOutIn: async (duration: string | number) => {
        return wf.condition(()=>outcome, duration)
      }
    }
  }
}
