<template>
  <div class="player" :class="{play: controls === 'play'}">
    <div class="player__timeline">
      <p class="player__author">{{ artist }}</p>
      <p class="player__song">{{ name }}</p>
      <div class="player__timelineBar">
        <div class="playhead" :style="{width: percentage}"></div>
      </div>
    </div>
    <div class="player__bar">
      <div class="player__album">
        <div class="player__albumImg active-song">
          <div class="cover" :style="{transform: `rotate(${rotate}deg)`}">
            <img :src="DefaultCover" :alt="name"/>
            <img :src="cover" :alt="name"/>
          </div>
        </div>
      </div>
      <div class="player__controls">
        <div class="player__prev" @click="preMusic">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <path d="M26.695 34.434v31.132L54.5 49.998z"/>
            <path
              d="M24.07 34.434v31.132c0 2.018 2.222 3.234 3.95 2.267l27.804-15.568c1.706-.955 1.707-3.578 0-4.533L28.02 32.168c-2.957-1.655-5.604 2.88-2.649 4.533l27.805 15.564v-4.533L25.371 63.3l3.95 2.267V34.435c-.001-3.387-5.251-3.387-5.251-.001z"/>
            <g>
              <path d="M55.5 34.434v31.132l27.805-15.568z"/>
              <path
                d="M52.875 34.434v31.132c0 2.018 2.222 3.234 3.949 2.267 9.27-5.189 18.537-10.379 27.805-15.568 1.705-.955 1.705-3.578 0-4.533L56.824 32.168c-2.957-1.655-5.604 2.88-2.648 4.533l27.803 15.564v-4.533L54.176 63.3l3.949 2.267V34.435c0-3.387-5.25-3.387-5.25-.001z"/>
            </g>
          </svg>
        </div>
        <div class="player__play" @click="play">
          <play-icon v-if="controls === 'pause'" color="var(--td-brand-color-4)" size="36px"/>
          <pause-icon v-else color="var(--td-brand-color-4)" size="36px"/>
        </div>
        <div class="player__next" @click="nextMusic">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <path d="M26.695 34.434v31.132L54.5 49.998z"/>
            <path
              d="M24.07 34.434v31.132c0 2.018 2.222 3.234 3.95 2.267l27.804-15.568c1.706-.955 1.707-3.578 0-4.533L28.02 32.168c-2.957-1.655-5.604 2.88-2.649 4.533l27.805 15.564v-4.533L25.371 63.3l3.95 2.267V34.435c-.001-3.387-5.251-3.387-5.251-.001z"/>
            <g>
              <path d="M55.5 34.434v31.132l27.805-15.568z"/>
              <path
                d="M52.875 34.434v31.132c0 2.018 2.222 3.234 3.949 2.267 9.27-5.189 18.537-10.379 27.805-15.568 1.705-.955 1.705-3.578 0-4.533L56.824 32.168c-2.957-1.655-5.604 2.88-2.648 4.533l27.803 15.564v-4.533L54.176 63.3l3.949 2.267V34.435c0-3.387-5.25-3.387-5.25-.001z"/>
            </g>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {prettyDateTime} from "@/utils/lang/FormatUtil";
import {useColorMode} from "@/hooks/ColorMode";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import DefaultCover from '@/assets/image/default-cover.png'
import {PauseIcon, PlayIcon} from "tdesign-icons-vue-next";

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

const rotate = ref(0);


let raf = 0;
const rotateFunc = () => {
  raf = requestAnimationFrame(() => {
    if (rotate.value >= 360) {
      rotate.value = 0;
    }
    rotate.value += 1;
    rotateFunc();
  })
}

watch(controls, val => {
  if (val === 'play') {
    rotateFunc();
  } else {
    cancelAnimationFrame(raf);
  }
})

window.preload.receiveMsg(({type, value}) => {
  if (type === 'info') {
    cover.value = value.cover;
    name.value = value.name;
    artist.value = value.artist;
    album.value = value.album;
  } else if (type === 'control') {
    controls.value = value;
  } else if (type === 'progress') {
    percentage.value = (value.progress / value.total * 161).toFixed(0) + 'px';
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
