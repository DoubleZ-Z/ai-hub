import React, {useEffect, useRef, useState} from "react";
import {chatInteractive, historyMessageList} from "../../api/chatApi";
import {Avatar, Button, Input, Layout, List, message} from 'antd';
import {Content, Footer} from "antd/es/layout/layout";
import {ArrowRightOutlined, MinusCircleOutlined, RobotOutlined, UserOutlined} from "@ant-design/icons";
import './ChatContent.less'

interface MessageItem {
    id: string;
    content: string;
    isUser: boolean;
    loading?: boolean;
    createAt?: string
}

interface Prop {
    sessionId: string
}

const ChatContent: React.FC<Prop> = ({sessionId}) => {

    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const eventSourceRef = useRef<ReturnType<typeof chatInteractive>>(null);

    useEffect(() => {
        return () => {
            eventSourceRef.current?.close();
        };
    }, []);

    useEffect(() => {
        if (sessionId) {
            setLoading(true);  // 添加加载状态
            historyMessageList(sessionId)
                .then(res => {
                    const formattedMessages = res.map(msg => ({
                        id: msg.messageId,
                        content: msg.content,
                        isUser: msg.role === 'user',
                        loading: false,
                        createAt: msg.createdAt
                    }));
                    setMessages(formattedMessages);
                })
                .catch(err => {
                    console.error(err);
                })
                .finally(() => setLoading(false));  // 确保结束加载状态
        }
    }, [sessionId]);

    // 滚动到底部
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    };

    const addMessage = (content: string, isUser: boolean, loading?: boolean) => {
        setMessages(prev => [
            ...prev,
            {
                id: Date.now().toString(),
                content: loading ? '▍' : content, // 添加光标占位符
                isUser,
                loading
            }
        ]);
    };

    // 更新最后一条消息
    const updateLastMessage = (newContent: string) => {
        setMessages(prev => {
            const last = prev[prev.length - 1];
            if (!last) return prev;

            const content = last.content.endsWith('▍')
                ? last.content.slice(0, -1) + newContent
                : last.content + newContent;

            return [
                ...prev.slice(0, -1),
                {...last, content, loading: false}
            ];
        });
    };

    // 处理提交
    const handleSubmit = async () => {
        if (!input.trim() || loading) return;

        try {
            setLoading(true);
            const userInput = input;
            setInput('');

            // 添加用户消息
            addMessage(userInput, true);
            // 添加加载中的AI消息
            addMessage('', false, true);

            // 初始化 EventSource
            eventSourceRef.current = chatInteractive(userInput);
            const reader = eventSourceRef.current.stream.getReader();

            // 处理流数据
            while (true) {
                const {done, value} = await reader.read();
                if (done) break;
                updateLastMessage(value);
                scrollToBottom();
            }
        } catch (err) {
            message.error('请求失败，请重试');
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setLoading(false);
            eventSourceRef.current?.close();
        }
    };


    // 停止生成
    const handleStop = () => {
        eventSourceRef.current?.close();
        setLoading(false);
        message.info('已停止生成').then();
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <Layout className="chat-layout">
            <Content className="chat-content">
                {sessionId === 'new' ? <div className="new-chat">

                </div> : <List
                    dataSource={messages}
                    locale={{ emptyText: '暂无对话历史' }}
                    renderItem={(item) => (
                        <div className={`message-item ${item.isUser ? 'user' : 'ai'}`}>
                            <div className="message-avatar">
                                {item.isUser ? (
                                    <Avatar icon={<UserOutlined/>}/>
                                ) : (
                                    <Avatar icon={<RobotOutlined/>}/>
                                )}
                            </div>
                            <div className="message-bubble">
                                {item.loading ? (
                                    <div className="typing-indicator">
                                        <div className="dot"/>
                                        <div className="dot"/>
                                        <div className="dot"/>
                                    </div>
                                ) : (
                                    <div className="message-content">{item.content}</div>
                                )}
                            </div>
                        </div>
                    )}
                />}
                <div ref={messagesEndRef}/>
            </Content>

            <Footer className="chat-footer">
                <div className="input-container">
                    <Input.TextArea
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                        }}
                        onChange={e => setInput(e.target.value)}
                        placeholder="输入你的问题..."
                        autoSize={{minRows: 1, maxRows: 12}}
                        onPressEnter={(e) => {
                            if (!e.shiftKey) {
                                e.preventDefault();
                                handleSubmit().then();
                            }
                        }}
                        disabled={loading}
                    />
                    <div className="action-buttons">
                        {loading ? (
                            <Button shape="circle" onClick={handleStop} icon={<MinusCircleOutlined/>}/>

                        ) : (
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<ArrowRightOutlined/>}
                                onClick={handleSubmit}
                                disabled={!input.trim()}
                            />
                        )}
                    </div>
                </div>
            </Footer>
        </Layout>
    )
}

export default ChatContent;