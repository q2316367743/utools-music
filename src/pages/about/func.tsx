import {DialogPlugin, Image} from "tdesign-vue-next";
import reward from '@/assets/image/reward.png';

export function openReward() {
  DialogPlugin({
    header: '赏赞作者',
    footer: false,
    top: '8vh',
    width: '366px',
    default: () => <Image src={reward} alt={'赏赞码'} style={{ width: '300px', height: '300px' }} />
  })
}