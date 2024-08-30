export function filterUndefined(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}

  for (const key in obj) {
    if (obj[key] !== undefined) {
      result[key] = obj[key]
    }
  }

  return result
}
