import {Button, Notification} from "@arco-design/web-vue";
import {h} from "vue";

export default {
    success(content: string, title?: string): void {
        Notification.success({
            content,
            title,
            closable: true,
            duration: 1000
        })
    },
    info(content: string, title?: string): void {
        Notification.info({
            content,
            title,
            closable: true,
        })
    },
    warning(content: string, title?: string): void {
        Notification.warning({
            content,
            title,
            closable: true
        })
    },
    error(content: string, title?: string): void {
        Notification.error({
            content,
            title,
            closable: true
        })
    },

    confirm(content: string, title: string, config: {
        confirmButtonText?: string,
        cancelButtonText?: string,
        duration?: number
    }): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let flag = true;
            let notificationReturn = Notification.info({
                content,
                title,
                closable: true,
                duration: config.duration,
                footer: () => h('div', [
                    h(Button, {
                        type: 'text',
                        onClick: () => {
                            reject();
                            flag = false;
                            notificationReturn.close();
                        }
                    }, () => (config.cancelButtonText || '取消')),
                    h(Button, {
                        type: 'primary',
                        onClick: () => {
                            resolve();
                            flag = false;
                            notificationReturn.close();
                        }
                    }, () => (config.confirmButtonText || '确定'))
                ]),
                onClose() {
                    if (flag) {
                        reject();
                    }
                }
            });
        })
    }
}
