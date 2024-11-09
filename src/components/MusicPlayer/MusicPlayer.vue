<template>
  <div class="music-player">
    <div class="container">
      <div class="image" @click="switchDisplay">
        <t-image v-if="music && music.cover" :src="music.cover"></t-image>
        <t-avatar v-else-if="music" shape="round" size="42px">{{ music.name.substring(0, 1) }}</t-avatar>
        <t-avatar v-else shape="round" size="42px">无</t-avatar>
      </div>
      <div>
        <div class="meta ellipsis">
          <span class="name">{{ name }}</span>
          <span> - </span>
          <span class="artist">{{ artist }}</span>
        </div>
        <div class="duration">{{ prettyDateTime(currentTime) }} / {{ prettyDateTime(duration) }}</div>
      </div>
      <div class="operator">
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
      <t-progress :percentage :label="false"></t-progress>
    </div>
    <div class="controls">
      <t-button shape="circle" theme="primary" variant="text" size="large" :disabled @click="pre">
        <template #icon>
          <t-icon name="previous"></t-icon>
        </template>
      </t-button>
      <t-button shape="circle" theme="primary" variant="text" size="large" :disabled @click="audioControl">
        <template #icon>
          <t-icon v-if="played" name="pause"></t-icon>
          <t-icon v-else name="play"></t-icon>
        </template>
      </t-button>
      <t-button shape="circle" theme="primary" variant="text" size="large" :disabled @click="next">
        <template #icon>
          <t-icon name="next"></t-icon>
        </template>
      </t-button>
    </div>
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
                  <t-icon name="delete"/>
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
import {useMusicPlay} from "@/global/Event";
import {
  audioControl,
  currentTime, duration,
  listVisible, loop, loopControl,
  music,
  musics,
  next,
  onMusicPlay, played, pre,
  removeIndex, switchDisplay,
  switchIndex, switchList, switchLyric, volume
} from "@/components/MusicPlayer/MusicPlayer";
import {prettyDateTime} from "@/utils/lang/FormatUtil";
import {isNull} from "@/utils/lang/FieldUtil";

const percentage = computed(() => {
  if (duration.value === 0) {
    return 0;
  }
  return currentTime.value / duration.value * 100;
});
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

onMounted(() => {
  useMusicPlay.on(onMusicPlay);
});
onBeforeUnmount(() => {
  useMusicPlay.off(onMusicPlay);
})
</script>
<style scoped lang="less">
@import './MusicPlayer.less';
</style>
