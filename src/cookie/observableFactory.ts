import { Observable } from 'rxjs';

export function createObservable(data: any) {
  return new Observable((sub) => {
    sub.next(data);
    sub.complete();
  });
}

export function observableError(error: any) {
  return new Observable(() => {
    throw error;
  });
}
