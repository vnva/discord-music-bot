import 'dotenv/config';

interface EnvVariables {
  BOT_TOKEN: string;
  BOT_APPLICATION_ID: string;
  TEST_GUILD_ID: string | null;
  PRODUCTION: boolean;
  ENABLE_PESENCE: boolean;
}

function readRequiredStringVariable(key: string) {
  const variable = process.env[key];
  if (typeof variable !== 'string') throw new Error(`${key} variable should be string!`);
  if (!variable) throw new Error(`${key} variable required!`);

  return variable;
}

function readStringVariable(key: string) {
  const variable = process.env[key];
  if (!variable) return null;

  if (typeof variable !== 'string') throw new Error(`${key} variable should be string!`);
  return variable;
}

function readBooleanVariable(key: string, defaultValue: boolean) {
  const variable = process.env[key];
  if (!variable) return defaultValue;

  if (typeof variable !== 'string' && variable !== 'true' && variable !== 'false') {
    throw new Error(`${key} variable should be boolean!`);
  }

  return variable === 'true' ? true : false;
}

export const ENV_VARIABLES: EnvVariables = {
  BOT_TOKEN: readRequiredStringVariable('BOT_TOKEN'),
  BOT_APPLICATION_ID: readRequiredStringVariable('BOT_APPLICATION_ID'),
  TEST_GUILD_ID: readStringVariable('TEST_GUILD_ID'),
  PRODUCTION: readBooleanVariable('PRODUCTION', true),
  ENABLE_PESENCE: readBooleanVariable('ENABLE_PESENCE', false),
};
