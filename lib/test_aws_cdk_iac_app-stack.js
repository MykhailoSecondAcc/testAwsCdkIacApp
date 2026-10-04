const { Stack, Duration, RemovalPolicy } = require('aws-cdk-lib/core');
const lambda = require('aws-cdk-lib/aws-lambda');
const apigw = require('aws-cdk-lib/aws-apigateway');

class TestAwsCdkIacAppStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const fn = new lambda.Function(this, 'IndexFunction', {
      functionName: 'TestAwsCdkIacAppIndexFunction',
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      currentVersionOptions: { removalPolicy: RemovalPolicy.RETAIN },
    });

    const prevVersion = this.node.tryGetContext('prevVersion');
    const prevWeight = Number(this.node.tryGetContext('prevWeight'));

    const alias = new lambda.Alias(this, 'LiveAlias', {
      aliasName: 'live',
      version: fn.currentVersion,
      additionalVersions: prevVersion
        ? [
            {
              version: lambda.Version.fromVersionAttributes(this, 'PrevVersion', {
                lambda: fn,
                version: prevVersion,
              }),
              weight: prevWeight,
            },
          ]
        : [],
    });

    new apigw.LambdaRestApi(this, 'IndexApi', {
      handler: alias,
    });
  }
}

module.exports = { TestAwsCdkIacAppStack }
