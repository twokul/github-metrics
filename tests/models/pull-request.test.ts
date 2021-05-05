import { loadPullRequest } from '../../src/models/pull-request';
import setupPolly from '../setup-polly';

describe('model: PullRequest', () => {
  setupPolly();

  describe('timeToMerge', () => {
    for (let prData of [
      { number: 1, description: 'simple', timeToMerge: 361000 },
      { number: 2, description: 'opened as draft first', timeToMerge: 93000 },
      { number: 3, description: 'reopened', timeToMerge: 309000 },
      {
        number: 9,
        description: 'opened and then review requested',
        timeToMerge: 111000,
      },
      {
        number: 10,
        description: 'opened and then review requested then closed/reopened',
        timeToMerge: 46000,
      },
      {
        number: 11,
        description: 'opened, merged, then first review requested',
        timeToMerge: 168000,
      },
    ]) {
      test(`PR: ${prData.description}`, async () => {
        let pr = await loadPullRequest(prData.number);

        expect(pr.timeToMerge && pr.timeToMerge.toMillis()).toBe(
          prData.timeToMerge
        );
      });
    }
  });
});
