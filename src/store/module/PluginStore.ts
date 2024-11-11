import {defineStore} from "pinia";
import {PluginEntity, PluginEntityView} from "@/entity/PluginEntity";
import {PluginInstance} from "@/types/PluginInstance";
import {listRecordByAsync, removeOneByAsync, saveOneByAsync} from "@/utils/utools/DbStorageUtil";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {getPluginInstance} from "@/components/PluginManage/PluginFunc";
import MessageUtil from "@/utils/modal/MessageUtil";
import {isEmptyString} from "@/utils/lang/StringUtil";

export const usePluginStore = defineStore('plugin-store', () => {
  const plugins = ref(new Array<PluginEntityView>());
  const instanceMap = new Map<number, PluginInstance>();

  async function init() {
    const records = await listRecordByAsync<PluginEntity>(LocalNameEnum.ITEM_PLUGIN);
    records.forEach((record) => {
      plugins.value.push({
        ...record.record,
        _rev: record.rev,
        _id: record.id,
      });
    });
  }

  init()
    .then(() => console.log("插件初始化成功"))
    .catch(err => MessageUtil.error('插件初始化失败', err));


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

  async function installPlugin(content: string): Promise<void> {
    const instance = getPluginInstance(content);
    const plugin: PluginEntity = {
      id: Date.now(),
      content,
      author: instance.author,
      name: instance.platform,
      srcUrl: instance.srcUrl || '',
      version: instance.version
    }
    console.log(plugin, instance)
    // 校验必填项是否存在
    if (isEmptyString(plugin.name)) return Promise.reject(new Error("插件名称不存在"))
    if (isEmptyString(plugin.author)) return Promise.reject(new Error("插件作者不存在"))
    if (isEmptyString(plugin.version)) return Promise.reject(new Error("插件版本不存在"))
    // TODO: 校验版本是否过高、判断升级1
    const key = `${LocalNameEnum.ITEM_PLUGIN}/${plugin.id}`;
    // 新增插件
    let rev = await saveOneByAsync(key, plugin);
    plugins.value.push({
      ...plugin,
      _id: key,
      _rev: rev,
    });
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


  return {
    plugins,
    init, getInstance, installPlugin, removePlugin
  }


})
