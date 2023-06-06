import { getWorker } from "../core/worker"
import * as activities from './activities';

const subscriptionWorker = getWorker('sample_workflow_v1/subscription.workflow', 'subscription-workflow', activities)
subscriptionWorker().catch((err) => {
  console.error(err);
  process.exit(1);
});