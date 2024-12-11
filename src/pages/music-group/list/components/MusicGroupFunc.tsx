import MessageBoxUtil from "@/utils/modal/MessageBoxUtil";
import {useMusicGroupStore} from "@/store/module/MusicGroupStore";
import MessageUtil from "@/utils/modal/MessageUtil";
import {DialogPlugin, Form, FormItem, Input, Radio, RadioGroup, Table, TableCol, Tag} from "tdesign-vue-next";
import {useMusicStore} from "@/store";
import {prettyDateTime} from "@/utils/lang/FormatUtil";
import {MusicItemSourceEnum} from "@/entity/MusicItemSourceEnum";
import {saveOneByAsync} from "@/utils/utools/DbStorageUtil";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {MusicGroupContent, MusicGroupIndex, MusicGroupType} from "@/entity/MusicGroup";

export function addMusicGroup(): void {
  const form = ref({
    name: '',
    type: MusicGroupType.LOCAL,
  });

  function renderTypeHelp(type: MusicGroupType) {
    if (type === MusicGroupType.LOCAL) {
      return "只能添加本地歌曲";
    }else if (type === MusicGroupType.MIX) {
      return "只能添加网络歌曲"
    }else if (type === MusicGroupType.WEB) {
      return "收藏的网络歌单，无法修改与新增"
    }
  }
  const dialogInstance = DialogPlugin({
    header: "新建歌单",
    default: () => <Form labelAlign={'top'}>
      <FormItem label={'歌单名称'}>
        <Input v-model={form.value.name} clearable={true}></Input>
      </FormItem>
      <FormItem label={'歌单类型'} help={renderTypeHelp(form.value.type)}>
        <RadioGroup v-model={form.value.type}>
          <Radio value={MusicGroupType.LOCAL}>本地</Radio>
          <Radio value={MusicGroupType.MIX}>混合</Radio>
        </RadioGroup>
      </FormItem>
    </Form>,
    confirmBtn: {
      default: '新建'
    },
    onConfirm() {
      useMusicGroupStore().postMusicGroupIndex({
        name: form.value.name,
        id: Date.now(),
        nativeId: utools.getNativeId(),
        type: form.value.type,
        pluginId: 0
      })
        .then(() => {
          MessageUtil.success("新增成功");
          dialogInstance.destroy();
        })
        .catch(e => MessageUtil.error("新增失败", e));
    }
  });
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
        nativeId: group.nativeId,
        type: group.type,
        pluginId: 0
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
      if (source === MusicItemSourceEnum.LOCAL) {
        text = '本地';
      } else if (source === MusicItemSourceEnum.WEBDAV) {
        text = 'WebDAV';
      } else if (source === MusicItemSourceEnum.A_LIST) {
        text = 'AList';
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
      // 修改旧的
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