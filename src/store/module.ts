export function key(name: string, child?: string): string {
  return (child !== undefined) ? `${child}/${name}` : name;
}
