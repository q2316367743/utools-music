import {PluginInstance} from "@/entity/PluginInstance";


// TODO: 在app内安装的npm包
const packages: Record<string, any> = {
}

const _require = (packageName: string) => {
  let pkg = packages[packageName];
  return pkg;
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
