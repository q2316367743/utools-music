import {defineStore} from "pinia";
import {PluginEntity, PluginEntityView, PluginInstanceView} from "@/entity/PluginEntity";
import {PluginInstance} from "@/types/PluginInstance";
import {listRecordByAsync, removeOneByAsync, saveOneByAsync} from "@/utils/utools/DbStorageUtil";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {getPluginInstance} from "@/components/PluginManage/PluginFunc";
import MessageUtil from "@/utils/modal/MessageUtil";
import {isEmptyString, isNotEmptyString} from "@/utils/lang/StringUtil";
import {versionCompare} from "@/utils/lang/FieldUtil";
import {getForText} from "@/plugin/http";
import {globalSetting} from "@/store";
import {stringToBase64} from "@/utils/file/CovertUtil";

export const usePluginStore = defineStore('plugin-store', () => {
  const plugins = ref(new Array<PluginEntityView>());
  const instanceMap = new Map<number, PluginInstance>();

  const pluginInstances = computed<Array<PluginInstanceView>>(() => {
    const list = new Array<PluginInstanceView>();
    for (let p of plugins.value) {
      try {
        let instance = instanceMap.get(p.id);
        if (!instance) {
          instance = getPluginInstance(p.content)
          instanceMap.set(p.id, instance);
        }
        list.push({
          ...p,
          instance
        });
      } catch (e) {
        console.error(`初始化插件【${p.name}】失败`, e)
      }
    }
    return list;
  });

  async function initWrap() {
    const records = await listRecordByAsync<PluginEntity>(LocalNameEnum.ITEM_PLUGIN);
    records.forEach((record) => {
      plugins.value.push({
        ...record.record,
        _rev: record.rev,
        _id: record.id,
      });
    });
  }

  function init() {
    initWrap()
      .then(() => {
        console.log("插件初始化成功");
        // 成功后，判断是否自动更新插件
        const {pluginAutoUpdate} = toRaw(globalSetting.value);
        if (pluginAutoUpdate) {
          Promise.all(plugins.value
            .filter(plugin => isNotEmptyString(plugin.srcUrl))
            .map(plugin => plugin.id)
            .map(id => updatePlugin(id, true)))
            .then(() => console.log("全部更新完成"))
            .catch(e => console.error("更新部分失败", e));
        }
      })
      .catch(err => MessageUtil.error('插件初始化失败', err));
  }


  async function getInstance(id: number): Promise<PluginInstance> {
    const idx = plugins.value.findIndex(e => e.id === id);
    if (idx === -1) {
      return Promise.reject(new Error(`插件[${id}]不存在`))
    }
    const plugin = plugins.value[idx];
    let instance = instanceMap.get(id);
    if (!instance) {
      instance = getPluginInstance(plugin.content);
      instanceMap.set(id, instance);
    }
    return instance;
  }

  async function installPlugin(content: string, url?: string, ignoreVersion?: boolean): Promise<void> {
    const instance = getPluginInstance(content);
    const plugin: PluginEntity = {
      id: Date.now(),
      content,
      author: instance.author,
      name: instance.platform,
      // 优先取内容，取不到尝试获取外部
      srcUrl: instance.srcUrl || url || '',
      version: instance.version
    }
    // 校验必填项是否存在
    if (isEmptyString(plugin.name)) return Promise.reject(new Error("插件名称不存在"))
    if (isEmptyString(plugin.author)) plugin.author = '未知作者';
    if (isEmptyString(plugin.version)) return Promise.reject(new Error("插件版本不存在"))
    // 查询插件名称和作者是否存在
    const oldIndex = plugins.value.findIndex(e =>
      e.name === plugin.name && e.author === instance.author);

    // 校验版本是否过高、判断升级1
    if (oldIndex === -1) {
      // 新的
      const key = `${LocalNameEnum.ITEM_PLUGIN}/${plugin.id}`;
      // 新增插件
      let rev = await saveOneByAsync(key, plugin);
      plugins.value.push({
        ...plugin,
        _id: key,
        _rev: rev,
      });
    } else {
      // 旧的，判断版本号
      const old = plugins.value[oldIndex];

      const {pluginIgnoreVersion} = toRaw(globalSetting.value);
      if (pluginIgnoreVersion || versionCompare(plugin.version, old.version) > 0) {
        // 更新
        plugin.id = old.id;
        const key = `${LocalNameEnum.ITEM_PLUGIN}/${plugin.id}`;
        const _rev = old._rev;
        // 更新插件
        let rev = await saveOneByAsync(key, plugin, _rev);
        plugins.value[oldIndex] = {
          ...plugin,
          _id: key,
          _rev: rev
        };
      } else {
        if (ignoreVersion) {
          return;
        }
        return Promise.reject(new Error("插件已安装，请勿重复安装"))
      }
    }

    // 新增实例缓存
    instanceMap.set(plugin.id, instance);
  }

  async function removePlugin(id: number) {
    const idx = plugins.value.findIndex(e => e.id === id);
    if (idx === -1) {
      return Promise.reject(new Error(`插件[${id}]不存在`))
    }
    // 数据中删除
    await removeOneByAsync(`${LocalNameEnum.ITEM_PLUGIN}/${id}`);
    // 列表中删除
    plugins.value.splice(idx, 1);
    // 实例中删除
    instanceMap.delete(id);
  }

  async function updatePlugin(id: number, ignoreVersion?: boolean) {
    const idx = plugins.value.findIndex(e => e.id === id);
    if (idx === -1) {
      return Promise.reject(new Error(`插件[${id}]不存在`))
    }
    const old = plugins.value[idx];
    if (isEmptyString(old.srcUrl)) {
      return Promise.reject(new Error(`插件[${old.id}]没有更新地址`));
    }
    const text = await getForText(old.srcUrl);
    // 重新安装插件
    await installPlugin(text, '', ignoreVersion);
  }

  async function downloadPlugin(id: number) {
    const idx = plugins.value.findIndex(e => e.id === id);
    if (idx === -1) {
      return Promise.reject(new Error(`插件[${id}]不存在`))
    }
    const target = plugins.value[idx];
    // 下载
    await window.preload.downloadFile(
      `data:text/plain;base64,${stringToBase64(target.content)}`,
      `${target.name.replace(/\s+/, '_')}.js`);
  }


  return {
    plugins, instanceMap, pluginInstances,
    init, getInstance, installPlugin, removePlugin, updatePlugin, downloadPlugin
  }


})
