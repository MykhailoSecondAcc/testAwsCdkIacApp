const { App } = require('aws-cdk-lib/core');
const { Template, Match } = require('aws-cdk-lib/assertions');
const { TestAwsCdkIacAppStack } = require('../../lib/test_aws_cdk_iac_app-stack');

const synth = (context) => Template.fromStack(new TestAwsCdkIacAppStack(new App({ context }), 'TestStack'));

test('alias has weights with context', () => {
  synth({ prevVersion: '1', prevWeight: '0.9' }).hasResourceProperties('AWS::Lambda::Alias', {
    Name: 'live',
    RoutingConfig: {
      AdditionalVersionWeights: [{ FunctionVersion: '1', FunctionWeight: 0.9 }],
    },
  });
});

test('api points to alias', () => {
  const template = synth();
  const [aliasId] = Object.keys(template.findResources('AWS::Lambda::Alias'));

  template.hasResourceProperties('AWS::ApiGateway::Method', {
    Integration: {
      Uri: { 'Fn::Join': ['', Match.arrayWith([{ Ref: aliasId }])] },
    },
  });
});

test('version is retained', () => {
  synth().hasResource('AWS::Lambda::Version', {
    DeletionPolicy: 'Retain',
    UpdateReplacePolicy: 'Retain',
  });
});
