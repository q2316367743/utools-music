import {PluginInstance} from "@/types/PluginInstance";
import cryptoJs from 'crypto-js';
import dayjs from 'dayjs';
import axios from 'axios';
import bigInteger from 'big-integer';
import qs from 'qs';
import he from 'he';
import * as cheerio from 'cheerio';
import * as webdav from 'webdav';


// TODO: 在app内安装的npm包
const packages: Record<string, any> = {
  'crypto-js': cryptoJs,
  dayjs,
  axios,
  'big-integer': bigInteger,
  qs,
  he,
  cheerio,
  webdav
}

const _require = (packageName: string) => {
  if (packageName === '@react-native-cookies/cookies') {
    throw new Error("插件暂不支持cookie操作")
  }
  return packages[packageName];
}


export function getPluginInstance(content: string): PluginInstance {
  // 初始化模块信息
  const _module = {
    exports: { } as any
  };
  const _exports = _module.exports;

  const pluginInstance = Function(`
        'use strict';
        try {
            return function(require, module, exports) {
                ${content}
            }
        } catch (e) {
            return () => {};
        }
    `)()(_require, _module, _exports);

  const exports = _module.exports || pluginInstance;
  if (exports.default) {
    return exports.default;
  }
  return exports;
}
