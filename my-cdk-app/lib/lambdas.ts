import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { Construct } from "constructs";

export function getProductsListLambdaUtil(scope: Construct) {
  return new lambda.Function(scope, "getProductsList", {
    runtime: lambda.Runtime.NODEJS_20_X,
    memorySize: 1024,
    timeout: cdk.Duration.seconds(5),
    handler: "getProductsList.handler",
    code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
    environment: {
      PRODUCTS_TABLE_NAME: "Products",
      STOCK_TABLE_NAME: "Stock",
    },
  });
}

export function getProductByIdLambdaUtil(scope: Construct) {
  return new lambda.Function(scope, "getProductsById", {
    runtime: lambda.Runtime.NODEJS_20_X,
    timeout: cdk.Duration.seconds(5),
    handler: "getProductsById.handler",
    code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
    environment: {
      PRODUCTS_TABLE_NAME: "Products",
      STOCK_TABLE_NAME: "Stock",
    },
  });
}

export function createProductLambdaUtil(scope: Construct) {
  return new lambda.Function(scope, "createProduct", {
    runtime: lambda.Runtime.NODEJS_20_X,
    timeout: cdk.Duration.seconds(5),
    handler: "createProduct.handler",
    code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
    environment: {
      PRODUCTS_TABLE_NAME: "Products",
      STOCK_TABLE_NAME: "Stock",
    },
  });
}
