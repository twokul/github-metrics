import debugBase, { Debugger } from 'debug';

const debug = debugBase('github-metrics');

export { Debugger };
export function enableDebugging() {
  debugBase.enable('github-metrics:*');
}
export default debug;
