import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssmClient = new SSMClient({ 
  region: process.env.AWS_REGION || "eu-west-1" 
});

const parameterCache = {};

/**
 * Retrieve a parameter from AWS Systems Manager Parameter Store
 * @param {string} parameterName - The name of the parameter (e.g., /ogafix/db/password)
 * @param {boolean} decrypt - Whether to decrypt SecureString parameters
 * @returns {Promise<string>} The parameter value
 */
export async function getParameter(parameterName, decrypt = true) {
  // Check cache first (cache for 1 hour)
  if (parameterCache[parameterName]) {
    return parameterCache[parameterName];
  }

  try {
    const command = new GetParameterCommand({
      Name: parameterName,
      WithDecryption: decrypt,
    });

    const response = await ssmClient.send(command);
    const value = response.Parameter.Value;

    // Cache the value for 1 hour
    parameterCache[parameterName] = value;
    setTimeout(() => {
      delete parameterCache[parameterName];
    }, 3600000);

    return value;
  } catch (error) {
    console.error(`Error retrieving parameter ${parameterName}:`, error.message);
    throw new Error(`Failed to retrieve parameter ${parameterName}: ${error.message}`);
  }
}

/**
 * Retrieve all database configuration from Parameter Store
 * @returns {Promise<Object>} Database configuration object
 */
export async function getDatabaseConfig() {
  try {
    const [password, username, host, port, dbName] = await Promise.all([
      getParameter("/ogafix/db/password"),
      getParameter("/ogafix/db/username"),
      getParameter("/ogafix/db/host"),
      getParameter("/ogafix/db/port"),
      getParameter("/ogafix/db/name"),
    ]);

    return {
      host,
      port: parseInt(port, 10),
      database: dbName,
      user: username,
      password,
    };
  } catch (error) {
    console.error("Error retrieving database configuration:", error.message);
    throw error;
  }
}

/**
 * Test connection to Parameter Store
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testParameterStoreConnection() {
  try {
    await getParameter("/ogafix/db/name", false);
    return true;
  } catch (error) {
    console.error("Parameter Store connection test failed:", error.message);
    return false;
  }
}
