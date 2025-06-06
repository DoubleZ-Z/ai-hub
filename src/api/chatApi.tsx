import {visibleAxios as axios} from "./AppRequest";
import {ChatCreate, HistoryMessage} from "../dto/message.define";

export const chatInteractive = (input: string, sessionId?: string) => {
    const params = new URLSearchParams({input});
    if (sessionId) params.append('sessionId', sessionId);
    const eventSource = new EventSource(`/api/chat/flux?${params}`);
    return {
        stream: new ReadableStream({
            start(controller) {
                eventSource.onmessage = (event) => {
                    const chunk = event.data;
                    controller.enqueue(chunk); // 将数据块加入流
                };
                eventSource.onerror = (err) => {
                    controller.close(); // 错误时关闭流
                    eventSource.close();
                };
            },
            cancel() {
                eventSource.close(); // 允许取消订阅
            }
        }),
        close: () => eventSource.close()
    };
};

export const newChatCreate = async (input: string) => {
    return (await axios.request({
        url: `/api/chat/new-chat/`,
        method: 'get',
        params: {
            input
        }
    })) as ChatCreate;
}

export const historyMessageList = async (sessionId: string) => {
    return (await axios.request({
        url: `/api/chat/history-message/${sessionId}`,
        method: 'get',
    })) as HistoryMessage[];
}
