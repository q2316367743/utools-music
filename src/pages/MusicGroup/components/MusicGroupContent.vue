<template>
  <t-drawer v-model:visible="visible" @close="onClose" attach=".music-group" size="100%" :footer="false"
            :close-btn="true" :header>
    <div class="music-group-content">
      <t-base-table row-key="id" :data="data" :columns="columns" :bordered="false" :height="maxHeight"
                    :hover="true" size="small" :scroll="{ type: 'virtual', rowHeight: 39 }"
                    @row-dblclick="handleRowDblclick">
      </t-base-table>
    </div>
  </t-drawer>
</template>
<script lang="tsx" setup>
import {MusicGroupIndex, MusicGroupType} from "@/entity/MusicGroup";
import {MusicItemSource} from "@/entity/MusicItem";
import {useMusicGroupStore} from "@/store";
import MessageUtil from "@/utils/modal/MessageUtil";
import {BaseTableCol, RowEventContext, TableRowData} from "tdesign-vue-next";
import {prettyDateTime} from "@/utils/lang/FormatUtil";
import {useMusicPlay} from "@/global/Event";
import {musicGroupAppend} from "@/pages/MusicGroup/components/MusicGroupFunc";
import {MusicInstanceLocal, MusicInstanceWeb} from "@/types/MusicInstance";

const size = useWindowSize();
const {loadMusicItems} = useMusicGroupStore()

const props = defineProps({
  musicGroup: {
    type: Object as PropType<MusicGroupIndex>,
  }
});
const emit = defineEmits(['close']);

const visible = ref(false);
const data = ref(new Array<any>())

const maxHeight = computed(() => size.height.value - 150);
const header = computed(() => props.musicGroup?.name ?? '');


const columns: Array<BaseTableCol> = [{
  colKey: 'name',
  title: '歌曲名',
  ellipsis: true,
  cell: (h, {row}) => {
    return row.name || row.title
  }
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
    return row.duration ? prettyDateTime(row.duration) : '--:--';
  }
}, {
  colKey: 'source',
  title: '来源',
  width: 60,
  cell: (h, {row}) => {
    const {source} = row;
    let text = '网络';
    if (source === MusicItemSource.LOCAL) {
      text = '本地';
    } else if (source === MusicItemSource.WEBDAV) {
      text = 'WebDAV';
    }
    return <t-tag size="small" theme="primary">
      <span>{text}</span>
    </t-tag>

  }
}];

function initMusicItems(val: MusicGroupIndex) {
  // 获取列表
  loadMusicItems(val.id)
    .then(items => data.value = items)
    .catch(e => MessageUtil.error("获取歌单内容错误", e));
}

watch(() => props.musicGroup, val => {
  if (val) {
    data.value = [];
    visible.value = true;
    // 获取列表
    initMusicItems(val)
  }
});

function handleRowDblclick(context: RowEventContext<TableRowData>) {
  const {musicGroup} = props
  const {row} = context;
  const list = data.value;
  const index = data.value.findIndex(e => e.id === row.id);
  useMusicPlay.emit({
    views: list.map(e => {
      if (musicGroup) {
        if (musicGroup.type === MusicGroupType.WEB) {
          return new MusicInstanceWeb(e, musicGroup.pluginId)
        } else if (musicGroup.type === MusicGroupType.MIX) {
          return new MusicInstanceWeb(e, e.pluginId)
        }
      }
      return new MusicInstanceLocal(e);
    }),
    index: Math.max(index, 0)
  });
}

function onClose() {
  visible.value = false;
  emit('close');
}

function musicGroupAppendWrap() {
  const {musicGroup} = props;
  if (musicGroup) {
    musicGroupAppend(data.value.map(e => e.id), musicGroup.id,
      () => initMusicItems(musicGroup));
  }
}
</script>
<style scoped lang="less">

</style>
