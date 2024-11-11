import {listify} from "radash";

export function isNull(value?: any): boolean {
  return typeof value === "undefined" || value === null;
}

export function isNotNull(value?: any): boolean {
  return !isNull(value);
}

export function copyProperties<S extends Record<string, any>, T extends Record<string, any>>(source: S, target: T) {
  const keys = Object.keys(target);
  listify(source, (k, v) => {
    if (keys.includes(k) && isNotNull(v)) {
      // @ts-ignore
      target[k] = v;
    }
  });
}

interface MusicInfo {
  name: string,
  artist: string
}

export function parseMusicName(basename: string): MusicInfo {
  let strings = basename.split("-");
  if (strings.length > 1) {
    return {
      artist: strings[0].trim(),
      name: strings.slice(1).join("-").trim(),
    }
  }
  return {
    artist: '',
    name: basename,
  }
}

export function getEffectiveNumber(num: number, min: number, max: number): number {
  if (num < min) {
    return min;
  }
  if (num >= max) {
    return max - 1;
  }
  return num;
}


export function isEmptyArray(arr?: Array<any>): boolean {
  if (!arr) {
    return true;
  }
  if (!Array.isArray(arr)) {
    return true;
  }
  return arr.length === 0;
}

export function isNotEmptyArray(arr?: Array<any>): boolean {
  return !isEmptyArray(arr);
}
