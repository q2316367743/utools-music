import MessageBoxUtil from "@/utils/modal/MessageBoxUtil";
import {useMusicGroupStore} from "@/store/module/MusicGroupStore";
import MessageUtil from "@/utils/modal/MessageUtil";
import {DialogPlugin, Table, TableCol, Tag} from "tdesign-vue-next";
import {useMusicStore} from "@/store";
import {prettyDateTime} from "@/utils/lang/FormatUtil";
import {MusicItemSource} from "@/entity/MusicItem";
import {saveOneByAsync} from "@/utils/utools/DbStorageUtil";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {MusicGroupContent, MusicGroupIndex} from "@/entity/MusicGroup";

export function addMusicGroup(): void {
  MessageBoxUtil.prompt("请输入歌单名称", "新建歌单", {
    confirmButtonText: "新建"
  })
    .then(name => {
      useMusicGroupStore().postMusicGroupIndex({
        name: name,
        id: Date.now(),
        nativeId: utools.getNativeId()
      })
        .then(() => MessageUtil.success("新增成功"))
        .catch(e => MessageUtil.error("新增失败", e));
    })
}

export function editMusicGroup(group: MusicGroupIndex): void {
  MessageBoxUtil.prompt("请输入歌单名称", "修改歌单", {
    confirmButtonText: "新建",
    inputValue: group.name,
  })
    .then(name => {
      useMusicGroupStore().postMusicGroupIndex({
        name: name,
        id: group.id,
        nativeId: group.nativeId
      })
        .then(() => MessageUtil.success("修改成功"))
        .catch(e => MessageUtil.error("修改失败", e));
    })
}

export function musicGroupAppend(defaultMusicItemIds: Array<number>, musicGroupId: number, onUpdate: () => void): void {
  const data = computed(() => useMusicStore().musics);

  const columns: Array<TableCol> = [{
    colKey: 'row-select',
    type: 'multiple',
    width: 50,
  }, {
    colKey: 'name',
    title: '歌曲名',
    ellipsis: true
  }, {
    colKey: 'artist',
    title: '演唱者',
    ellipsis: true
  }, {
    colKey: 'album',
    title: '专辑',
    ellipsis: true
  }, {
    colKey: 'duration',
    title: '时长',
    width: 70,
    cell: (h, {row}) => {
      return prettyDateTime(row.duration);
    }
  }, {
    colKey: 'source',
    title: '来源',
    width: 60,
    cell: (h, {row}) => {
      const {source} = row;
      let text = '';
      if (source === MusicItemSource.LOCAL) {
        text = '本地';
      } else if (source === MusicItemSource.WEBDAV) {
        text = 'WebDAV';
      }
      return <Tag size="small" theme="primary">
        <span>{text}</span>
      </Tag>

    }
  }];

  const selectedRowKeys = ref<Array<number>>(defaultMusicItemIds);


  const dialogInstance = DialogPlugin({
    header: "添加音乐",
    draggable: true,
    attach: 'body',
    top: '8vh',
    width: '80vw',
    default: () => <Table data={data.value} columns={columns} maxHeight={`48vh`}
                          v-model={[selectedRowKeys.value, 'selectedRowKeys']} rowKey={'id'} activeRowType={'single'}
                          selectOnRowClick={true}/>,
    onConfirm() {
      // 确定
      const newList = data.value.filter(e => selectedRowKeys.value.includes(e.id));
      // TODO: 修改旧的
      saveOneByAsync<MusicGroupContent>(`${LocalNameEnum.ITEM_MUSIC_GROUP}/${musicGroupId}`, {
        id: musicGroupId,
        items: newList
      })
        .then(() => {
          MessageUtil.success("修改成功");
          // 通知更新
          onUpdate();
        })
        .catch(e => MessageUtil.error("修改失败", e))
        .finally(() => dialogInstance.destroy());

    }
  });
}