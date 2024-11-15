import {h} from "vue";
import NotificationPlugin from "tdesign-vue-next/es/notification/plugin";
import {Button} from "tdesign-vue-next";

export default {
  success(content: string, title?: string): void {
    NotificationPlugin('success', {
      content,
      title,
      closeBtn: true,
      duration: 1000
    })
  },
  info(content: string, title?: string): void {
    NotificationPlugin('info', {
      content,
      title,
      closeBtn: true,
    })
  },
  warning(content: string, title?: string): void {
    NotificationPlugin('warning', {
      content,
      title,
      closeBtn: true
    })
  },
  error(content: string, title?: string, e?: any): void {
    NotificationPlugin('warning', {
      content: `${content}，${e.message || e}`,
      title,
      closeBtn: true
    })
  },

  confirm(content: string, title: string, config: {
    confirmButtonText?: string,
    cancelButtonText?: string,
    duration?: number
  }): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let flag = true;
      let notificationReturn = NotificationPlugin('info', {
        content,
        title,
        closeBtn: true,
        duration: config.duration,
        footer: () => h('div', [
          h(Button, {
            variant: 'text',
            onClick: () => {
              reject();
              flag = false;
              notificationReturn.then(e => e.close());
            }
          }, () => (config.cancelButtonText || '取消')),
          h(Button, {
            theme: 'primary',
            onClick: () => {
              resolve();
              flag = false;
              notificationReturn.then(e => e.close());
            }
          }, () => (config.confirmButtonText || '确定'))
        ]),
        onDurationEnd() {
          if (flag) {
            reject();
          }
        }
      });
    })
  }
}
