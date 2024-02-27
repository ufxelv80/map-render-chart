export function staticResourcesURL (fileName: string): string {
  return new URL(`../assets/images/${fileName}`, import.meta.url).href
}