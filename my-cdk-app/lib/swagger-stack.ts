import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import path = require("path");

export class SwaggerUIStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a new S3 bucket for storing the static site content
    const hostingBucket = new cdk.aws_s3.Bucket(this, "SwaggerUIBucket", {
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Create a CloudFront distribution to serve your website globally
    const distribution = new cdk.aws_cloudfront.Distribution(
      this,
      "SwaggerUICloudfrontDistribution",
      {
        defaultBehavior: {
          origin: new cdk.aws_cloudfront_origins.S3Origin(hostingBucket),
          viewerProtocolPolicy:
            cdk.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        defaultRootObject: "index.html",
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
          },
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
          },
        ],
      }
    );

    new cdk.aws_s3_deployment.BucketDeployment(
      this,
      "SwaggerUIBucketDeployment",
      {
        sources: [
          cdk.aws_s3_deployment.Source.asset(
            path.join(__dirname, "../swagger-ui")
          ),
        ],
        destinationBucket: hostingBucket,
        distribution,
        distributionPaths: ["/*"],
      }
    );

    new cdk.CfnOutput(this, "SwaggerUICloudFront", {
      value: distribution.domainName,
      description: "The distribution URL",
      exportName: "SwaggerUICloudFront",
    });

    new cdk.CfnOutput(this, "SwaggerUIBucketURL", {
      value: hostingBucket.bucketName,
      description: "The name of the S3 bucket",
      exportName: "SwaggerUIBucketURL",
    });
  }
}
