export type ScanState =
  | { status: 'REQUESTING_PERMISSION' }
  | { status: 'READY' }
  | { status: 'CAPTURED'; localUri: string }
  | { status: 'UPLOADING'; progress: number }
  | { status: 'PROCESSING'; analysisId: string }
  | { status: 'REVIEWING'; analysisId: string }
  | { status: 'COMPLETED'; analysisId: string }
  | { status: 'FAILURE'; message: string };
