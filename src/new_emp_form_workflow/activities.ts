import { HRFollowUpTask, NewEmpFormFillState } from "./workflow";

export async function sendWelcomeEmail(workflowState: NewEmpFormFillState): Promise<NewEmpFormFillState> {
  const { employee: {
    email,
  }, welcomeEmailSent } = workflowState;
  if(welcomeEmailSent) return {...workflowState}
  // TODO: emailing logic goes here
  const newState = {...workflowState, welcomeEmailSent: true}
  console.log(JSON.stringify(newState))
  return newState;
}

export async function sendThankyouEmail(workflowState: NewEmpFormFillState): Promise<NewEmpFormFillState> {
  const { employee: {
    email,
  }, thankyouEmailSent } = workflowState;
  if(thankyouEmailSent) return {...workflowState}
  // TODO: emailing logic goes here
  const newState = {...workflowState, thankyouEmailSent: true}
  console.log(JSON.stringify(newState))
  return newState;
}

export async function sendReminderEmail(workflowState: NewEmpFormFillState): Promise<NewEmpFormFillState> {
  const { employee: {
    email,
  }, numberOfRemindersSent } = workflowState;
  // TODO: emailing logic goes here

  const newNumberOfReminders = numberOfRemindersSent + 1
  const newState = {...workflowState, numberOfRemindersSent: newNumberOfReminders}
  console.log(JSON.stringify(newState))
  return newState;
}

export async function creteFollowupTask(workflowState: NewEmpFormFillState): Promise<NewEmpFormFillState> {
  const { numberOfRemindersSent, followUpTaskCreated, employee: { firstName, lastName, email} } = workflowState;
  if (followUpTaskCreated) return workflowState
  const followUpTask: HRFollowUpTask = {
    id: "001",
    name: `Remind ${firstName} ${lastName} (${email}) to fill the New Employee form`,
    priority: numberOfRemindersSent<=1 ? 'NORMAL' : numberOfRemindersSent <=2 ? 'HIGH' : 'CRITICAL',
    status: "NEW"
  }
  const newState = {...workflowState, followUpTaskCreated: true, followUpTask}
  console.log(JSON.stringify(newState))
  return newState;
}

export async function updateFolllowUpTask(workflowState: NewEmpFormFillState): Promise<NewEmpFormFillState> {
  const { numberOfRemindersSent, followUpTask } = workflowState;

  const updatedFollowUpTask: HRFollowUpTask = {
    ...(followUpTask as HRFollowUpTask),
    priority: numberOfRemindersSent<=1 ? 'NORMAL' : numberOfRemindersSent <=2 ? 'HIGH' : 'CRITICAL',
    status: 'IN-PROGRESS'
  }
  const newState = {...workflowState, followUpTaskCreated: true, followUpTask: updatedFollowUpTask}
  console.log(JSON.stringify(newState))
  return newState;
}

export async function completeFolllowupTask(workflowState: NewEmpFormFillState): Promise<NewEmpFormFillState> {
  const { followUpTask } = workflowState;

  if (followUpTask) {
    const updatedFollowUpTask: HRFollowUpTask = {
      ...(followUpTask as HRFollowUpTask),
      status: 'COMPLETED'
    }
    const newState = {...workflowState, followUpTaskCreated: true, followUpTask: updatedFollowUpTask}
    console.log(JSON.stringify(newState))
    return newState;
  }
  return workflowState;
}