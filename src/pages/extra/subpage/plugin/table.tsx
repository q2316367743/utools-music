import {BaseTableCol, Button, DialogPlugin, Form, FormItem, Input, Popconfirm} from "tdesign-vue-next";
import {isEmptyString} from "@/utils/lang/StringUtil";
import {usePluginStore} from "@/store";
import MessageUtil from "@/utils/modal/MessageUtil";

async function setUserVar(id: number) {
  const {getInstance, getPluginVar, setPluginVar} = usePluginStore();
  const instance = getInstance(id);
  const {userVariables} = instance;
  if (!userVariables) {
    return Promise.reject(new Error("此插件不需要设置变量"));
  }
  const res = await getPluginVar(id);
  console.log(id, res);
  const data = ref(res);
  const loading = ref(false);

  const dialogInstance = DialogPlugin({
    header: '设置变量',
    confirmBtn: {
      default: '保存',
      loading: loading.value
    },
    top: '10vh',
    default: () => <Form labelAlign={'top'}>
      {userVariables.map(uv => <FormItem label={uv.name}>
        <Input v-model={data.value[uv.key]} clearable={true} disabled={loading.value}></Input>
      </FormItem>)}
    </Form>,
    onConfirm: () => {
      loading.value = true;
      console.log(id, data.value);
      setPluginVar(id, data.value)
        .then(() => {
          MessageUtil.success("保存成功");
          dialogInstance.destroy();
        })
        .catch(e => MessageUtil.error("保存", e))
        .finally(() => loading.value = false);
    }
  });

}

export const buildPluginTableColumns = (
  loading: Ref<boolean>
): Array<BaseTableCol> => {
  return [{
    colKey: 'name',
    title: '名称',
    ellipsis: true
  }, {
    colKey: 'author',
    title: '作者',
    width: 140,
    ellipsis: true
  }, {
    colKey: 'version',
    title: '版本',
    width: 80,
    ellipsis: true
  }, {
    colKey: 'operator',
    title: '操作',
    width: 160,
    align: 'right',
    cell: (_h, {row}) => {
      const instance = usePluginStore().instanceMap.get(row.id);
      const hasUserVar = !!instance?.userVariables

      function onSetUserVar() {
        setUserVar(row.id)
          .catch(e => MessageUtil.error("设置变量失败", e));
      }

      function onDownload() {
        loading.value = true
        usePluginStore().downloadPlugin(row.id)
          .then(() => MessageUtil.success("下载成功"))
          .catch(e => MessageUtil.error("下载失败", e))
          .finally(() => loading.value = false)
      }

      function onUpdate() {
        loading.value = true
        usePluginStore().updatePlugin(row.id)
          .then(() => MessageUtil.success("更新成功"))
          .catch(e => MessageUtil.error("更新失败", e))
          .finally(() => loading.value = false)
      }

      function onUninstall() {
        loading.value = true
        usePluginStore().removePlugin(row.id)
          .then(() => MessageUtil.success("卸载成功"))
          .catch(e => MessageUtil.error("卸载失败", e))
          .finally(() => loading.value = false)
      }

      return <div>
        {hasUserVar && <Button theme={'primary'} variant={'text'} shape={'circle'}
                               disabled={loading.value}
                               onClick={onSetUserVar}
        >设</Button>}
        <Button theme={'primary'} variant={'text'} shape={'circle'}
                disabled={loading.value}
                onClick={onDownload}
        >下</Button>
        <Button theme={'primary'} variant={'text'} shape={'circle'}
                disabled={isEmptyString(row.srcUrl) || loading.value}
                onClick={onUpdate}
        >更</Button>
        <Popconfirm content={'是否卸载插件'} onConfirm={onUninstall}>
          <Button theme={'danger'} variant={'text'} shape={'circle'}
                  disabled={loading.value}
                  onClick={onUpdate}
          >卸</Button>
        </Popconfirm>
      </div>
    }
  }]
};