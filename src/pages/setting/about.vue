<template>
  <div class="about">
    <div class="about__container">
      <div class="title">
        <span>关于  </span>
        <span>{{ Constants.name }}</span>
      </div>
      <t-paragraph>
        <t-space>
          <div class="about__label">当前版本</div>
          <div>{{ Constants.version }}</div>
        </t-space>
      </t-paragraph>
      <t-paragraph label="软件作者">
        <t-space>
          <div class="about__label">软件作者</div>
          <t-link theme="primary" @click="openUrl(Constants.website)">{{ Constants.author }}</t-link>
        </t-space>
      </t-paragraph>
      <t-paragraph>
        <t-space>
          <div class="about__label">源代码</div>
          <div>插件基于Apache-2.0协议开源</div>
          <t-link theme="primary" @click="openUrl(Constants.repo)">
            Github地址
          </t-link>
        </t-space>
      </t-paragraph>
      <t-paragraph>
        本地音乐播放器，构建属于你的音乐库。
      </t-paragraph>
      <t-paragraph>
        开通uTools会员，插件数据可同步。
      </t-paragraph>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {Constants} from "@/global/Constant";


function openUrl(url: string) {
  utools.shellOpenExternal(url);
}


</script>
<style scoped lang="less">
.about {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;

  &__label {
    width: 60px;
  }

  .title {
    margin-top: 1rem;
    font-size: 2rem;
    height: 2rem;
    width: fit-content;
    background: linear-gradient(60deg, #E21143, #0052D9);
    -webkit-background-clip: text;
    color: transparent;
    font-weight: bolder;
    user-select: none;

    .version {
      font-size: 0.5em;
    }
  }

}
</style>
