const { handler } = require('../../lambda/index');

test('returns status code 200', async () => {
  const res = await handler();
  expect(res.statusCode).toBe(200);
});

test('returns correct message with time', async () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00Z'));

  const res = await handler();
  const { message } = JSON.parse(res.body);

  expect(message).toBe('Hello from lambda, current time: Thu, 01 Jan 2026 00:00:00 GMT');

  jest.useRealTimers();
});
