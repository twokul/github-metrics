import { Interval, DateTime } from 'luxon';
import WorkflowDurationMetric from './metrics/workflow-duration';

(async () => {
  let end = DateTime.now();
  let start = end.minus({ months: 1 });
  let interval = Interval.fromDateTimes(start, end);

  let metric = new WorkflowDurationMetric(interval, 'build.yml');
  await metric.run();
  console.log(metric.summary);
})();
