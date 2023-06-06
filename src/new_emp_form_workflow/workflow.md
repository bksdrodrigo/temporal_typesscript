# This  document expains the workflow used in New Employee Form Workflow

```ts
const workflowSteps: WorkflowStep<SubscriptionWorkflowState> = {
    stepToExecute: sendWelcomeEmail,
    onSuccessStep: {
      stepToExecute: { stateValueToCheck: workflowState.subscriptionCancelled, waitPeriod: trialPeriod},
      onSuccessStep: { // Employee has filled the form
        stepToExecute: sendCancellationEmailDuringTrialPeriod,
      },
      timeoutStep: {
        stepToExecute: sendSubscriptionOverEmail,
      }
    },
  }
```

1. Send the welcome email to new Employee with the link to the form for filling details
2. Wait 24 hours for employee to fill the form
3. If employee fill the form:
3.1.  Send the Thank you Email and exit the workflow
4. If 24 hours have expired without employee filling the form (timeout)
4.1.  Loop the foolowing 3 times:
4.1.1.  Send form filling Reminder Email
4.1.2.  If Followup Task Created:
4.1.2.1.  Update the followup task by increasing the priority
4.1.3.  If Followup Task Not Created:
4.1.3.1.  Create a followup task with priority
 