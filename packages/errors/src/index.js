export class NotFoundError extends Error {
  constructor(message = "") {
    super();
    this.status = 404;
    this.message = message;
    this.title = "404 Not Found";
  }
}

export class BadRequestError extends Error {
  constructor(message = "") {
    super();
    this.status = 400;
    this.message = message;
    this.title = "400 Bad Request";
  }
}

export class InternalServerError extends Error {
  constructor(message = "") {
    super();
    this.status = 500;
    this.message = message;
    this.title = "500 Internal Server Error";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "") {
    super();
    this.status = 401;
    this.message = message;
    this.title = "401 Unauthorized";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "") {
    super();
    this.status = 403;
    this.message = message;
    this.title = "403 Forbidden";
  }
}

export class TooManyRequestsError extends Error {
  constructor(message = "") {
    super();
    this.status = 429;
    this.message = message;
    this.title = "429 Too Many Requests";
  }
}

export class MethodNotAllowed extends Error {
  constructor(message = "") {
    super();
    this.status = 405;
    this.message = message;
    this.title = "405 Method Not Allowed";
  }
}
