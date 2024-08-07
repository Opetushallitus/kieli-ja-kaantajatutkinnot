export class FileUtils {
  static getReadableFileSize(bytes: number) {
    const units = ['kB', 'MB', 'GB'];
    let idx = -1;
    let res = bytes;
    do {
      res /= 1024;
      idx++;
    } while (res > 1024);

    return (
      Math.max(res, 0.1).toLocaleString('fi-FI', { maximumFractionDigits: 1 }) +
      ' ' +
      units[idx]
    );
  }
}
