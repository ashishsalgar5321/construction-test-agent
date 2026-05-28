export function storageErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  return 'Storage operation failed'
}
