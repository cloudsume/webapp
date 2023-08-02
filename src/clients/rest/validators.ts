export function isValidEmailAddress(value: string): boolean {
  // TODO: make a validation to match with the server side
  return value.length <= 254;
}

export function isValidResumeName(name: string): boolean {
  return name.length > 0 && name.length <= 100;
}
