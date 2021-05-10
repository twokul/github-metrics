import * as path from 'path';

import replaceAll from 'string.prototype.replaceall';

// @ts-ignore
import { setupPolly } from 'setup-polly-jest';

// @ts-ignore
import FSPersister from '@pollyjs/persister-fs';

class TokenStrippingPersister extends FSPersister {
  stringify(...args: any[]) {
    let string = super.stringify(...args);
    string = replaceAll(string, /"token .*?"/g, '"token *****"');
    return string;
  }
}

export default function setup() {
  /**
   * The `setupPolly` test helper creates a new polly instance which you can
   * access via `context.polly`. The recording name is generated based on
   * the suite (module) and spec (test) names.
   */
  return setupPolly({
    adapters: [require('@pollyjs/adapter-node-http')],
    persister: TokenStrippingPersister,
    persisterOptions: {
      fs: {
        recordingsDir: path.resolve(__dirname, 'fixtures', '__recordings__'),
      },
    },
    recordIfMissing: Boolean(process.env.RECORD_REQUESTS),
    matchRequestsBy: {
      headers: false,
    },
  });
}
