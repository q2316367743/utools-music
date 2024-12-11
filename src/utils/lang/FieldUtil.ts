import {listify} from "radash";
import {isEmptyString} from "@/utils/lang/StringUtil";

export function isNull(value?: any): boolean {
  return typeof value === "undefined" || value === null;
}

export function isNotNull(value?: any): boolean {
  return !isNull(value);
}

export function copyProperties<S extends Record<string, any>, T extends Record<string, any>>(source: S, target: T, focus = false) {
  listify(source, (k, v) => {
    if (focus) {
      // @ts-ignore
      target[k] = v;
    } else if (isNotNull(v) && v) {
      // @ts-ignore
      target[k] = v;
    }
  });
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


export function versionCompare(version1: string, version2: string): number {
  const v1 = version1.split('.').map(Number);
  const v2 = version2.split('.').map(Number);
  for (let i = 0; i < v1.length; i++) {
    if (v1[i] > v2[i]) {
      return 1;
    } else if (v1[i] < v2[i]) {
      return -1;
    }
  }
  return 0;
}

export function isVersionUpdate(newVersion: string, oldVersion: string, minVersion: string): boolean {
  // 新版本必须大于等于最小版本，旧版本必须小于最小版本
  return versionCompare(newVersion, minVersion) >= 0 && versionCompare(oldVersion, minVersion) < 0;
}

export function subStr(str: string, len: number): string {
  if (isEmptyString(str)) {
    return '';
  }
  return str.substring(0, len);
}

export function extnameWeb(str: string): string {
  if (isEmptyString(str)) {
    return '';
  }
  const ext = str.split('.').pop() || '';
  return ext ? '.' + ext : '';
}

export function basenameWeb(str: string): string {
  if (isEmptyString(str)) {
    return '';
  }
  const items = str.split('.');
  if (items.length > 1) {
    items.pop();
  }
  return items.join('.');
}

export function dirnameWeb(str: string): string {
  if (isEmptyString(str)) {
    return '';
  }
  return str.split('/').slice(0, -1).join('/');
}

export function getFolderWeb(dir: string) {
  return dir.split('/').pop() || dir;
}

export function getFolder(dir: string): string {
  return dir.split(window.preload.path.sep).pop() || dir;
}