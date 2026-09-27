export class ReportError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ReportError";
    this.status = status;
  }
}
