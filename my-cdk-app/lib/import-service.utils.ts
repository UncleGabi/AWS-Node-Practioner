import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import path = require("path");

export function createImportBucket(scope: Construct) {
  return new s3.Bucket(scope, "ImportBucket", {
    versioned: true,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
  });
}

export function createLambdaFunction(
  scope: Construct,
  bucket: s3.Bucket,
  id: string,
  entryFile: string
) {
  const lambdaFunction = new lambda.NodejsFunction(scope, id, {
    handler: "handler",
    entry: path.join(__dirname, `../lambda/${entryFile}.ts`),
    environment: {
      BUCKET_NAME: bucket.bucketName,
      UPLOAD_FOLDER: "uploaded",
    },
  });

  bucket.grantReadWrite(lambdaFunction);

  return lambdaFunction;
}

export function createApiGateway(scope: Construct) {
  return new apigateway.RestApi(scope, "ImportApi", {
    restApiName: "Import Service",
  });
}

export function addImportResource(
  api: apigateway.RestApi,
  lambdaFunction: lambda.NodejsFunction
) {
  const importResource = api.root.addResource("import");
  const importIntegration = new apigateway.LambdaIntegration(lambdaFunction);
  importResource.addMethod("GET", importIntegration);
  importResource.addCorsPreflight({
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS,
    allowHeaders: [
      "Content-Type",
      "X-Amz-Date",
      "Authorization",
      "X-Api-Key",
      "X-Amz-Security-Token",
      "X-Amz-User-Agent",
      "X-Requested-With",
    ],
  });
}

export function addS3EventSource(
  lambdaFunction: lambda.NodejsFunction,
  bucket: s3.Bucket
) {
  const s3EventSource = new lambdaEventSources.S3EventSource(bucket, {
    events: [s3.EventType.OBJECT_CREATED],
    filters: [{ prefix: "uploaded" }],
  });

  lambdaFunction.addEventSource(s3EventSource);
}
