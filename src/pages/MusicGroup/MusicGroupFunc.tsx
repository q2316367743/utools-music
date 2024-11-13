import MessageBoxUtil from "@/utils/modal/MessageBoxUtil";
import {useMusicGroupStore} from "@/store/module/MusicGroupStore";
import MessageUtil from "@/utils/modal/MessageUtil";

export function addMusicGroup(): void {
  MessageBoxUtil.prompt("请输入歌单名称", "新建歌单", {
    confirmButtonText: "新建"
  })
    .then(name => {
      useMusicGroupStore().postMusicGroup({
        name: name,
        items: [],
        id: Date.now(),
      })
        .then(() => MessageUtil.success("新增成功"))
        .catch(e => MessageUtil.error("新增失败", e));
    })
}