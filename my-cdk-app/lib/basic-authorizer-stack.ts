import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as dotenv from "dotenv";
import { Construct } from "constructs";

dotenv.config();

export class BasicAuthorizerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const gitPassword = process.env.UncleGabi;

    if (!gitPassword) {
      throw new Error("UncleGabi is not defined");
    }

    const basicAuthorizerLambda = new lambda.Function(
      this,
      "basicAuthorizerLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "handler",
        code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
        environment: {
          UncleGabi: gitPassword,
        },
      }
    );

    new cdk.CfnOutput(this, "ExportBasicAuthorizer", {
      value: basicAuthorizerLambda.functionArn,
      exportName: "basicAuthorizerArn",
    });
  }
}
