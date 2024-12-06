import {useMusicAppend, useMusicPlay} from "@/global/Event";
import {MusicGroupIndex, MusicGroupType} from "@/entity/MusicGroup";
import {MusicInstanceWeb} from "@/music/MusicInstanceWeb";
import {VxeTablePropTypes} from "vxe-table";
import {MusicItemSource, MusicItemView} from "@/entity/MusicItem";
import {musicGroupChoose} from "@/components/PluginManage/MusicGroupChoose";
import {useDownloadStore, useMusicGroupStore} from "@/store";
import MessageUtil from "@/utils/modal/MessageUtil";
import {MusicInstanceLocal} from "@/music/MusicInstanceLocal";
import {MusicInstanceWebDAV} from "@/music/MusicInstanceWebDAV";
import ContextMenu from "@imengyu/vue3-context-menu";

function renderMusicInstance(info: MusicGroupIndex, e: any) {
  if (info) {
    if (info.type === MusicGroupType.WEB) {
      return new MusicInstanceWeb(e, info.pluginId)
    } else if (info.type === MusicGroupType.MIX) {
      return new MusicInstanceWeb(e, e.pluginId)
    }
  }
  return e.source === MusicItemSource.LOCAL ? new MusicInstanceLocal(e) : new MusicInstanceWebDAV(e);
}

export function handleMusicGroupDblclick(info: MusicGroupIndex, rowIndex: number, data: Array<any>) {
  useMusicPlay.emit({
    views: data.map(e => renderMusicInstance(info, e)),
    index: rowIndex
  });
}

export function handleMusicGroupAll(info: MusicGroupIndex, data: Array<any>) {
  useMusicPlay.emit({
    views: data.map(e => renderMusicInstance(info, e)),
    index: 0
  });
}


export const buildMusicGroupMenuConfig = (info?: MusicGroupIndex): VxeTablePropTypes.MenuConfig<MusicItemView> => {
  const options = [
    {code: 'next', name: '下一首播放'},
    {code: 'music-group', name: '添加到歌单'},
    {code: 'remove', name: '从歌单中移除'}
  ];
  if (info) {
    if (info.type === MusicGroupType.WEB || info.type === MusicGroupType.MIX) {
      options.push({code: 'download', name: '下载'})
    }
  }
  return {
    className: 'music-group-menu',
    body: {
      options: [options]
    },
  };
};

interface MenuEventProps {
  e: MouseEvent,
  row: any,
  rowIndex: number
}


export function handleMenuClickEvent(params: MenuEventProps, info: MusicGroupIndex, onUpdate: () => void) {
  const {e, row, rowIndex} = params;

  const items = [
    {
      label: "下一首播放",
      onClick: () => useMusicAppend.emit(renderMusicInstance(info, row))
    },
    {
      label: "添加到歌单",
      onClick: () => musicGroupChoose([MusicGroupType.LOCAL])
        .then(id => {
          if (id > 0) {
            useMusicGroupStore().appendMusicGroup(id, row)
              .then(() => MessageUtil.success("添加成功"))
              .catch(e => MessageUtil.error("添加失败", e));
          }
        })
    },
    {
      label: "从歌单中移除",
      onClick: () => useMusicGroupStore().removeContentItem(info.id, rowIndex)
        .then(() => {
          MessageUtil.success("删除成功");
          onUpdate()
        })
        .catch(e => MessageUtil.error("删除失败", e))
    },
  ];
  if (info.type === MusicGroupType.WEB || info.type === MusicGroupType.MIX) {
    items.push({
      label: '下载', onClick: () => {
        const instance = renderMusicInstance(info, row);
        instance.getInfo()
          .then(useDownloadStore().emit)
          .catch(e => MessageUtil.error("获取下载信息错误", e));
      }
    })
  }

  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    theme: utools.isDarkColors() ? 'mac dark' : 'mac',
    items
  })

}