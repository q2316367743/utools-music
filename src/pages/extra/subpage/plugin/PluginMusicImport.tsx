import {PluginEntity} from "@/entity/PluginEntity";
import {PluginInstance} from "@/types/PluginInstance";
import {musicGroupChoose} from "@/components/PluginManage/MusicGroupChoose";
import {MusicGroupType} from "@/entity/MusicGroup";
import {useMusicGroupStore} from "@/store";
import MessageUtil from "@/utils/modal/MessageUtil";
import {Button, DialogPlugin, Divider, Input} from "tdesign-vue-next";

export async function importMusicFromPlugin(id: number, entity: PluginEntity, instance: PluginInstance) {
  const {importMusicItem, hints} = instance;
  if (!importMusicItem) {
    return Promise.reject(new Error("插件不支持导入歌曲"))
  }
  const func = importMusicItem;
  const lines = hints?.importMusicItem || [];
  const url = ref('');
  const loading = ref(false);



  function onConfirm() {
    // 开始加载
    loading.value = true
    func(url.value)
      .then(musicItem => {
        // 关闭弹窗
        dialogInstance.destroy();
        musicGroupChoose([MusicGroupType.MIX], `添加到歌单`)
          .then(mgId => {
            useMusicGroupStore().appendMixGroup(mgId, [musicItem], id)
              .then(() => MessageUtil.success("导入成功"))
              .catch(e => MessageUtil.error("导入失败", e));
          })

      })
      .catch(e => MessageUtil.error("导入失败", e))
      .finally(() => loading.value = false);
  }

  const dialogInstance = DialogPlugin({
    header: '导入歌曲',
    top: '10vh',
    default: () => <div>
      <Input v-model={url.value} clearable={true} placeholder={`请输入 ${entity.name} 歌曲链接`}/>
      <Divider/>
      <ul style={{paddingLeft: '20px'}}>
        {lines.map(line => <li key={line}>{line}</li>)}
      </ul>
    </div>,
    footer: () => <>
      <Button theme={'default'} onClick={() => dialogInstance.destroy()}>取消</Button>
      <Button theme={'primary'} loading={loading.value} onClick={onConfirm}>导入</Button>
    </>,

  });

}

export async function importSheetFromPlugin(id: number, entity: PluginEntity, instance: PluginInstance) {
  const {importMusicSheet, hints} = instance;
  if (!importMusicSheet) {
    return Promise.reject(new Error("插件不支持导入歌单"))
  }
  const func = importMusicSheet;
  const lines = hints?.importMusicSheet || [];
  const url = ref('');
  const loading = ref(false);

  function onConfirm() {
    // 开始加载
    loading.value = true
    func(url.value)
      .then(musicItems => {
        // 关闭弹窗
        dialogInstance.destroy();
        musicGroupChoose([MusicGroupType.MIX], `添加到歌单（共${Array.isArray(musicItems) ? musicItems.length : 0}首）`)
          .then(mgId => {
            useMusicGroupStore().appendMixGroup(mgId, musicItems, id)
              .then(() => MessageUtil.success("导入成功"))
              .catch(e => MessageUtil.error("导入失败", e));
          })

      })
      .catch(e => MessageUtil.error("导入失败", e))
      .finally(() => loading.value = false);
  }

  const dialogInstance = DialogPlugin({
    header: '导入歌单',
    top: '10vh',
    default: () => <div>
      <Input v-model={url.value} clearable={true} placeholder={`请输入 ${entity.name} 歌单链接`}/>
      <Divider/>
      <ul style={{paddingLeft: '20px'}}>
        {lines.map(line => <li key={line}>{line}</li>)}
      </ul>
    </div>,
    footer: () => <>
      <Button theme={'default'} onClick={() => dialogInstance.destroy()}>取消</Button>
      <Button theme={'primary'} loading={loading.value} onClick={onConfirm}>导入</Button>
    </>,

  });
}