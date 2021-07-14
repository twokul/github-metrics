import WorkflowSuccessMetric from '../../src/metrics/workflow-success';
import {
  generateMetrics,
  findIncludedWorkflows,
  METRIC_NAME_TO_CONSTRUCTOR,
  ConfigOptions,
} from '../../src/utils/parse-config';

const makeWorkflow = (path: string) => ({
  name: 'unused',
  id: 'unused-id',
  path,
});

describe('generateMetrics', () => {
  const fakeWorkflows = [makeWorkflow('a.yml')];

  for (const [name, klass] of Object.entries(METRIC_NAME_TO_CONSTRUCTOR)) {
    test(`metric name "${name}" is accepted`, () => {
      let metrics = generateMetrics({ metrics: [{ name }] }, fakeWorkflows);

      expect(metrics.length).toBe(1);
      expect(metrics[0]).toBeInstanceOf(klass);
    });
  }

  test(`unknown metric name throws`, () => {
    let name = 'unknown-metric';
    expect(Object.keys(METRIC_NAME_TO_CONSTRUCTOR)).not.toContain(name);

    expect(() => {
      generateMetrics({ metrics: [{ name }] }, fakeWorkflows);
    }).toThrowError(/Unknown metric/);
  });

  test(`config options are passed to constructor`, () => {
    let config = {
      metrics: [{ name: 'workflow/success', options: { branch: 'foo' } }],
    };
    let metrics = generateMetrics(config, fakeWorkflows);
    expect(metrics.length).toBe(1);

    let metric = metrics[0] as WorkflowSuccessMetric;
    expect(metric).toBeInstanceOf(WorkflowSuccessMetric);
    expect(metric.workflowRunOptions).toHaveProperty('branch', 'foo');
  });

  test(`each metric config must include name`, () => {
    let noNameConfig = {
      metrics: [{}],
    } as unknown as ConfigOptions;
    expect(() => generateMetrics(noNameConfig)).toThrowError(
      /Invalid configuration/
    );

    let extraPropConfig = {
      metrics: [{ title: 'this is not allowed' }],
    } as unknown as ConfigOptions;
    expect(() => generateMetrics(extraPropConfig)).toThrowError(
      /Invalid configuration/
    );
  });

  test(`config include/exclude/options are not allowed for non-workflow metrics`, () => {
    let config = { metrics: [{ name: 'pull-request/merged' }] };
    expect(() => generateMetrics(config)).not.toThrow();

    let badConfig = {
      metrics: [{ name: 'pull-request/merged', include: { paths: ['a.yml'] } }],
    };
    expect(() => generateMetrics(badConfig)).toThrowError(
      /Invalid configuration/
    );

    for (let key of ['include', 'exclude']) {
      let missingPropConfig = {
        metrics: [{ name: 'workflow/success', [key]: {} }],
      } as unknown as ConfigOptions;
      expect(() => generateMetrics(missingPropConfig)).toThrowError(
        /Invalid configuration/
      );

      let wrongPropConfig = {
        metrics: [{ name: 'workflow/success', [key]: { notpaths: [] } }],
      } as unknown as ConfigOptions;
      expect(() => generateMetrics(wrongPropConfig)).toThrowError(
        /Invalid configuration/
      );

      let extraPropConfig = {
        metrics: [
          { name: 'workflow/success', [key]: { paths: [], other: [] } },
        ],
      } as unknown as ConfigOptions;
      expect(() => generateMetrics(extraPropConfig)).toThrowError(
        /Invalid configuration/
      );
    }
  });
});

describe('findIncludedWorkflows', () => {
  const workflowsByName = {
    a: makeWorkflow('a.yml'),
    b: makeWorkflow('b.yml'),
    c: makeWorkflow('c.yml'),
    d: makeWorkflow('d.yml'),
  };
  const workflows = Object.values(workflowsByName);

  test('when neither include or exclude are passed, finds all workflows', () => {
    expect(findIncludedWorkflows(workflows, {})).toEqual(workflows);
  });

  test('when exclude is given, matching workflows are not included', () => {
    let { a, b, d } = workflowsByName;
    expect(
      findIncludedWorkflows(workflows, { exclude: { paths: ['c.yml'] } })
    ).toEqual([a, b, d]);

    expect(
      findIncludedWorkflows(workflows, {
        exclude: { paths: ['b.yml', 'c.yml'] },
      })
    ).toEqual([a, d]);

    expect(
      findIncludedWorkflows(workflows, {
        exclude: { paths: ['a.yml', 'b.yml', 'c.yml', 'd.yml'] },
      })
    ).toEqual([]);
  });

  test('when include is given, only those workflows are included', () => {
    let { a, b, d } = workflowsByName;
    expect(
      findIncludedWorkflows(workflows, { include: { paths: [] } })
    ).toEqual([]);

    expect(
      findIncludedWorkflows(workflows, { include: { paths: ['a.yml'] } })
    ).toEqual([a]);

    expect(
      findIncludedWorkflows(workflows, {
        include: { paths: ['a.yml', 'b.yml'] },
      })
    ).toEqual([a, b]);

    expect(
      findIncludedWorkflows(workflows, {
        include: { paths: ['a.yml', 'b.yml', 'd.yml'] },
      })
    ).toEqual([a, b, d]);
  });

  test('when include and exclude are given, exclude takes precedence if there is overlap', () => {
    let { a, b, d } = workflowsByName;

    expect(
      findIncludedWorkflows(workflows, {
        include: { paths: ['a.yml', 'b.yml', 'd.yml'] },
        exclude: { paths: ['c.yml'] },
      })
    ).toEqual([a, b, d]);

    // exclude and include overlap, exclude takes precedence
    expect(
      findIncludedWorkflows(workflows, {
        include: { paths: ['a.yml', 'b.yml', 'd.yml'] },
        exclude: { paths: ['a.yml'] },
      })
    ).toEqual([b, d]);
  });
});
