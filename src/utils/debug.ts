import debugBase, { Debugger } from 'debug';

export { Debugger } from 'debug';

const debug: Debugger = debugBase('github-metrics');
export default debug;
