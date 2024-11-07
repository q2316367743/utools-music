export interface FileItem {
  path: string;
  name: string;
  extname: string;
}

export function readDirAsync(path: string): Promise<Array<string>> {
  return new Promise<Array<string>>((resolve, reject) => {
    window.preload.fs.readdir(path, (e, names) => {
      if (e) {
        reject(e);
        return;
      }
      resolve(names);
    })
  })
}

async function readFilesWrap(path: string, items: Array<FileItem>): Promise<void> {
  const names = await readDirAsync(path);
  for (let name of names) {
    const p = window.preload.path.join(path, name);
    const state = window.preload.fs.statSync(p);
    if (state.isFile()) {
      items.push({
        path: p,
        name: name,
        extname: window.preload.path.extname(name)
      });
    } else if (state.isDirectory()) {
      await readFilesWrap(p, items);
    }
  }
}

/**
 * 读取一个目录下全部的文件
 * @param path
 */
export async function readFiles(path: string): Promise<Array<FileItem>> {
  const items = new Array<FileItem>();
  await readFilesWrap(path, items);
  return items;
}
