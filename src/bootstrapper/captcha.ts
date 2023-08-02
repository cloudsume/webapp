export function init(): Promise<void> {
  return new Promise(grecaptcha.ready);
}
