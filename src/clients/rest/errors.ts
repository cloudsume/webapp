export class ResponseError extends Error {
  constructor(message: string, readonly response: Response) {
    super(message);
  }
}

/**
 * Represents HTTP 400 (bad request) error.
 */
export class RequestError extends ResponseError {
  constructor(response: Response, readonly errors: Map<string, string[]>) {
    super('The request is not valid.', response);
  }
}
