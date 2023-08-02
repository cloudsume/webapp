// safari 15 supported this but not for previous version
DataView.prototype.getBigInt64 ??= function (this: DataView, byteOffset: number, littleEndian?: boolean): bigint {
  if (littleEndian) {
    throw new Error('Little endian is not supported.');
  }

  const h = BigInt(this.getInt32(byteOffset, littleEndian));
  const l = BigInt(this.getUint32(byteOffset + 4, littleEndian));

  // sign bit on the h is not affected by the shift, that mean it is effectively merge everything except sign bit on the h
  return (h << BigInt(32)) | l;
};
