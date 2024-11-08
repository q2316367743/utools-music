<template>
  <div class="music-player">
    <div class="container">
      <div class="image">
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
          <t-button shape="circle" theme="primary" variant="text" :disabled>
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
          <t-button shape="circle" theme="primary" variant="text" @click="listVisible = !listVisible">
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
import {MusicPlayEvent, useMusicPlay} from "@/global/Event";
import {MusicItemView} from "@/entity/MusicItem";
import {getEffectiveNumber, isNull} from "@/utils/lang/FieldUtil";
import {prettyDateTime} from "@/utils/lang/FormatUtil";
import {random} from "radash";

const musics = ref(new Array<MusicItemView>());
const index = ref(0);
const music = ref<MusicItemView | null>(null);
// 1: 单，2：顺，3：随
const loop = ref(2);

const audio = new Audio();

const duration = ref(0);
const currentTime = ref(0);
const played = ref(false);
const volume = ref(audio.volume * 100);
const listVisible = ref(false);

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

watch(volume, val => {
  audio.volume = val / 100
})

audio.addEventListener('canplay', () => {
  duration.value = audio.duration;
});
audio.addEventListener('timeupdate', () => {
  currentTime.value = audio.currentTime;
});
audio.addEventListener('playing', () => {
  played.value = true;
});
audio.addEventListener('pause', () => {
  played.value = false;
});
audio.addEventListener('ended', () => {
  played.value = false;
  // 播放完，下一个
  next();
});

function audioControl() {
  if (played.value) {
    audio.pause();
  } else {
    audio.play();
  }
}

function loopControl() {
  switch (loop.value) {
    case 1:
      loop.value = 2;
      break;
    case 2:
      loop.value = 3;
      break;
    case 3:
      loop.value = 1;
      break;
    default:
      loop.value = 2;
      break;
  }
}

function play() {
  music.value = musics.value[getEffectiveNumber(index.value, 0, musics.value.length)];
  audio.src = music.value.url;
  audio.load();
  audio.play();
}

function pre() {
  if (loop.value === 1) {
    return;
  }
  if (index.value === 3) {
    index.value = random(0, musics.value.length - 1)
  } else {
    if (index.value === 0) {
      index.value = musics.value.length - 1;
    } else {
      index.value -= 1;
    }
  }
  play();
}

function next() {
  if (loop.value === 1) {
    return;
  }
  if (index.value === 3) {
    index.value = random(0, musics.value.length - 1)
  } else {
    if (index.value === musics.value.length - 1) {
      index.value = 0;
    } else {
      index.value += 1;
    }
  }
  play();
}

function switchIndex(idx: number) {
  index.value = idx;
  play();
}

function removeIndex(idx: number, m: MusicItemView) {
  musics.value.splice(idx, 1);
  if (music.value?.id === m.id) {
    console.log(index.value, musics.value.length)
    play();
  } else {
    index.value = musics.value.findIndex(v => {
      return v.id === music.value?.id
    });
  }
}

function rePlay() {
  // 清空音频状态
  audio.pause()
  audio.src = '';
  // 如果不存在音乐
  if (musics.value.length === 0) {
    return;
  }
  play();
}

function onMusicPlay(e: MusicPlayEvent) {
  musics.value = e.views;
  index.value = e.index;
  // 触发重新播放
  rePlay();
}

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
