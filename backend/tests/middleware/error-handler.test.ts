import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { errorHandler } from '../../src/middleware/error-handler';

describe('errorHandler', () => {
  let consoleError: ReturnType<typeof spyOn>;

  beforeEach(() => {
    consoleError = spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('responds with a generic 500 and logs the error', () => {
    const json = mock();
    const status = mock(() => ({ json }));
    const res = { status } as unknown as Parameters<typeof errorHandler>[2];
    const err = new Error('boom');

    errorHandler(err, {} as never, res, (() => {}) as never);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Internal server error' });
    expect(consoleError).toHaveBeenCalledWith(err);
  });
});
