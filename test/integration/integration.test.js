const outputs = require('../../docs/endpointUrl.json').TestAwsCdkIacAppStack;
const url = outputs[Object.keys(outputs).find((key) => key.startsWith('IndexApiEndpoint'))];

test('api returns hello message', async () => {
  const res = await fetch(url);
  const { message } = await res.json();

  expect(message).toMatch(/^Hello from lambda, current time: /);
});
