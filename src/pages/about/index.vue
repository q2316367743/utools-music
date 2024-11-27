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
          <t-link theme="success" @click="openReward">赏赞作者</t-link>
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
      <t-paragraph label="问题反馈">
        <t-space>
          <div class="about__label">问题反馈</div>
          <t-link theme="primary" @click="openFeedback">打开反馈</t-link>
        </t-space>
      </t-paragraph>
      <t-alert theme="success">
        <span>特别感谢</span>
        <t-link theme="primary" @click="openUrl('https://musicfree.catcat.work/')">MusicFree</t-link>
        <span>项目对本插件的启发</span>
      </t-alert>
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
import {openReward} from "@/pages/about/func";


function openUrl(url: string) {
  utools.shellOpenExternal(url);
}

function openFeedback() {
  utools.fetchUserServerTemporaryToken().then((ret) => {
    utools.ubrowser.goto('https://feedback.esion.xyz/#/auth?type=utools&pluginId=1861241716164067328&accessToken=' + ret.token)
      .run({ width: 1200, height: 800 })
  }).catch(e => {
    utools.showNotification("由于未登录uTools账号或网络问题，无法自动登录反馈系统")
    console.error(e);
    utools.ubrowser.goto('https://feedback.esion.xyz/#/plugin/1861241716164067328/home')
      .run({ width: 1200, height: 800 })
  });
}
</script>
<style scoped lang="less">
.about {
  position: relative;
  height: 100%;
  width: 100%;
  padding: 16px;

  &__label {
    width: 60px;
  }

  .title {
    margin-top: 1rem;
    font-size: 2rem;
    height: 3rem;
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
