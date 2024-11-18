import {
  BaseTable,
  BaseTableCol,
  Button,
  DialogPlugin,
  Form,
  FormItem,
  Input,
  Popconfirm
} from "tdesign-vue-next";
import {usePluginSubscribeStore} from "@/store/module/PluginSubscribeStore";
import {buildPluginSubscribe, PluginSubscribe} from "@/entity/PluginSubscribe";
import MessageUtil from "@/utils/modal/MessageUtil";
import {isEmptyArray, isNull} from "@/utils/lang/FieldUtil";
import {isEmptyString} from "@/utils/lang/StringUtil";
import {getForJSON, getForText} from "@/plugin/http";
import {isObject} from "radash";
import {usePluginStore} from "@/store";

function showPostPluginSubscribe(res?: PluginSubscribe) {
  const subscribe = ref(res ?? buildPluginSubscribe());
  const key = res ? '修改' : '添加';

  const instance = DialogPlugin({

    header: key + '插件订阅',
    default: () => <Form labelAlign={'top'}>
      <FormItem label={'名称'}>
        <Input v-model={subscribe.value.name} clearable={true} placeholder={'请输入插件订阅名称'}></Input>
      </FormItem>
      <FormItem label={'链接'}>
        <Input v-model={subscribe.value.url} clearable={true} placeholder={'请输入插件订阅链接'}></Input>
      </FormItem>
    </Form>,
    confirmBtn: {
      default: res ? '修改' : '添加'
    },
    onConfirm() {
      // 添加
      usePluginSubscribeStore().post(subscribe.value)
        .then(() => {
          MessageUtil.success(key + "成功");
          instance.destroy();
        })
        .catch(e => MessageUtil.error(key + "失败", e));
    }
  });
}

export function openPluginSubscribeDialog() {
  const subscribes = computed(() => usePluginSubscribeStore().pluginSubscribes);
  const columns: Array<BaseTableCol> = [{
    colKey: 'name',
    title: '订阅名称',
    ellipsis: true,
    width: 100
  }, {
    colKey: 'url',
    title: '订阅链接',
    ellipsis: true,
  }, {
    colKey: 'operator',
    title: '操作',
    ellipsis: true,
    width: 165,
    cell: (h, {row}) => {
      return <div>
        <Button theme={'primary'} variant={'text'} onClick={() => showPostPluginSubscribe(row as any)}>修改</Button>
        <Popconfirm content={'是否删除此插件订阅？'} onConfirm={() => usePluginSubscribeStore().remove(row.id)}>
          <Button theme={'danger'} variant={'text'}>删除</Button>
        </Popconfirm>
      </div>
    }
  }]
  DialogPlugin({
    header: '插件订阅',
    width: '70vw',
    top: '10vh',
    default: () => <BaseTable data={subscribes.value} columns={columns} maxHeight={'45vh'} rowKey={'id'}></BaseTable>,
    footer: () => <div
      style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-start'}}>
      <div>
        <Button theme={'primary'} variant={'outline'} onClick={() => showPostPluginSubscribe()}>添加订阅</Button>
      </div>
    </div>
  });
}

export const updatePluginSubscribeLoading = ref(false);

// TODO: 此处有问题，https总是重定向
// 参考：https://github.com/xxnuo/MusicFreePluginsHub/blob/main/README.md
async function updatePluginSubscribeWrap() {
  const {init} = usePluginSubscribeStore();
  await init();
  const {pluginSubscribes} = usePluginSubscribeStore();
  if (isEmptyArray(pluginSubscribes)) {
    MessageUtil.warning("订阅不存在")
    return false;
  }

  for (let subscribe of pluginSubscribes) {
    const {url, name} = subscribe;
    if (isEmptyString(url)) {
      // 链接为空跳过
      continue;
    }
    const text = await getForJSON(url);
    if (isNull(text) || !isObject(text)) {
      MessageUtil.warning(`插件订阅【${name}】格式错误`)
      continue;
    }
    const {plugins} = text as any;
    if (isEmptyArray(plugins)) {
      MessageUtil.warning(`插件订阅【${name}】没有plugins字段`)
      continue;
    }
    for (const plugin of plugins) {
      const {url} = plugin;
      if (isEmptyString(url)) {
        continue;
      }
      const content = await getForText(url);
      try {
        await usePluginStore().installPlugin(content, url);
      } catch (e) {
        console.error(e);
      }
    }
  }


  return true;
}

export function updatePluginSubscribe() {
  updatePluginSubscribeLoading.value = true;
  updatePluginSubscribeWrap()
    .then(res => res && MessageUtil.success("更新成功"))
    .catch(e => MessageUtil.error("更新失败", e))
    .finally(() => updatePluginSubscribeLoading.value = false);

}

