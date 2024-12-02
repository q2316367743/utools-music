import MessageUtil from "@/utils/modal/MessageUtil";

const PORT = 13121;

window.preload.customer.createServer(PORT, () => {
    console.log("server started")
}, e => {
    MessageUtil.error("预览服务启动失败，请检查端口[12000]是否被占用", e)
})
export function renderPreviewUrl(url: string): string {
    return `http://localhost:${PORT}/play?url=${encodeURIComponent(url)}`
}
