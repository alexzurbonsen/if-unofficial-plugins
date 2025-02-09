import axios from 'axios';

import {
  BoaviztaCloudOutput,
  BoaviztaCpuOutput,
} from '../../../../lib/boavizta/index';

import {ERRORS} from '../../../../util/errors';

import {mockGet, mockPost} from '../../../../__mocks__/boavizta/axios';

const {InputValidationError} = ERRORS;

jest.mock('axios');

const mockAxios = axios as jest.Mocked<typeof axios>;

// Mock out all top level functions, such as get, put, delete and post:
mockAxios.get.mockImplementation(mockGet);
mockAxios.post.mockImplementation(mockPost);

describe('lib/boavizta: ', () => {
  describe('CpuOutput: ', () => {
    const output = BoaviztaCpuOutput({});

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('init BoaviztaCpuOutput: ', () => {
      it('initalizes object with properties.', async () => {
        expect(output).toHaveProperty('metadata');
        expect(output).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('returns a result when provided a valid data.', async () => {
        expect.assertions(1);

        const output = BoaviztaCpuOutput({});
        const result = await output.execute([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'cpu/utilization': 50,
            'cpu/name': 'Intel Xeon Gold 6138f',
            'cpu/number-cores': 24,
            country: 'USA',
          },
        ]);

        expect(result).toStrictEqual([
          {
            'carbon-embodied': 0.8,
            country: 'USA',
            'cpu/energy': 0.575,
            'cpu/name': 'Intel Xeon Gold 6138f',
            'cpu/number-cores': 24,
            'cpu/utilization': 50,
            duration: 3600,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ]);
      });

      it('returns a result when `verbose` is provided in the global config.', async () => {
        expect.assertions(1);

        const output = BoaviztaCpuOutput({verbose: true});

        const result = await output.execute([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 7200,
            'cpu/utilization': 100,
            'cpu/name': 'Intel Xeon Gold 6138f',
            'cpu/number-cores': 24,
            country: 'USA',
          },
        ]);

        expect(result).toStrictEqual([
          {
            'carbon-embodied': 1.6,
            country: 'USA',
            'cpu/energy': 1.6408333333333334,
            'cpu/name': 'Intel Xeon Gold 6138f',
            'cpu/number-cores': 24,
            'cpu/utilization': 100,
            duration: 7200,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ]);
      });

      it('returns an empty array when the input is an empty array.', async () => {
        expect.assertions(1);

        expect(await output.execute([])).toEqual([]);
      });

      it('throws an error when the metric type is missing from the input.', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'cpu/name': 'Intel Xeon Gold 6138f',
            'cpu/number-cores': 24,
            country: 'USA',
          },
        ];

        expect.assertions(1);

        try {
          await output.execute(inputs);
        } catch (error) {
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });
    });
  });

  describe('Cloudoutput', () => {
    const output = BoaviztaCloudOutput({});

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('init BoaviztaCloudOutput: ', () => {
      it('initalizes object with properties.', async () => {
        expect(output).toHaveProperty('metadata');
        expect(output).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('returns a result when provided valid input data.', async () => {
        expect.assertions(1);

        expect(
          await output.execute([
            {
              timestamp: '2021-01-01T00:00:00Z',
              duration: 15,
              'cpu/utilization': 34,
              'instance-type': 't2.micro',
              country: 'USA',
              provider: 'aws',
            },
          ])
        ).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 15,
            'cpu/utilization': 34,
            'instance-type': 't2.micro',
            country: 'USA',
            provider: 'aws',
            'carbon-embodied': 1.6,
            energy: 1.6408333333333334,
          },
        ]);
      });

      it('returns an empty array when the input is an empty array.', async () => {
        expect.assertions(1);

        expect(await output.execute([])).toEqual([]);
      });

      it('throws an error when the metric type is missing from the input.', async () => {
        expect.assertions(1);

        try {
          await output.execute([
            {
              timestamp: '2021-01-01T00:00:00Z',
              duration: 15,
              'instance-type': 't2.micro',
              country: 'USA',
              provider: 'aws',
            },
          ]);
        } catch (error) {
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });
    });
  });
});
