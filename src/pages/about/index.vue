<template>
  <div class="about">
    <div class="about__container">
      <div class="title">
        <span>关于 </span>
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
          <div class="about__label">插件作者</div>
          <t-link theme="primary" @click="openUrl(Constants.website)">{{ Constants.author }}</t-link>
          <button class="reward" role="button" @click="openReward">赏赞作者</button>
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
      .run({width: 1200, height: 800})
  }).catch(e => {
    utools.showNotification("由于未登录uTools账号或网络问题，无法自动登录反馈系统")
    console.error(e);
    utools.ubrowser.goto('https://feedback.esion.xyz/#/plugin/1861241716164067328/home')
      .run({width: 1200, height: 800})
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

  .reward {
    padding: 4px 12px;
    border: none;
    outline: none;
    color: rgb(255, 255, 255);
    background: #111;
    cursor: pointer;
    position: relative;
    z-index: 0;
    border-radius: 5px;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
  }

  .reward:before {
    content: "";
    background: linear-gradient(
      45deg,
      #ff0000,
      #ff7300,
      #fffb00,
      #48ff00,
      #00ffd5,
      #002bff,
      #7a00ff,
      #ff00c8,
      #ff0000
    );
    position: absolute;
    top: -2px;
    left: -2px;
    background-size: 400%;
    z-index: -1;
    filter: blur(5px);
    -webkit-filter: blur(5px);
    width: calc(100% + 4px);
    height: calc(100% + 4px);
    animation: glowing-reward 20s linear infinite;
    transition: opacity 0.3s ease-in-out;
    border-radius: 10px;
  }

  @keyframes glowing-reward {
    0% {
      background-position: 0 0;
    }
    50% {
      background-position: 400% 0;
    }
    100% {
      background-position: 0 0;
    }
  }

  .reward:after {
    z-index: -1;
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    background: #222;
    left: 0;
    top: 0;
    border-radius: 10px;
  }

}
</style>
