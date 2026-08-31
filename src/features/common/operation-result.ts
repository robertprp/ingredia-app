export type AsyncState<TData, TError> =
  | { status: 'IDLE' }
  | { status: 'LOADING' }
  | { status: 'SUCCESS'; data: TData }
  | { status: 'FAILURE'; error: TError };

export type OperationResult<TValue, TFailure> =
  | { success: true; value: TValue }
  | { success: false; failure: TFailure };
