import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  console.log("Event: ", event);

  if (event.type !== "TOKEN") {
    throw new Error("Unauthorized");
  }

  try {
    const authorizationToken = event.authorizationToken;
    const encodedCredentials = authorizationToken.split(" ")[1];
    const buffer: Buffer = Buffer.from(encodedCredentials, "base64");
    const [username, password] = buffer.toString("utf-8").split(":");

    console.log(`username: ${username} and password: ${password}`);

    const storedUserPassword = process.env[username];

    console.log(`username: ${username}, password: ${password}`);
    console.log(`storedPassword: ${storedUserPassword}`);

    const effect =
      !storedUserPassword || storedUserPassword !== password ? "Deny" : "Allow";

    const policy: APIGatewayAuthorizerResult = generatePolicy(
      encodedCredentials,
      event.methodArn,
      effect
    );

    return policy;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log("Error: ", error.message);
    throw new Error("Forbidden");
  }
};

const generatePolicy = (
  principalId: string,
  resource: string,
  effect: string
): APIGatewayAuthorizerResult => {
  const policyDocument = {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: resource,
      },
    ],
  };

  return {
    principalId,
    policyDocument,
  };
};
