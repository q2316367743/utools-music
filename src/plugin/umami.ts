import router from "@/plugin/router";
import Constant from "@/global/Constant";


function buildBasePayload() {
    return {
        hostname: "u.tools",
        language: navigator.language,
        referrer: "https://u.tools'",
        screen: `${window.screen.width}x${window.screen.height}`,
        website: Constant.umami.id,
    }
}

function buildPayload() {
    const {path, name} = router.currentRoute.value;
    return {
        ...buildBasePayload(),
        title: `${name as string || document.title}`,
        url: path,
    }
}

const buildPathPayload = (path: string, name: string) => ({
    ...buildBasePayload(),
    url: path,
    title: name,
})

function sendEvent(payload: Record<string, any>) {
    if (utools.isDev()) {
        console.log('Umami payload:', payload);
        return;
    }
    fetch(`${Constant.umami.url}/api/send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            payload: payload,
            type: "event"
        })
    }).then(response => response.text())
        .then(text => console.log('Umami response:', text))
        .catch(error => console.error('Umami error:', error))
}

export const useUmami = {
    track(event?: string, data?: Record<string, string> | string): void {
        const payload: Record<string, any> = buildPayload()
        if (event) {
            payload.name = event;
        }
        if (typeof data === 'string') {
            payload.data = {value: data};
        } else if (data) {
            payload.data = data;
        }
        sendEvent(payload)
    },

    page(path: string, name: string): void {
        const payload = buildPathPayload(path, name);
        sendEvent(payload)
    }
}
