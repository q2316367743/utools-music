import {PluginInstance} from "@/types/PluginInstance";

export interface PluginEntity {
  id: number;
  /**
   * 插件名称
   */
  name: string;
  /**
   * 版本
   */
  version: string;
  /**
   * 作者
   */
  author: string;
  /**
   * 插件更新地址
   */
  srcUrl: string;

  /**
   * 插件内容
   */
  content: string;
}

export interface PluginEntityView extends PluginEntity {
  _id: string;
  _rev?: string;
}


export interface PluginInstanceView extends PluginEntity {
  instance: PluginInstance;
}