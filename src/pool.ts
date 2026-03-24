import dotenv from 'dotenv';
import type { PoolOptions } from 'mysql2/promise';
import mysql from 'mysql2/promise';
import path from 'node:path';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
}

const user = process.env.DB_USERNAME;
if (typeof user === 'undefined') {
  throw Error('Environment variable DB_USERNAME not found');
}

const password = process.env.DB_PASSWORD;
if (typeof password === 'undefined') {
  throw Error('Environment variable DB_PASSWORD not found');
}

const database = process.env.DB_DATABASE;
if (typeof database === 'undefined') {
  throw Error('Environment variable DB_DATABASE not found');
}

const charset = process.env.DB_CHARSET;
if (typeof charset === 'undefined') {
  throw Error('Environment variable DB_CHARSET not found');
}

const connectionLimit = typeof process.env.DB_CONNECTION_LIMIT !== 'undefined'
  ? parseInt(process.env.DB_CONNECTION_LIMIT, 10)
  : 20;
if (isNaN(connectionLimit)) {
  throw Error('Invalid value for environment variable DB_CONNECTION_LIMIT');
}

const options: PoolOptions = {
  charset,
  connectionLimit,
  database,
  debug: process.env.DB_DEBUG === 'TRUE',
  password,
  user,
};

if (typeof process.env.DB_SOCKET_PATH !== 'undefined') {
  options.socketPath = process.env.DB_SOCKET_PATH;
} else if (typeof process.env.DB_HOST !== 'undefined') {
  options.host = process.env.DB_HOST;
}

if (process.env.DB_SSL === 'true') {
  options.ssl = {};
  if (typeof process.env.DB_CLIENT_CERT !== 'undefined') {
    options.ssl.cert = Buffer.from(process.env.DB_CLIENT_CERT, 'base64').toString('utf8');
  }
  if (typeof process.env.DB_CLIENT_KEY !== 'undefined') {
    options.ssl.key = Buffer.from(process.env.DB_CLIENT_KEY, 'base64').toString('utf8');
  }
  if (typeof process.env.DB_SERVER_CA !== 'undefined') {
    options.ssl.ca = Buffer.from(process.env.DB_SERVER_CA, 'base64').toString('utf8');
  }
}

export const pool = mysql.createPool(options);
