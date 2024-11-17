import {defineStore} from "pinia";
import {PluginSubscribe} from "@/entity/PluginSubscribe";
import {listByAsync, saveListByAsync} from "@/utils/utools/DbStorageUtil";
import {LocalNameEnum} from "@/global/LocalNameEnum";

export const usePluginSubscribeStore = defineStore('plugin-subscribe', () => {
  const pluginSubscribes = ref(new Array<PluginSubscribe>());
  let rev: string | undefined = undefined;
  let isInit = false

  async function init() {
    if (isInit) {
      return;
    }
    const res = await listByAsync(LocalNameEnum.LIST_PLUGIN_SUBSCRIBE);
    pluginSubscribes.value = res.list;
    rev = res.rev;
    isInit = true;
  }

  init()
    .then(() => console.log("插件订阅初始化成功"))
    .catch((err) => console.error("插件订阅初始化失败", err));


  async function post(subscribe: PluginSubscribe) {
    const index = pluginSubscribes.value.findIndex(e => e.id === subscribe.id);
    if (index >= 0) {
      // 更新
      pluginSubscribes.value[index] = {
        ...subscribe,
        id: pluginSubscribes.value[index].id
      }
    } else {
      // 新增
      pluginSubscribes.value.push(subscribe);
    }
    rev = await saveListByAsync(LocalNameEnum.LIST_PLUGIN_SUBSCRIBE, pluginSubscribes.value, rev);
  }

  async function remove(id: number) {
    const index = pluginSubscribes.value.findIndex(e => e.id === id);
    if (index >= 0) {
      pluginSubscribes.value.splice(index, 1);
      rev = await saveListByAsync(LocalNameEnum.LIST_PLUGIN_SUBSCRIBE, pluginSubscribes.value, rev);
    }
  }

  return {
    pluginSubscribes,
    init, post, remove
  }
})