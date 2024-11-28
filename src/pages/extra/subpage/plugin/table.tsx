import {
  BaseTableCol,
  Button,
  DialogPlugin,
  Dropdown,
  DropdownOption,
  Form,
  FormItem,
  Input,
  Popup
} from "tdesign-vue-next";
import {usePluginStore} from "@/store";
import MessageUtil from "@/utils/modal/MessageUtil";
import MessageBoxUtil from "@/utils/modal/MessageBoxUtil";
import {MoreIcon} from "tdesign-icons-vue-next";
import {PluginEntity} from "@/entity/PluginEntity";
import {importMusicFromPlugin, importSheetFromPlugin} from "@/pages/extra/subpage/plugin/PluginMusicImport";

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
    width: 100,
    align: 'right',
    cell: (_h, {row}) => {
      const instance = usePluginStore().getInstance(row.id);
      const hasUserVar = !!instance?.userVariables;
      const hasImportMusic = !!instance?.importMusicItem
      const hasImportSheet = !!instance?.importMusicSheet

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
        MessageBoxUtil.alert(
          "是否卸载插件，卸载后，基于此插件新增的歌曲将无法收听，并且卸载后造成的数据问题也将无法恢复",
          "卸载插件",
          {
            confirmButtonText: '卸载'
          }).then(() => {
          loading.value = true
          usePluginStore().removePlugin(row.id)
            .then(() => MessageUtil.success("卸载成功"))
            .catch(e => MessageUtil.error("卸载失败", e))
            .finally(() => loading.value = false)
        })
      }

      function onImportMusic() {
        importMusicFromPlugin(row.id, row as PluginEntity, instance)
          .catch(e => MessageUtil.error("导入歌曲失败", e));
      }

      function onImportSheet() {
        importSheetFromPlugin(row.id, row as PluginEntity, instance)
          .catch(e => MessageUtil.error("导入歌单失败", e));
      }

      const options: Array<DropdownOption> = [{
        content: '下载',
        onClick: onDownload
      }, {
        content: '更新',
        onClick: onUpdate
      }, {
        content: '卸载',
        theme: 'error',
        onClick: onUninstall,
      }];
      const importOptions = new Array<DropdownOption>();
      if (hasImportMusic) {
        importOptions.push({
          content: '导入歌曲',
          onClick: onImportMusic
        });
      }
      if (hasImportSheet) {
        importOptions.push({
          content: '导入歌单',
          onClick: onImportSheet
        });
      }


      return <div>
        {(hasImportMusic || hasImportSheet) &&
            <Dropdown options={importOptions} trigger={'click'}>
                <Button theme={'success'} variant={'text'} shape={'circle'}
                        disabled={loading.value}>导</Button>
            </Dropdown>}
        {hasUserVar && <Popup content={'设置变量'}>
            <Button theme={'primary'} variant={'text'} shape={'circle'}
                    disabled={loading.value}
                    onClick={onSetUserVar}
            >设</Button>
        </Popup>}
        <Dropdown options={options} trigger={'click'}>
          <Button theme={'primary'} variant={'text'} shape={'circle'}
                  disabled={loading.value}>{{
            icon: () => h(MoreIcon)
          }}</Button>
        </Dropdown>
      </div>
    }
  }]
};