export const enum FileNameError {
  None,
  TooShort,
  TooLong,
  Reserved,
  HasInvalidChars
}

/**
 * Validate a specified file name.
 *
 * @param name Name of the file to validate. The value must be trimmed.
 * @param parent Parent path of the file. Use empty string for root path, not '/'.
 *
 * @returns Validation result.
 */
export function validateFileName(name: string, parent: string): FileNameError {
  if (!name) {
    return FileNameError.TooShort;
  } else if (name.length > 200) {
    return FileNameError.TooLong;
  } else if (!parent && (name === 'main.tex' || name === 'main.pdf' || name === 'output')) {
    return FileNameError.Reserved;
  } else if (name === '.' || name === '..') {
    return FileNameError.Reserved;
  }

  for (const c of name) {
    if (!FileNameAllowedCharacters.has(c)) {
      return FileNameError.HasInvalidChars;
    }
  }

  return FileNameError.None;
}

export async function getFileContent(name: string, file: Blob): Promise<unknown> {
  if (name.endsWith('.cls') || name.endsWith('.stg') || name.endsWith('.sty')) {
    return await file.text();
  } else {
    return file;
  }
}

const FileNameAllowedCharacters = new Set(getFileNameAllowedCharacters());

function* getFileNameAllowedCharacters() {
  for (const c of ' -.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz') {
    yield c;
  }
}
