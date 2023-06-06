# Create Diagrams using
https://mermaid.live/

# New Employee Form Fill Workflow


given that we define a new Temporal Workflow in Type Script using the following method signature
```ts
export async function NewEmpFormFillWorkflow(initialState: NewEmpFormFillWorkflowState): Promise<NewEmpFormFillWorkflowState> {
    // Workflow logic goes here
}
```
And workflow state is given by NewEmpFormFillWorkflowState type, and its defined as follows
```ts
export type NewEmpFormFillWorkflowState = {
  employee: NewEmployeeNotJoined,
  welcomeEmailSent: boolean,
  periodGivenForFormFilling: string | number,
  numberOfRemindersForFormFilling: number,
  formFilingReminderDuration: string | number,
  newEmployeeFormFilled: boolean,
  followUpTaskCreated: boolean,
  followUpTask: HRFollowUpTask | undefined,
}
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
```

In the current context, A Temporal activity used within our workflows take in the workflow state as an argument and return an updated state. Below is an example for a typical workflow activity defined in our context.

```ts
export async function sendWelcomeEmail(workflowState: NewEmpFormFillWorkflowState): Promise<NewEmpFormFillWorkflowState> {
  // Do the required service, 3rd party calls and update the workflow state and send the new State
  const newState = {...workflowState, welcomeEmailSent: true} // NB: we always create a new copy of the sate
  return newState;
}
```
Assuming that newEmployeeFormFilled, followUpTaskCreated, periodGivenForFormFilling, numberOfRemindersForFormFilling,  and formFilingReminderDuration are all workflow state variables. And, completeFollowUpTask,sendReminderForFormFilling,  createFollowUpTask, updateFollowUpTaskPriority are workflow activities that are already defined. And taken into consideration the following key principles:
1. Workflow State is injected to a workflow as the initialState
2. Workflow state can not be mutated outside of a signal handler or activity
can you crate the Temporal workflow code in Typescript for NewEmpFormFillWorkflow to satisfy the mermaid graph definition given below? Please ONLY use Temporal conditions, workflow sleep, Promise raise as required to model the logic
----------------------------------------------------------

Given that newEmployeeFormFilled, followUpTaskCreated, periodGivenForFormFilling, numberOfRemindersForFormFilling,  and formFilingReminderDuration are all workflow state variables. And, completeFollowUpTask,sendReminderForFormFilling,  createFollowUpTask, updateFollowUpTaskPriority are workflow activities that are already defined. Using ONLY Temporal TypeScript SDK Signals, Conditions, Promise.race and Sleep, generate Typescript code for the workflow graph given below. 

```mermaid
graph LR
    A((Start)) --> B{Check if newEmployeeFormFilled is true?}
    B -- Yes --> C{Check if followUpTaskCreated is true ?}
    C -- Yes --> D[Call Activity: completeFollowUpTask]
    D --> E((End))
    C -- No --> E
    B -- No --> F{has periodGivenForFormFilling duration expired?}
    F -- No -->B
    F -- Yes -->G{Have we sent numberOfRemindersForFormFilling number of reminders?}
    %% Perhaps we need to have a different approach here to handle all reminders are sent
    G -- Yes -->A 
    G -- No --> H[Call Activity: sendReminderForFormFilling]
    H -->I{Check if followUpTaskCreated is true ?}
    I -- No --> J[Call Activity: createFollowUpTask]
    I -- Yes --> K[Call Activity: updateFollowUpTaskPriority]
    J -->L{Check if newEmployeeFormFilled is true?}
    K -->L
    L -- Yes -->C
    L -- No --> M{Has formFilingReminderDuration duration expired?}
    M -- No --> L
    M -- Yes -->G
