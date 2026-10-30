import dotenv from 'dotenv';

dotenv.config();

function requiredEnv(name: string): string {
  const value = process.env[name];
  //console.log(value);
  if (!value) {
    throw new Error(
      `Required environment variable "${name}" is not defined.`
    );
  }

  return value;
}

//console.log('BASE_URL - env.ts:', process.env.BASE_URL);
//console.log('APP_USERNAME: - env.ts', process.env.APP_USERNAME);
export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'qa',

  baseUrl: requiredEnv('BASE_URL'),
 

  app: {
    username: requiredEnv('APP_USERNAME'),
    password: requiredEnv('APP_PASSWORD'),

    superAdmin: {
      username: requiredEnv('APP_SUPERADMIN_USERNAME'),
      password: requiredEnv('APP_SUPERADMIN_PASSWORD')
    },

    authUrl: requiredEnv('APP_AUTH_URL'),

    otpHelperUrl: requiredEnv('APP_OTP_HELPER_URL')

    
  }
};