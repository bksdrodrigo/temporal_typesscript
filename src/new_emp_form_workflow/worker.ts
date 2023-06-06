import { getWorker } from "../core/worker"
import * as activities from './activities';

const subscriptionWorker = getWorker('new_emp_form_workflow/workflow', 'newEmployeeFormFill-workflow', activities)
subscriptionWorker().catch((err) => {
  console.error(err);
  process.exit(1);
});