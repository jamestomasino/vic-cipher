export class VicInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VicInputError";
  }
}
