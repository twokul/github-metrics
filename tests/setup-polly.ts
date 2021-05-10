import * as path from 'path';

// @ts-ignore
import { setupPolly } from 'setup-polly-jest';

// @ts-ignore
import FSPersister from '@pollyjs/persister-fs';

type Header = {
  name: string;
  value: string;
};

type HeaderDefaults = {
  [key: string]: string;
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

function normalizeRequestHeaders(headers: Header[]): Header[] {
  let defaults: HeaderDefaults = {
    authorization: 'token *****',
  };
  return normalizeHeaders(headers, defaults);
}

function normalizeResponseHeaders(headers: Header[]): Header[] {
  const defaults: HeaderDefaults = {
    'x-ratelimit-limit': '5000',
    'x-ratelimit-used': '0',
    'x-ratelimit-remaining': '5000',
    'x-ratelimit-reset': '1630000000',
    date: 'Mon, 10 May 2021 00:00:00 GMT',
    'x-github-request-id': 'D403:6EA6:6FD290:1B2A629:60997471',
  };
  return normalizeHeaders(headers, defaults);
}

class TokenStrippingPersister extends FSPersister {
  stringify(har: any) {
    let entries = har.log.entries;
    for (let entry of entries) {
      entry.request.headers = normalizeRequestHeaders(entry.request.headers);
      entry.response.headers = normalizeResponseHeaders(entry.response.headers);
      entry.startedDateTime = '2021-05-10T00:00:00.000Z';
      entry.time = 150;
      entry.timings = {
        blocked: -1,
        connect: -1,
        dns: -1,
        receive: 0,
        send: 0,
        ssl: -1,
        wait: 150,
      };
    }
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
