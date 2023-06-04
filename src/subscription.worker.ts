import { getWorker } from "./core/worker"
import * as activities from './subscription.activities';

const subscriptionWorker = getWorker('subscription.workflow', 'subscription-workflow', activities)
subscriptionWorker().catch((err) => {
  console.error(err);
  process.exit(1);
});