This simple cdk app allows canary deployment withouth any code change to a project. It allows to dynamically shift the traffic between lambda versions, and fully promote or roll back a version.

## Deploy

No need to build the project since it's plain Javascript, not Typescript. 
Use `deploy.js` to deploy the stack. The script also sets the traffic split between the old and the new Lambda version. The weight is the share of traffic for the new version, from 0 to 1.

* `node deploy.js`        first deploy, or 100% traffic to the new version
* `node deploy.js 0.1`    10% to the new version, 90% to the old version
* `node deploy.js 0.9`    90% to the new version, 10% to the old version

### How it works

* API Gateway calls the Lambda alias `live`. The alias splits traffic to one or two versions.
* When the Lambda code changes, CDK publishes a new version and keeps the old versions.
* The script reads the old version number from the alias. Then it runs `npx cdk deploy` with the old version and its weight. So no need to manually set versions during deploy, it's automated.
* For each request, Lambda selects a version at random, by the weights

### Rollout steps

A rollout is the time when the alias sends traffic to two versions.

1. Do the first deploy with `node deploy.js`. This creates the alias and version 1. You cannot set a weight before this step (because there is no old version to send partial traffic to)
2. Change the code in `lambda/` then run `node deploy.js 0.1`. The new version gets 10% of the traffic.
4. To change the split, run the script again with a different weight.
5. Run `node deploy.js`. The new version gets 100% of the traffic. The rollout ends.

No need to change and project code for rollout weight change. Of course, don't change the code while rolling out, or you will have different traffic going to different versions. 

### Roll back

During a rollout:

* `node deploy.js 0`    0% to the new version, 100% to the old version

The rollout continues after this step. The new version stays in the alias with 0% of the traffic. To end the rollout:

1. Change the code in `lambda/` back to the old code, for example with `git revert`.
2. Run `node deploy.js`. CDK publishes the old code as a new version. This version gets 100% of the traffic.

Do not run `node deploy.js` without a weight before step 1. If you do, the new version gets 100% of the traffic.

### Decisions and tradeofs

* Project is written in plan Javascript. Mainly, to reduce amount of steps to run it. No need to build, reads natively by lambdas. Since "microservice" is a very basic 1-file, for this task it simplifies much. Not production grade, since it's less robust, no typechecks.
* Each run is a full `cdk deploy` through CloudFormation. The script does not use `cdk watch` or hotswap. This is slower, but the stack and the alias stay in sync.
* Use a weight only after a code change, or during a rollout. If not, the deploy fails and the traffic does not change.
* The script needs the AWS CLI and AWS credentials.

### Regular CDK commands

You can also deploy with `npx cdk deploy` and the context values `prevVersion` and `prevWeight`. Then you must find the old version number yourself. `prevWeight` is the weight of the old version, not the new version. The script does these steps for you. It also writes `docs/endpointUrl.json`.

### Useful commands

* `npm run test`         perform the jest unit tests
* `npx cdk deploy`       deploy this stack to your default AWS account/region
* `npx cdk diff`         compare deployed stack with current state
* `npx cdk synth`        emits the synthesized CloudFormation template

## Tests

There are simple unit and integration tests.

### Unit tests

* `npm test` runs the tests in `test/unit`
* These tests do not call AWS, no need to deploy first

### Integration tests

* `npm run test:integration` runs the tests in `test/integration`
* The test sends a request to the deployed API. Then it checks the response
* The test reads the API URL from `docs/endpointUrl.json`

Before you run integration test:
Deploy the stack from this machine with `node deploy.js`. The script writes the API URL to `docs/endpointUrl.json` file.
Or manually put the correct URL in the file.

Notes:

* Use `node deploy.js`. `npx cdk deploy` does not write the file.
* If you deploy from a different machine, the file on this machine does not change. You must update the URL manually. It assumes one microservice instance at a time. To find the URL, go to AWS Console > CloudFormation > Stacks > `TestAwsCdkIacAppStack` > Outputs.
* The key in the file must start with `IndexApiEndpoint`. If you change the construct ID `IndexApi` in the stack, update the key in the test.

File format for a manual update:

```json
{
  "TestAwsCdkIacAppStack": {
    "IndexApiEndpoint": "https://<api-id>.execute-api.<region>.amazonaws.com/prod/"
  }
}
```
