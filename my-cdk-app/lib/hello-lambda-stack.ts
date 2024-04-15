import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from "path";
import { Construct } from "constructs";

export class HelloLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a Lambda function for getting the list of products
    const getProductsListLambda = new lambda.Function(this, "getProductsList", {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "getProductsList.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
    });

    // Create a Lambda function for getting a product by ID
    const getProductByIdLambda = new lambda.Function(this, "getProductsById ", {
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(5),
      handler: "getProductsById.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
    });

    // Create an API Gateway for the product service
    const api = new apigateway.RestApi(this, "ProductApi", {
      restApiName: "Product Service",
    });

    // Add a /products resource to the API
    const products = api.root.addResource("products");
    products.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: ["GET"],
    });

    // Add a /products/{productId} resource to the API
    const getProductById = products.addResource("{productId}");
    getProductById.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: ["GET"],
    });

    // Create an integration between the /products resource and the getProductsListLambda function
    const getProductsListIntegration = new apigateway.LambdaIntegration(
      getProductsListLambda
    );
    // Add a GET method to the /products resource
    products.addMethod("GET", getProductsListIntegration);

    // Create an integration between the /products/{productId} resource and the getProductByIdLambda function
    const getProductsByIdIntegration = new apigateway.LambdaIntegration(
      getProductByIdLambda
    );
    // Add a GET method to the /products/{productId} resource
    getProductById.addMethod("GET", getProductsByIdIntegration);
  }
}
