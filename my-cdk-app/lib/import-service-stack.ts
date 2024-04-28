import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  createImportBucket,
  createLambdaFunction,
  createApiGateway,
  addImportResource,
  addS3EventSource,
} from "./import-service.utils";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const importBucket = createImportBucket(this);

    const importProductsFileLambda = createLambdaFunction(
      this,
      importBucket,
      "ImportProductsFile",
      "importProductsFile"
    );

    const api = createApiGateway(this);

    addImportResource(api, importProductsFileLambda);

    const importFileParserLambda = createLambdaFunction(
      this,
      importBucket,
      "importFileParser",
      "importFileParser"
    );

    addS3EventSource(importFileParserLambda, importBucket);
  }
}
