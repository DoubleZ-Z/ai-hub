export interface HistoryMessage {
    messageId: string;
    content: string;
    role: 'user' | 'assistant';
    createdAt: string;
}

export interface ChatCreate {
    sessionId: string,
}