const { Stack, Duration } = require('aws-cdk-lib/core');
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
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    new apigw.LambdaRestApi(this, 'IndexApi', {
      handler: fn,
    });
  }
}

module.exports = { TestAwsCdkIacAppStack }
