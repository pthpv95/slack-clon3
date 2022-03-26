import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
  constructor(public message: string) {
    super(message);
    this.message = message;
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }

  serializeErrors(): { message: string; field?: string | undefined; }[] {
    return [{
      message: this.message
    }]
  }
  statusCode = 404;
}