import {MusicItemMeta} from "@/entity/MusicItem";
import {parseBuffer} from "music-metadata";

export interface FileItem {
  path: string;
  name: string;
  basename: string;
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
      const extname = window.preload.path.extname(name);
      items.push({
        path: p,
        name: name,
        basename: name.substring(0, name.length - extname.length),
        extname: extname
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
export async function readFileList(path: string): Promise<Array<FileItem>> {
  const items = new Array<FileItem>();
  await readFilesWrap(path, items);
  return items;
}

export async function readFile(path: string): Promise<Uint8Array> {
  return new Promise<Uint8Array>((resolve, reject) => {
    window.preload.fs.readFile(path, (e, file) => {
      if (e) {
        return reject(e);
      }
      resolve(file);
    })
  })
}

export async function readFileAsString(path: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    window.preload.fs.readFile(path, 'utf8', (e, file) => {
      if (e) {
        return reject(e);
      }
      resolve(file);
    })
  })
}

/**
 * 解析文件为音乐
 * @param path 文件路径
 */
export async function parseFileToMusic(path: string): Promise<Partial<MusicItemMeta>> {
  if (!window.preload.fs.existsSync(path)) {
    return Promise.reject("文件不存在");
  }
  const file = await readFile(path);
  const {common, format} = await parseBuffer(file);
  return {
    name: common.title,
    album: common.album,
    artist: common.artist,
    duration: format.duration
  }
}

export function unlinkAsync(path: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    window.preload.fs.unlink(path, e => {
      if (e) {return reject(e);}
      resolve();
    });
  })
}
