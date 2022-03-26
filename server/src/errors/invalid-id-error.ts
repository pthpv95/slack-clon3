import { CustomError } from "./custom-error";

export class InvalidIdError extends CustomError {
  constructor(public message: string) {
    super(message);
    this.message = message;
    Object.setPrototypeOf(this, InvalidIdError.prototype)
  }

  serializeErrors(): { message: string; field?: string | undefined; }[] {
    return [{
      message: this.message
    }]
  }
  statusCode = 400;
}