# React-shop-cloudfront

This is frontend starter project for nodejs-aws mentoring program. It uses the following technologies:

- [Vite](https://vitejs.dev/) as a project bundler
- [React](https://beta.reactjs.org/) as a frontend framework
- [React-router-dom](https://reactrouterdotcom.fly.dev/) as a routing library
- [MUI](https://mui.com/) as a UI framework
- [React-query](https://react-query-v3.tanstack.com/) as a data fetching library
- [Formik](https://formik.org/) as a form library
- [Yup](https://github.com/jquense/yup) as a validation schema
- [Serverless](https://serverless.com/) as a serverless framework
- [Vitest](https://vitest.dev/) as a test runner
- [MSW](https://mswjs.io/) as an API mocking library
- [Eslint](https://eslint.org/) as a code linting tool
- [Prettier](https://prettier.io/) as a code formatting tool
- [TypeScript](https://www.typescriptlang.org/) as a type checking tool

## Available Scripts

### `start`

Starts the project in dev mode with mocked API on local environment.

### `build`

Builds the project for production in `dist` folder.

### `preview`

Starts the project in production mode on local environment.

### `test`, `test:ui`, `test:coverage`

Runs tests in console, in browser or with coverage.

### `lint`, `prettier`

Runs linting and formatting for all files in `src` folder.

### `client:deploy`, `client:deploy:nc`

Deploy the project build from `dist` folder to configured in `serverless.yml` AWS S3 bucket with or without confirmation.

### `client:build:deploy`, `client:build:deploy:nc`

Combination of `build` and `client:deploy` commands with or without confirmation.

### `cloudfront:setup`

Deploy configured in `serverless.yml` stack via CloudFormation.

### `cloudfront:domainInfo`

Display cloudfront domain information in console.

### `cloudfront:invalidateCache`

Invalidate cloudfront cache.

### `cloudfront:build:deploy`, `cloudfront:build:deploy:nc`

Combination of `client:build:deploy` and `cloudfront:invalidateCache` commands with or without confirmation.

### `cloudfront:update:build:deploy`, `cloudfront:update:build:deploy:nc`

Combination of `cloudfront:setup` and `cloudfront:build:deploy` commands with or without confirmation.

### `serverless:remove`

Remove an entire stack configured in `serverless.yml` via CloudFormation.

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

### `build-and-deploy`

First builds the application by running the build script, and then deploys the application by running the deploy script. It's a convenient way to build and deploy the application in one step.

### S3-URL

`mycdkappstack-frontendbucketefe2e19c-a5vwybpxp3jd`

### CloudFront URL

`https://d61lr7r0zluxq.cloudfront.net`
