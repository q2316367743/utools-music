import {PluginInstance} from "@/types/PluginInstance";
import cryptoJs from 'crypto-js';
import dayjs from 'dayjs';
import bigInteger from 'big-integer';
import qs from 'qs';
import he from 'he';
import * as cheerio from 'cheerio';
import * as webdav from 'webdav';
import {getAxiosInstance} from "@/plugin/http";
import {getPluginVarSync} from "@/store";



const _require = (packageName: string) => {
  const packages: Record<string, any> = {
    'crypto-js': cryptoJs,
    dayjs,
    axios: getAxiosInstance(),
    'big-integer': bigInteger,
    qs,
    he,
    cheerio,
    webdav
  }
  if (packageName === '@react-native-cookies/cookies') {
    throw new Error("插件暂不支持cookie操作")
  }
  return packages[packageName];
}


export function getPluginInstance(content: string, id: number): PluginInstance {
  // 初始化模块信息
  const _module = {
    exports: { } as any
  };
  const _exports = _module.exports;

  const _env = {
    getUserVariables: (): Record<string, string> => {
      return getPluginVarSync(id)
    }
  }

  const pluginInstance = Function(`
        'use strict';
        try {
            return function(require, module, exports, env) {
                ${content}
            }
        } catch (e) {
            return () => {};
        }
    `)()(_require, _module, _exports, _env);

  const exports = _module.exports || pluginInstance;
  if (exports.default) {
    return exports.default;
  }
  return exports;
}
