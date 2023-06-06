import { getWorker } from "../core/worker"
import * as activities from './activities';

const subscriptionWorker = getWorker('new_emp_form_workflow_v1/workflow', 'newEmployeeFormFill-workflow', activities)
subscriptionWorker().catch((err) => {
  console.error(err);
  process.exit(1);
});