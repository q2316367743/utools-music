interface OpenFileOption {
  title?: string,
  defaultPath?: string,
  buttonLabel?: string,
  filters?: { name: string, extensions: string[] }[],
  properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent'>,
  message?: string,
  securityScopedBookmarks?: boolean
}

interface StatsBase<T> {
  isFile(): boolean;

  isDirectory(): boolean;

  isBlockDevice(): boolean;

  isCharacterDevice(): boolean;

  isSymbolicLink(): boolean;

  isFIFO(): boolean;

  isSocket(): boolean;

  dev: T;
  ino: T;
  mode: T;
  nlink: T;
  uid: T;
  gid: T;
  rdev: T;
  size: T;
  blksize: T;
  blocks: T;
  atimeMs: T;
  mtimeMs: T;
  ctimeMs: T;
  birthtimeMs: T;
  atime: Date;
  mtime: Date;
  ctime: Date;
  birthtime: Date;
}

interface Window {
  preload: {
    /**
     * 打开一个文件，并返回File对象
     * @param options 参数
     * @return 返回File对象
     */
    openFile(options: OpenFileOption): Promise<File>,
    /**
     * 从url下载一个文件到指定目录
     * @param url 链接
     * @param path 要保存的文件路径，包含文件名
     */
    downloadFileFromUrl(url: string, path: string): Promise<void>,
    /**
     * 下载一个文件
     * @param data 文件内容，可以使blob(file)或ArrayBuffer或者链接或者DATA URL
     * @param name 文件名
     * @return 文件保存的路径
     */
    downloadFile(data: string | Blob | ArrayBuffer, name: string): Promise<string>,
    fs: {
      existsSync(path: string): boolean;
      readdir(path: string, callback: (e: Error, names: Array<string>) => void): void;
      statSync(path: string): StatsBase<number>;
      readFile(path: string, callback: (e: Error, file: Uint8Array) => void): void;
      readFile(path: string, encode: 'utf8', callback: (e: Error, file: string) => void): void;
    },
    path: {
      join(...paths: Array<string>): string;
      basename(path: string): string;
      extname(path: string): string;
    },
    ipcRenderer: {
      sendLyric(ids: Array<number>, text: string): void
    }
  }
}

declare module 'crypto-js';
declare module 'qs';
declare module 'he'
