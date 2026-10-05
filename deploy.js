const { execFileSync, execSync } = require('child_process');

const functionName = 'TestAwsCdkIacAppIndexFunction';
const arg = process.argv[2];
let context = '';

if (arg !== undefined) {
  const weight = Number(arg);
  if (Number.isNaN(weight)) throw new Error('Weight must be a number');
  if (weight < 0 || weight > 1) throw new Error('Weight must be from 0 to 1');

  const alias = JSON.parse(
    execFileSync('aws', ['lambda', 'get-alias', '--function-name', functionName, '--name', 'live'])
  );
  const prev = Object.keys(alias.RoutingConfig?.AdditionalVersionWeights ?? {})[0] ?? alias.FunctionVersion;
  const prevWeight = Number((1 - weight).toFixed(4));
  context = ` -c prevVersion=${prev} -c prevWeight=${prevWeight}`;
}

execSync(`npx cdk deploy${context} --outputs-file docs/endpointUrl.json`, { stdio: 'inherit' });
