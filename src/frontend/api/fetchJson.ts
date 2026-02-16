export class ApiError extends Error {
  public originalError: Error;

  constructor(error: Error) {
    super(error.message);

    // Let's apply some magic you can find at https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, ApiError.prototype);

    this.originalError = error;
  }
}

export type JsonApiResult =
  | { status: "ok"; data: unknown }
  | { status: "error"; error: ApiError };

export async function fetchJson(route: string): Promise<JsonApiResult> {
  try {
    const response = await fetch(route);
    const body = await response.json();

    return { status: "ok", data: body };
  } catch (err: unknown) {
    if (!(err instanceof Error))
      return {
        status: "error",
        // If we are thrown something that is not an error, try and coerce that thing
        // into a string anyway. We should generally (always?) only be thrown a string
        // in our code. I don't know why we'd throw a non-string.
        error: new ApiError(new Error(err + "")),
      };

    return { status: "error", error: new ApiError(err) };
  }
}
