import {DialogPlugin, Form, FormItem, Input} from "tdesign-vue-next";
import {MusicItem, MusicItemView, transferMusicItem} from "@/entity/MusicItem";
import FileInput from "@/components/FileInput/FileInput.vue";
import MessageUtil from "@/utils/modal/MessageUtil";
import {useMusicStore} from "@/store";

export function openLocalMusicEditDialog(row: MusicItemView): void {
  const data = ref<MusicItem>(transferMusicItem(row));
  const dialogInstance = DialogPlugin({
    header: '编辑音乐数据',
    top: '10vh',
    width: '600px',
    default: () => <Form style={{maxHeight: ' 45vh', overflow: 'auto', padding: '8px'}}>
      <FormItem label={'歌曲名称'}>
        <Input v-model={data.value.name} clearable={true} />
      </FormItem>
      <FormItem label={'演唱者'}>
        <Input v-model={data.value.artist} clearable={true} />
      </FormItem>
      <FormItem label={'专辑'}>
        <Input v-model={data.value.album} clearable={true} />
      </FormItem>
      <FormItem label={'封面'}>
        <FileInput v-model={data.value.cover} title={'请选择封面图'} type={'image'}/>
      </FormItem>
      <FormItem label={'歌词'}>
        <FileInput v-model={data.value.lyric} title={'请选择歌词'} type={'lyric'}/>
      </FormItem>
      <FormItem label={'音乐'}>
        <FileInput v-model={data.value.url} title={'请选择音乐'}/>
      </FormItem>
    </Form>,
    confirmBtn: {
      default: '保存'
    },
    onConfirm() {
      useMusicStore().updateById(data.value)
        .then(() => {
          dialogInstance.destroy();
          MessageUtil.success("保存成功");
        }).catch(e => MessageUtil.error("保存失败", e));
    }
  });
}