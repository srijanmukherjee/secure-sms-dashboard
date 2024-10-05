import {Exception} from 'common';

export function translateError(error: unknown): Exception {
  if (error instanceof Exception) {
    return error;
  } else if (error instanceof Error) {
    return new Exception(error.message, error);
  } else if (typeof error === 'string') {
    return new Exception(error);
  } else {
    console.error(error);
    return new Exception('unknown error');
  }
}
