<template>
  <div class="audio-content">
    <div class="audio-bg">
      <img v-if="cover" :src="cover" alt="cover"/>
      <div class="mask"></div>
    </div>
    <div class="audio-detail">
      <div class="left-config">
        <div class="play">
          <t-button variant="text" theme="primary" shape="circle" @click="play">
            <template #icon>
              <play-icon v-if="controls === 'pause'" color="#fff" size="36px"/>
              <pause-icon v-else color="#fff" size="36px"/>
            </template>
          </t-button>
        </div>
        <div class="next">
          <t-button variant="text" theme="primary" shape="circle" @click="nextMusic">
            <template #icon>
              <next-icon color="#fff" size="36px"/>
            </template>
          </t-button>
        </div>
      </div>
      <div class="right-info">
        <div class="m-title ellipsis">{{ name }}</div>
        <div class="m-singer ellipsis">{{ artist }}</div>
      </div>
    </div>
    <div class="audio-progress" :style="{width: percentage}"/>
  </div>
</template>
<script lang="ts" setup>
import {prettyDateTime} from "@/utils/lang/FormatUtil";
import {useColorMode} from "@/hooks/ColorMode";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {NextIcon, PauseIcon, PlayIcon} from "tdesign-icons-vue-next";

useColorMode({
  key: LocalNameEnum.KEY_COLOR_MODE,
  attribute: 'theme-mode',
  selector: 'html'
});

const cover = ref('');
const name = ref('');
const artist = ref('');
const album = ref('');
const percentage = ref('0px');

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
    percentage.value = (value.progress / value.total * 228).toFixed(0) + 'px';
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

const preMusic = () => window.preload.sendMsg('pre');
const nextMusic = () => window.preload.sendMsg('next');
</script>
<style lang="less">
</style>
