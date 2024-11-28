<template>
  <div class="music-display" :class="{show: displayVisible}">
    <t-layout class="w-full h-full">
      <t-aside class="list" :width="collapsed ? '0px' : '300px'">
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
                  <DeleteIcon/>
                </template>
              </t-button>
            </t-col>
          </t-row>
        </div>
      </t-aside>
      <t-content class="container">
        <div class="title">{{ name }}</div>
        <div class="subtitle">
          <t-tag theme="primary">{{ artist }}</t-tag>
          <span v-if="album"> - </span>
          <span v-if="album">{{ album }}</span>
        </div>
        <div class="lyric">
          <div class="lyric-empty" v-if="lyrics.length === 0">
            <p>暂无歌词</p>
            <music-lyric-search/>
          </div>
          <div class="lyric-line" v-for="(lyric, i) in lyrics" :key="lyric.start"
               :class="{active: lyricIndex === i}" @click="handleLyricClick(lyric)">
            <span>{{ lyric.text }}</span>
            <play-icon class="play" size="1.5rem"/>
          </div>
        </div>
        <div class="close">
          <t-button theme="primary" variant="text" size="large" shape="circle" @click="collapsed=!collapsed">
            <template #icon>
              <view-list-icon/>
            </template>
          </t-button>
          <t-button theme="primary" variant="text" size="large" shape="circle" @click="displayVisible=false">
            <template #icon>
              <chevron-down-icon/>
            </template>
          </t-button>
        </div>
      </t-content>
    </t-layout>
  </div>
</template>
<script lang="ts" setup>
import {
  audio,
  displayVisible, lyricIndex,
  lyrics,
  music,
  musics, played,
  removeIndex, switchCurrentTime,
  switchIndex
} from "@/components/MusicPlayer/MusicPlayer";
import {DeleteIcon, PlayIcon, ChevronDownIcon, ViewListIcon} from 'tdesign-icons-vue-next';
import {LyricLine} from "@/types/LyricLine";
import MusicLyricSearch from "@/components/MusicPlayer/MusicLyricSearch.vue";

const collapsed = ref(false);

const name = computed(() => music.value?.name || '无歌曲');
const artist = computed(() => music.value?.artist || '无演唱家');
const album = computed(() => music.value?.album || '');

function handleLyricClick(value: LyricLine) {
  switchCurrentTime(value.start + 1);
  if (!played.value) {
    audio.play();
  }
}
</script>
<style scoped lang="less">
.music-display {
  position: fixed;
  top: 100vh;
  left: 0;
  right: 0;
  height: calc(100vh - 60px);

  background-color: var(--td-bg-color-container);
  color: var(--td-text-color-primary);
  transition: top 0.5s;

  display: flex;

  &.show {
    top: 0;
  }

  .list {
    border-right: 1px solid var(--td-border-level-1-color);
    overflow: auto;

    .item {
      padding: 4px 8px;
      border-bottom: 1px solid var(--td-component-border);
      cursor: pointer;
      user-select: none;
      color: var(--td-text-color-primary);
      line-height: 32px;

      .name, .artist {
        height: 32px;
        line-height: 32px;
      }

      &.active {
        background-color: var(--td-bg-color-container-hover);
        color: var(--td-text-color-link);

        .name, .artist {
          color: var(--td-text-color-link);
        }
      }

      &:hover {
        background-color: var(--td-bg-color-container-hover);
        color: var(--td-text-color-link);

        .name, .artist {
          color: var(--td-text-color-link);
        }
      }

      .artist {
        color: var(--td-text-color-secondary);
      }
    }
  }

  .container {
    position: relative;

    .mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      .mask-inner {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 50vh;
        .canvas {
          width: 100%;
          height: 100%;
        }
      }
    }

    .title {
      font-size: var(--td-font-size-headline-medium);
      font-weight: bold;
      color: var(--td-text-color-primary);
      text-align: center;
      margin: 16px 0;
    }

    .subtitle {
      font-size: var(--td-font-size-title-medium);
      color: var(--td-text-color-secondary);
      text-align: center;
      margin: 12px 0;
    }

    .lyric {
      position: absolute;
      top: 120px;
      left: 0;
      right: 0;
      bottom: 32px;
      text-align: center;
      overflow: auto;
      transition: font-size 0.5s;

      .lyric-line {
        padding: 8px 0;
        font-size: 1.5rem;
        cursor: pointer;
        position: relative;

        .play {
          display: none;
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          padding: 10px;
          color: var(--td-text-color-link);
        }

        &:hover {
          background-color: var(--td-mask-active);

          .play {
            display: block;
          }
        }

        &.active {
          color: var(--td-text-color-link);
          font-size: 1.5rem;
          margin: 8px 0;
        }
      }

      .lyric-empty {
        position: absolute;
        top: calc(50% - 4rem);
        left: 0;
        right: 0;
        text-align: center;
        user-select: none;
      }
    }

    .close {
      position: absolute;
      top: 16px;
      right: 16px;
    }
  }

}
</style>
