<template>
  <div class="music-display" :class="{show: displayVisible}">
    <customer-bg />
    <t-layout class="music-display__container">
      <t-aside class="list" :width="listVisible ? '300px' : '0px'"
               :style="{opacity: listVisible? 1 : 0, overflowX: 'hidden'}">
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
          <div class="lyric-empty" v-if="lyrics.length === 0 && music">
            <p>暂无歌词</p>
            <music-lyric-search :icon="false"/>
          </div>
          <div class="lyric-line" v-for="(lyric, i) in lyrics" :key="lyric.start"
               :class="{active: lyricIndex === i}" @click="handleLyricClick(lyric)">
            <span>{{ lyric.text }}</span>
            <play-icon class="play" size="1.5rem"/>
          </div>
        </div>
        <div class="close">
          <t-tooltip placement="bottom" content="搜索歌词" v-if="lyrics.length > 0">
            <music-lyric-search :icon="true"/>
          </t-tooltip>
          <t-button theme="primary" variant="text" size="large" shape="circle" @click="switchDisplay">
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
  displayVisible, listVisible, lyricIndex,
  lyrics,
  music,
  musics, played,
  removeIndex, switchCurrentTime, switchDisplay,
  switchIndex
} from "@/components/MusicPlayer/MusicPlayer";
import {DeleteIcon, PlayIcon, ChevronDownIcon} from 'tdesign-icons-vue-next';
import {LyricLine} from "@/types/LyricLine";
import MusicLyricSearch from "@/components/MusicPlayer/MusicLyricSearch.vue";
import {fontFamily} from "@/store";


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
  top: 105vh;
  left: 0;
  right: 0;
  height: 100vh;

  &__container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 60px;
  }

  transition: top 0.5s;

  display: flex;

  :deep(.t-layout) {
    background-color: transparent;
  }

  &.show {
    top: 0;
  }

  .list {
    border-right: 1px solid var(--td-border-level-1-color);
    overflow: auto;
    background-color: var(--music-bg-color-3);

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
        background-color: var(--music-bg-color-4);
        color: var(--td-text-color-link);

        .name, .artist {
          color: var(--td-text-color-link);
        }
      }

      &:hover {
        background-color: var(--music-bg-color-4);
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
        cursor: pointer;
        position: relative;
        font-size: 2rem;
        line-height: 2.5rem;
        font-family: v-bind(fontFamily) !important;

        .play {
          display: none;
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          padding: 15px;
          color: var(--td-text-color-link);
        }

        &:hover {
          background-color: var(--music-bg-color-3);

          .play {
            display: block;
          }
        }

        &.active {
          color: var(--td-text-color-link);
          font-size: 2rem;
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
      display: flex;
    }
  }

}
</style>
