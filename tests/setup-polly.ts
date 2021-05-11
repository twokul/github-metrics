import * as path from 'path';
// @ts-ignore
import { setupPolly } from 'setup-polly-jest';
// @ts-ignore
import FSPersister from '@pollyjs/persister-fs';
import { Har, Header } from 'har-format';

type HeaderDefaults = {
  [key: string]: string;
};

const NORMALIZED_DEFAULTS = {
  requestHeaders: {
    authorization: 'token *****',
  },
  responseHeaders: {
    'x-github-request-id': 'D403:6EA6:6FD290:1B2A629:60997471',
    'x-ratelimit-limit': '5000',
    'x-ratelimit-remaining': '5000',
    'x-ratelimit-reset': '1630000000',
    'x-ratelimit-used': '0',
    date: 'Mon, 10 May 2021 00:00:00 GMT',
  },
  headersSize: 0,
  entry: {
    startedDateTime: '2021-05-10T00:00:00.000Z',
    time: 150,
    timings: {
      blocked: -1,
      connect: -1,
      dns: -1,
      receive: 0,
      send: 0,
      ssl: -1,
      wait: 150,
    },
  },
};

function normalizeHeaders(
  headers: Header[],
  defaults: HeaderDefaults
): Header[] {
  return headers.map((header: any) => {
    if (header.name in defaults) {
      header.value = defaults[header.name];
    }
    return header;
  });
}

function normalizeHAR(har: Har): Har {
  let entries = har.log.entries;
  for (let entry of entries) {
    entry.request.headers = normalizeHeaders(
      entry.request.headers,
      NORMALIZED_DEFAULTS.requestHeaders
    );
    entry.response.headers = normalizeHeaders(
      entry.response.headers,
      NORMALIZED_DEFAULTS.responseHeaders
    );
    entry.request.headersSize = NORMALIZED_DEFAULTS.headersSize;
    entry.response.headersSize = NORMALIZED_DEFAULTS.headersSize;
    entry.startedDateTime = NORMALIZED_DEFAULTS.entry.startedDateTime;
    entry.time = NORMALIZED_DEFAULTS.entry.time;
    entry.timings = NORMALIZED_DEFAULTS.entry.timings;
  }

  return har;
}

class NormalizingPersister extends FSPersister {
  stringify(har: Har) {
    har = normalizeHAR(har);
    return super.stringify(har);
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
    persister: NormalizingPersister,
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
