import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  getProductByIdLambdaUtil,
  getProductsListLambdaUtil,
  createProductLambdaUtil,
} from "./lambdas";
import {
  addProductByIdResource,
  addProductsResource,
  createApiGateway,
  createLambdaIntegration,
} from "./api";
import { HttpMethod } from "aws-cdk-lib/aws-events";

export class HelloLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a Lambda function for getting the list of products
    const getProductsListLambda = getProductsListLambdaUtil(this);

    // Create a Lambda function for getting a product by ID
    const getProductByIdLambda = getProductByIdLambdaUtil(this);

    // Create a lambda function for creating a new product
    const createProductLambda = createProductLambdaUtil(this);

    // Create an API Gateway for the product service
    const api = createApiGateway(this);

    // Add a /products resource to the API
    const products = addProductsResource(api);

    // Add a /products/{productId} resource to the API
    const getProductById = addProductByIdResource(products);

    // Create an integration between the /products resource and the getProductsListLambda function
    createLambdaIntegration(products, getProductsListLambda, HttpMethod.GET);

    // Create an integration between the /products resource and the createProductLambda function
    createLambdaIntegration(products, createProductLambda, HttpMethod.POST);

    // Create an integration between the /products/{productId} resource and the getProductByIdLambda function
    createLambdaIntegration(
      getProductById,
      getProductByIdLambda,
      HttpMethod.GET
    );
  }
}
