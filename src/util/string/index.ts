/**
 * Like s.charAt(i - 1) but handle the surrogate pair correctly.
 *
 * @param i The target index, must be pointed to a valid character (not a low-surrogate). Can be the end of string.
 */
export function charBefore(s: string, i: number): string {
  // sanity check
  if (!s.length) {
    throw new Error('The target string is empty.');
  } else if (i > s.length || i <= 0) {
    throw new Error('The target index is invalid.');
  }

  // check if the target index point the a valid character
  if (i < s.length) {
    let c = s.charCodeAt(i);

    if (isLowSurrogate(c)) {
      throw new Error('The target index is invalid.');
    }
  }

  // get the character before the target index
  const c = s.charCodeAt(i - 1);

  if (isLowSurrogate(c)) {
    // we assume the string in JavaScript is always a valid UTF-16 string, which mean there are a high surrogate for sure
    return String.fromCharCode(s.charCodeAt(i - 2), c);
  } else if (isHighSurrogate(c)) {
    // this should not be possible if string in JavaScript is always a valid UTF-16 string
    throw new Error('The character before the target is a high surrogate.');
  } else {
    return String.fromCharCode(c);
  }
}

/**
 * Like s.trimLeft() but exclude a new line character (LF).
 */
export function trimLeftNonLF(s: string): string {
  let i;

  for (i = 0; i < s.length; i++) {
    let c: string | number = s.charCodeAt(i);

    if (isHighSurrogate(c)) {
      c = String.fromCharCode(c, s.charCodeAt(++i));
    } else if (c === 10) {
      break;
    } else {
      c = String.fromCharCode(c);
    }

    if (c.trim().length) {
      break;
    }
  }

  return s.slice(i);
}

/**
 * Like s.trimRight() but exclude a new line character (LF).
 */
export function trimRightNonLF(s: string): string {
  let i;

  for (i = s.length - 1; i >= 0; i--) {
    let c: string | number = s.charCodeAt(i);

    if (isLowSurrogate(c)) {
      c = String.fromCharCode(s.charCodeAt(--i), c);
    } else if (c === 10) {
      break;
    } else {
      c = String.fromCharCode(c);
    }

    if (c.trim().length) {
      break;
    }
  }

  return s.slice(0, i + 1);
}

function isHighSurrogate(v: number): boolean {
  return v >= 0xd800 && v <= 0xdbff;
}

function isLowSurrogate(v: number): boolean {
  return v >= 0xdc00 && v <= 0xdfff;
}
