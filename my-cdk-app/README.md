# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template

### `cdk:bootstrap`

Prepares the environment for the AWS CDK deployment. It creates necessary resources like an S3 bucket to manage the deployment.

### `cdk:synth`

Synthesizes and prints the CloudFormation template for this CDK application. It's a way to see what resources will be created or modified before actually deploying the application.

### `cdk:deploy`

Deploys the AWS CDK app to your AWS account. It creates or updates the resources defined in your CDK app.
After deploying, don't forget to update `cloudfront:invalidate` and `check-invalidate-status` endpoints

### `cdk:destroy`

Removes all resources that were created by the cdk:deploy command. It's a way to clean up the resources when you're done with the application.

### `cloudfront:invalidate`

Invalidates the CloudFront distribution cache. It's necessary to run this command when you update the contents of your S3 bucket, so that the latest contents are served through CloudFront. Don't forget to update the Distribution ID after having destroyed the application.

### CloudFront URL

`https://d29a4pqjrfrmoo.cloudfront.net`
