require("dotenv").config();
const fs = require("fs");
const readline = require("readline");
const path = require("path");
const crypto = require("crypto");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const defaultValues = {
  DATABASE_HOST: "127.0.0.1",
  DATABASE_PORT: "3306",
  DATABASE_USER: "root",
  DATABASE_PASSWORD: "password",
  DATABASE_NAME: "mydb",
  ENCRYPTION_IV: "",
  ENCRYPTION_KEY: "",
  DEVELOPMENT_PRINT: "true",
  DEVELOPMENT_CREDENTIALS: "false",
  DEVELOPMENT_SENDER: "Server",
  WEBSITE_URL: "http://127.0.0.1",
  WEBSITE_HOST: "127.0.0.1",
  WEBSITE_PORT: "5000",
};

// Function to validate a 32-character hex string (for IV)
const isValidIV = (iv) => /^[a-fA-F0-9]{32}$/.test(iv);

// Function to validate a 64-character hex string (for Key)
const isValidKey = (key) => /^[a-fA-F0-9]{64}$/.test(key);

const askQuestion = (question, defaultValue, validator) => {
  return new Promise((resolve) => {
    rl.question(`${question} [${defaultValue}]: `, (answer) => {
      const trimmedAnswer = answer.trim() || defaultValue;
      if (validator && !validator(trimmedAnswer)) {
        console.log("Invalid input format.");
        resolve(askQuestion(question, defaultValue, validator));
      } else {
        resolve(trimmedAnswer);
      }
    });
  });
};

const generateCrypto = () => {
  return {
    iv: crypto.randomBytes(16).toString("hex"),
    key: crypto.randomBytes(32).toString("hex"),
  };
};

const confirmData = (data) => {
  return new Promise((resolve) => {
    console.log("\nPlease confirm the following details:");
    console.log(data);
    rl.question("\nIs this information correct? (Y/N): ", (answer) => {
      resolve(answer.trim().toUpperCase() === "Y");
    });
  });
};

const createEnvFile = async () => {
  try {
    const envFilePath = path.join(__dirname, "../../.env");

    const DATABASE_HOST = await askQuestion(
      "Enter the database host",
      defaultValues.DATABASE_HOST
    );
    const DATABASE_PORT = await askQuestion(
      "Enter the database port",
      defaultValues.DATABASE_PORT
    );
    const DATABASE_USER = await askQuestion(
      "Enter the database user",
      defaultValues.DATABASE_USER
    );
    const DATABASE_PASSWORD = await askQuestion(
      "Enter the database password",
      defaultValues.DATABASE_PASSWORD
    );
    const DATABASE_NAME = await askQuestion(
      "Enter the database name",
      defaultValues.DATABASE_NAME
    );

    let ENCRYPTION_IV = defaultValues.ENCRYPTION_IV;
    let ENCRYPTION_KEY = defaultValues.ENCRYPTION_KEY;

    const useDefaultEncryption = await askQuestion(
      "Generate new encryption IV and key? (Y/N)",
      "Y"
    );

    if (useDefaultEncryption.toUpperCase() === "Y") {
      const { iv, key } = generateCrypto();
      ENCRYPTION_IV = iv;
      ENCRYPTION_KEY = key;
      console.log(`Generated IV: ${ENCRYPTION_IV}`);
      console.log(`Generated Key: ${ENCRYPTION_KEY}`);
    } else {
      ENCRYPTION_IV = await askQuestion(
        "Enter the encryption IV",
        ENCRYPTION_IV,
        isValidIV
      );
      ENCRYPTION_KEY = await askQuestion(
        "Enter the encryption key",
        ENCRYPTION_KEY,
        isValidKey
      );
    }

    const DEVELOPMENT_PRINT = await askQuestion(
      "Enable development print (true/false)",
      defaultValues.DEVELOPMENT_PRINT
    );
    const DEVELOPMENT_CREDENTIALS = await askQuestion(
      "Enable development credentials (true/false)",
      defaultValues.DEVELOPMENT_CREDENTIALS
    );
    const DEVELOPMENT_SENDER = await askQuestion(
      "Enter the development sender",
      defaultValues.DEVELOPMENT_SENDER
    );
    const WEBSITE_URL = await askQuestion(
      "Enter the website URL",
      defaultValues.WEBSITE_URL
    );
    const WEBSITE_HOST = await askQuestion(
      "Enter the website host",
      defaultValues.WEBSITE_HOST
    );
    const WEBSITE_PORT = await askQuestion(
      "Enter the website port",
      defaultValues.WEBSITE_PORT
    );

    const envContent = `
DATABASE_HOST=${DATABASE_HOST}
DATABASE_PORT=${DATABASE_PORT}
DATABASE_USER=${DATABASE_USER}
DATABASE_PASSWORD=${DATABASE_PASSWORD}
DATABASE_NAME=${DATABASE_NAME}

ENCRYPTION_IV=${ENCRYPTION_IV}
ENCRYPTION_KEY=${ENCRYPTION_KEY}

DEVELOPMENT_PRINT=${DEVELOPMENT_PRINT}
DEVELOPMENT_CREDENTIALS=${DEVELOPMENT_CREDENTIALS}
DEVELOPMENT_SENDER=${DEVELOPMENT_SENDER}

WEBSITE_URL=${WEBSITE_URL}
WEBSITE_HOST=${WEBSITE_HOST}
WEBSITE_PORT=${WEBSITE_PORT}
    `.trim();

    const isConfirmed = await confirmData(envContent);

    if (isConfirmed) {
      fs.writeFileSync(envFilePath, envContent, { encoding: "utf8" });
      console.log(`.env file created at ${envFilePath}`);
    } else {
      console.log("Operation cancelled. No .env file was created.");
    }
  } catch (err) {
    console.error("Error creating .env file:", err);
  } finally {
    rl.close();
  }
};

createEnvFile();
