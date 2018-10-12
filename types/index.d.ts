/// <reference types='node' />

import http = require('http');
import https = require('https');
import stream = require('stream');

/**
 * Supported compression types.
 */
export enum CompressionType {
  GZIP = 'gzip',
  DEFLATE = 'deflate'
}

/**
 * Enables logging to whatever logging facility needed.
 */
export interface RequestPromiseLiteLogger {
  /**
   * Logs the debug level message.
   *
   * @param {...tokens} - The message strings or token values in the messages.
   */
  debug(...tokens);
}

export interface IRequestOptions {

  /**
   * Parameters for query string. ({ param: 1 } produces ?param=1 etc.) 
   */
  qs?: { [key: string]: string | number | boolean | Array<string | number> };
  
  /**
   * An object that consumes the logging requests
   */
  logger?: RequestPromiseLiteLogger;

  /**
   * The headers to pass forward (as-is)
   */
  headers?: { [key: string]: string };

  /**
   * How many redirects to follow
   */
  maxRedirects?: number;
  
  /**
   * JSON shortcut for req headers & response parsing
   */
  json?: boolean;

  /**
   * The HTTP agent for subsequent calls
   */
  agent?: boolean | http.Agent | https.Agent;
  
  /**
   * Resolve with the response, not the body
   */
  resolveWithFullResponse?: boolean;
  
  /**
   * Run the requests in verbose mode (produces logs)
   */
  verbose?: boolean;
  
  /**
   * Support GZIP or deflate compression
   */
  compression?: CompressionType[];
  
  /**
   * Basic authentication
   */
  auth?: {
    username: string,
    password: string
  };

  /**
   * Send as JSON. Use form parameter to send as form post.
   */
  body?: { [key: string]: any };

  /**
   * Send as application/x-www-form-urlencoded. Use body to post as json.
   */
  form?: { [key: string]: any };

  /**
   * Abort the request if it has not completed within a given number of milliseconds
   */
  timeout?: number;

}

export interface IJSONable {
  [key: string]: string | number | boolean | null | IJSONable | Array<string | number | boolean | null | IJSONable>;
}

export class Request {
  constructor(method: string, url: string, options?: IRequestOptions);
  public run(): Promise<IJSONable | Buffer>;
}

export class StreamReader extends stream.Writable {
  constructor(readable: stream.Readable);
  public readAll(): Promise<Buffer>;
}

export class RequestError extends Error {
  public toString(): string;
}

export class ConnectionError extends RequestError {
  constructor(message: string, rawMessage: string);
}

export class HTTPError extends RequestError {
  constructor(message: string, statusCode: number, response: JSON | Buffer);
}

export class ParseError extends RequestError {
  constructor(message: string, rawMessage: string);
}

export function trace(url: string, options?: IRequestOptions): Promise<IJSONable | Buffer>;
export function head(url: string, options?: IRequestOptions): Promise<IJSONable | Buffer>;
export function options(url: string, options?: IRequestOptions): Promise<IJSONable | Buffer>;
export function get(url: string, options?: IRequestOptions): Promise<IJSONable | Buffer>;
export function post(url: string, options?: IRequestOptions): Promise<IJSONable | Buffer>;
export function put(url: string, options?: IRequestOptions): Promise<IJSONable | Buffer>;
export function patch(url: string, options?: IRequestOptions): Promise<IJSONable | Buffer>;
export function del(url: string, options?: IRequestOptions): Promise<IJSONable | Buffer>;
