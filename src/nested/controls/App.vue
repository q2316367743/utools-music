<template>
  <div class="controls">
    <div class="container">
      <div class="info">
        <div class="name ellipsis">{{ name }}</div>
        <div class="artist">{{ artist }}</div>
      </div>
    </div>
    <div class="cover">
      <t-progress :size="84" :percentage="percentage" theme="circle">
        <template #label>
          <div style="color: #fff;font-size: 0.7rem">
            <div>{{ duration1 }}</div>
            <div style="margin-top: 8px;padding-top: 8px;border-top: 1px solid #f2f2f2">{{ duration2 }}</div>
          </div>
        </template>
      </t-progress>
      <img :src="DefaultCover" :alt="name" draggable="false" />
      <img v-if="cover" :src="cover" :alt="name" draggable="false"/>
      <div class="icon" @click="play">
        <play-icon size="56px" color="white" v-if="controls === 'pause'"/>
        <pause-icon size="56px" color="white" v-else-if="controls === 'play'"/>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {PauseIcon, PlayIcon} from "tdesign-icons-vue-next";
import {prettyDateTime} from "@/utils/lang/FormatUtil";
import {useColorMode} from "@/hooks/ColorMode";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import DefaultCover from '@/assets/image/default-cover.png'

useColorMode({
  key: LocalNameEnum.KEY_COLOR_MODE,
  attribute: 'theme-mode',
  selector: 'html'
});

const cover = ref('');
const name = ref('');
const artist = ref('');
const album = ref('');
const percentage = ref(0);

const controls = ref('pause');
const duration1 = ref('');
const duration2 = ref('');

window.preload.receiveMsg(({type, value}) => {
  if (type === 'info') {
    cover.value = value.cover;
    name.value = value.name;
    artist.value = value.artist;
    album.value = value.album;
  } else if (type === 'control') {
    controls.value = value;
  } else if (type === 'progress') {
    percentage.value = parseFloat((value.progress / value.total * 100).toFixed(0));
    duration1.value = prettyDateTime(value.progress)
    duration2.value = prettyDateTime(value.total)
  }
});

function play() {
  if (controls.value === 'pause') {
    window.preload.sendMsg('play');
  } else {
    window.preload.sendMsg('pause');
  }
}
</script>
<style lang="less">
#app {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.controls {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  .container {
    position: absolute;
    top: 41px;
    left: 5px;
    right: 5px;
    bottom: 5px;
    background-color: var(--td-bg-color-container);
    user-select: none;
    -webkit-app-region: drag;
    box-shadow: var(--td-shadow-3);
    border-radius: var(--td-radius-large);

    .info {
      position: absolute;
      top: 0;
      left: 100px;
      padding: 0 32px;
      right: 0;
      bottom: 0;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .name {
        color: var(--td-text-color-primary);
      }

      .artist {
        color: var(--td-text-color-secondary);
        margin-top: 8px;
        font-size: var(--td-font-size-body-small);
      }
    }
  }

  .cover {
    position: absolute;
    top: 10px;
    left: 18px;
    bottom: 16px;
    width: 84px;
    height: 84px;
    border-radius: 50%;
    overflow: hidden;
    user-select: none;
    -webkit-app-region: no-drag;

    &:hover {
      .icon {
        opacity: 1;
      }

    }

    img {
      position: absolute;
      top: 4px;
      left: 4px;
      width: 76px;
      height: 76px;
      border-radius: 50%;
    }

    .icon {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--music-bg-color-3);
      opacity: 0;
      transition: opacity 0.3s;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
