<template>
  <div class="music-player">
    <div class="container">
      <div class="image" @click="switchDisplay">
        <t-image v-if="music && music.cover" :src="music.cover"></t-image>
        <t-avatar v-else-if="music" shape="round" size="42px">{{ music.name.substring(0, 1) }}</t-avatar>
        <t-avatar v-else shape="round" size="42px">无</t-avatar>
        <div class="mask">
          <chevron-down-double-icon v-if="displayVisible" size="32px" color="#fff"/>
          <chevron-up-double-icon v-else size="32px" color="#fff"/>
        </div>
      </div>
      <div>
        <div class="meta ellipsis">
          <span class="name">{{ name }}</span>
          <span> - </span>
          <span class="artist">{{ artist }}</span>
        </div>
        <t-space class="duration">
          <div>{{ prettyDateTime(currentTime) }} / {{ prettyDateTime(duration) }}</div>
          <t-tag theme="primary" size="small" v-if="isNotEmptyString(source)">{{ source }}</t-tag>
          <t-button size="small" variant="text" theme="primary" v-if="enableDownload" @click="onDownload">
            <template #icon>
              <download-icon/>
            </template>
          </t-button>
        </t-space>
      </div>
      <div class="operator">
        <t-button shape="circle" theme="primary" variant="text" @click="onAddMusicGroup" :disabled="disableAddGroup">
          加
        </t-button>
        <t-popup trigger="click">
          <t-button shape="circle" theme="primary" variant="text">
            音
          </t-button>
          <template #content>
            <div class="music-player-volume">
              <t-slider layout="vertical" v-model="volume"/>
            </div>
          </template>
        </t-popup>
        <t-tooltip content="歌词">
          <t-button shape="circle" theme="primary" variant="text" @click="switchLyric">
            词
          </t-button>
        </t-tooltip>
        <t-tooltip :content="loopText">
          <t-button shape="circle" theme="primary" variant="text" @click="loopControl">
            <span v-if="loop === 1">单</span>
            <span v-else-if="loop === 2">顺</span>
            <span v-else-if="loop === 3">随</span>
          </t-button>
        </t-tooltip>
        <t-tooltip content="播放列表" placement="top-left">
          <t-button shape="circle" theme="primary" variant="text" @click="switchList">
            列
          </t-button>
        </t-tooltip>
      </div>
    </div>
    <div class="progress">
      <t-slider :max="duration" :min="0" :value="currentTime" :label="onLabel" @change-end="onChange"/>
    </div>
    <t-space class="controls">
      <t-button shape="circle" theme="primary" variant="text" size="large" :disabled @click="pre">
        <template #icon>
          <previous-icon></previous-icon>
        </template>
      </t-button>
      <t-button shape="circle" theme="primary" size="large" :disabled @click="audioControl">
        <template #icon>
          <pause-icon v-if="played"/>
          <play-icon v-else/>
        </template>
      </t-button>
      <t-button shape="circle" theme="primary" variant="text" size="large" :disabled @click="next">
        <template #icon>
          <next-icon/>
        </template>
      </t-button>
    </t-space>
    <t-drawer v-model:visible="listVisible" :header="`播放列表(${musics.length}首)`" attach=".main-container"
              :footer="false" size="400px">
      <div class="music-player-list">
        <div v-for="(m, i) in musics" :key="m.id" class="item" :class="{active: music?.id === m.id}"
             @dblclick="switchIndex(i)">
          <t-row :gutter="8">
            <t-col :span="5">
              <div class="name ellipsis" :title="m.name">{{ m.name }}</div>
            </t-col>
            <t-col :span="5">
              <div class="artist ellipsis" :title="m.artist">{{ m.artist }}</div>
            </t-col>
            <t-col :span="2">
              <t-button variant="text" theme="danger" @click="removeIndex(i, m)">
                <template #icon>
                  <delete-icon/>
                </template>
              </t-button>
            </t-col>
          </t-row>
        </div>
      </div>
    </t-drawer>
  </div>
</template>
<script lang="ts" setup>
import {
  DownloadIcon,
  DeleteIcon,
  PlayIcon,
  PauseIcon,
  NextIcon,
  PreviousIcon,
  ChevronDownDoubleIcon,
  ChevronUpDoubleIcon
} from 'tdesign-icons-vue-next';
import {useAddMusicGroup, useMusicAppend, useMusicPlay} from "@/global/Event";
import {
  audioControl,
  currentTime, displayVisible, duration,
  listVisible, loop, loopControl,
  music,
  musics,
  next, onMusicAppend,
  onMusicPlay, played, pre,
  removeIndex, switchCurrentTime, switchDisplay,
  switchIndex, switchList, switchLyric, volume
} from "@/components/MusicPlayer/MusicPlayer";
import {prettyDateTime} from "@/utils/lang/FormatUtil";
import {isNull} from "@/utils/lang/FieldUtil";
import {MusicItemSource} from "@/entity/MusicItem";
import {isNotEmptyString} from "@/utils/lang/StringUtil";
import MessageUtil from "@/utils/modal/MessageUtil";
import {useDownloadStore} from "@/store";

const disabled = computed(() => isNull(music.value));
const name = computed(() => music.value?.name || '无歌曲');
const artist = computed(() => music.value?.artist || '无演唱家');
const loopText = computed(() => {
  if (loop.value === 1) {
    return '单曲循环'
  } else if (loop.value === 2) {
    return '顺序循环'
  } else if (loop.value === 3) {
    return '随机循环'
  } else {
    return '顺序循环'
  }
});
const source = computed(() => {
  if (!music.value) {
    return ''
  }
  const {source} = music.value;
  switch (source) {
    case MusicItemSource.LOCAL:
      return '本地';
    case MusicItemSource.WEBDAV:
      return 'WebDAV';
    case MusicItemSource.WEB:
      return '网络';
    default:
      return '';
  }
});
const enableDownload = computed(() => {
  if (!music.value) {
    return false;
  }
  return /^https?:\/\//.test(music.value.url);
});
const disableAddGroup = computed(() => {
  if (!music.value) {
    return true;
  }
  return music.value.source === MusicItemSource.WEB;
})

function onLabel(h: any, props: { value: number }) {
  return `${prettyDateTime(props.value)} / ${prettyDateTime(duration.value)}`
}

function onChange(value: number | Array<number>) {
  const val = Array.isArray(value) ? value[0] : value;
  switchCurrentTime(val);
}

function onAddMusicGroup() {
  useAddMusicGroup.emit();
}

function onDownload() {
  if (!music.value) {
    MessageUtil.error("音乐不存在");
    return;
  }
  useDownloadStore().emit(music.value);
}

onMounted(() => {
  useMusicPlay.on(onMusicPlay);
  useMusicAppend.on(onMusicAppend);
});
onBeforeUnmount(() => {
  useMusicPlay.off(onMusicPlay);
  useMusicAppend.off(onMusicAppend);
});
</script>
<style scoped lang="less">
@import './MusicPlayer.less';
</style>
