import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { HttpMethod } from "aws-cdk-lib/aws-events";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export function createApiGateway(scope: Construct) {
  return new apigateway.RestApi(scope, "ProductApi", {
    restApiName: "Product Service",
  });
}

export function addProductsResource(api: apigateway.RestApi) {
  const products = api.root.addResource("products");

  products.addCorsPreflight({
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS,
  });

  return products;
}

export function addProductByIdResource(products: apigateway.Resource) {
  const getProductById = products.addResource("{productId}");

  getProductById.addCorsPreflight({
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS,
  });

  return getProductById;
}

export function createLambdaIntegration(
  resource: apigateway.IResource,
  lambdaFunction: lambda.IFunction,
  method: HttpMethod
) {
  const lambdaIntegration = new apigateway.LambdaIntegration(lambdaFunction);

  resource.addMethod(method, lambdaIntegration);
}
