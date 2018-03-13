/// <reference types='node' />

import http = require('http');
import https = require('https');
import stream = require('stream');

export interface IRequestOptions {
  qs?: { [key: string]: string | number | boolean | Array<string | number> };
  headers?: { [key: string]: string };
  maxRedirects?: number;
  json?: boolean;
  agent?: boolean | http.Agent | https.Agent;
  resolveWithFullResponse?: boolean;
  verbose?: boolean;
  compression?: string[];
}

export interface IJSONable {
  [key: string]: string | number | boolean | Array<string | number | IJSONable >;
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
