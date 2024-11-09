<template>
  <div class="music-display" :class="{show: displayVisible}">
    <div class="list">
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
    <div class="container">
      <div class="title">{{ name }}</div>
      <div class="subtitle">
        {{ artist }} - {{ album }}
      </div>
      <div class="lyric">
        <div class="lyric-empty" v-if="lyrics.length === 0">
          <p>暂无歌词</p>
          <t-link theme="primary">立即搜素</t-link>
        </div>
        <div class="lyric-line" v-for="(lyric, i) in lyrics" :key="lyric.start"
             :class="{active: lyricIndex === i}">
          {{ lyric.text }}
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  displayVisible, lyricIndex,
  lyrics,
  music,
  musics,
  removeIndex,
  switchIndex
} from "@/components/MusicPlayer/MusicPlayer";


const name = computed(() => music.value?.name || '无歌曲');
const artist = computed(() => music.value?.artist || '无演唱家');
const album = computed(() => music.value?.album || '');
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
    flex: 0 0 300px;
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
    flex: 1 1 auto;
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
        padding: 4px 0;

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
  }

}
</style>
