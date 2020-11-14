import { NodemailerTransport } from '@qccareerschool/winston-nodemailer';
import * as dotenv from 'dotenv';
import * as winston from 'winston';
import { format, transports } from 'winston';

dotenv.config();

if (typeof process.env.EMAIL_USERNAME === 'undefined') {
  throw new Error('EMAIL_USERNAME not specified in .env file');
}
const username = process.env.EMAIL_USERNAME;

if (typeof process.env.EMAIL_PASSWORD === 'undefined') {
  throw new Error('EMAIL_PASSWORD not specified in .env file');
}
const password = process.env.EMAIL_PASSWORD;

if (typeof process.env.EMAIL_HOST === 'undefined') {
  throw new Error('EMAIL_HOST not specified in .env file');
}
const host = process.env.EMAIL_HOST;

if (typeof process.env.EMAIL_TLS === 'undefined') {
  throw new Error('EMAIL_TLS not specified in .env file');
}
const tls = process.env.EMAIL_TLS === 'TRUE' ? true : false;

if (typeof process.env.EMAIL_TO === 'undefined') {
  throw new Error('EMAIL_TO not specified in .env file');
}
const to = process.env.EMAIL_TO;

if (typeof process.env.EMAIL_FROM === 'undefined') {
  throw new Error('EMAIL_FROM not specified in .env file');
}
const from = process.env.EMAIL_FROM;

export const logger = winston.createLogger({
  transports: [
    new transports.Console({
      format: format.combine(format.colorize()),
    }),
    new transports.File({
      filename: '/var/log/web-geolocation.log',
    }),
    new NodemailerTransport({
      auth: {
        pass: password,
        user: username,
      },
      filter: ({ level, message, meta }) => level === 'error',
      from,
      host,
      port: 587,
      secure: false,
      tags: [ 'geoLocation' ],
      to,
    }),
  ],
});
