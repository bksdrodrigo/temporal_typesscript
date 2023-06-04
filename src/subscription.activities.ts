export async function greet(name: string): Promise<string> {
  return `Hello, ${name}!`;
}

export async function sendWelcomeEmail(email: string): Promise<string> {
  return `Welcome email sent to ${email} successfully`
}

export async function sendSubscriptionOverEmail(email: string): Promise<string> {
  return `Subscription ending email sent to ${email} successfully`
}

export async function sendCancellationEmailDuringTrialPeriod(email: string): Promise<string> {
  return `Subscription Cancelation during trial period email sent to ${email} successfully`
}

