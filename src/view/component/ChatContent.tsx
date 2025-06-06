import React, {useEffect, useRef, useState} from "react";
import {chatInteractive, historyMessageList, newChatCreate} from "../../api/chatApi";
import {Avatar, Button, Input, Layout, List, message} from 'antd';
import {Content, Footer} from "antd/es/layout/layout";
import {ArrowRightOutlined, MinusCircleOutlined, RobotOutlined, UserOutlined} from "@ant-design/icons";
import Rabbit from '../../image/rabbit.svg'
import './ChatContent.less'
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import type { Components } from 'react-markdown';

interface MessageItem {
    id: string;
    content: string;
    isUser: boolean;
    loading?: boolean;
    createAt?: string
}

interface Prop {
    sessionId: string,
    onSessionChange: (sessionId: string) => void,
}

const ChatContent: React.FC<Prop> = ({sessionId, onSessionChange}) => {

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
        if (sessionId && !loading) {
            setLoading(true);
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
        setLoading(true);
        let chatId: string = sessionId;
        if (!chatId || chatId === 'new') {
            newChatCreate(input).then(res => {
                chatId = res.sessionId;
                onSessionChange(chatId)
                aiChat(chatId, input);
            }).catch(err => {
                setLoading(false)
                return
            });
        } else {
            await aiChat(chatId, input);
        }
    };

    const aiChat = async (sessionId: string, input: string) => {
        try {
            if (sessionId === 'new') {
                return
            }
            const userInput = input;
            setInput('');

            // 添加用户消息
            addMessage(userInput, true);
            // 添加加载中的AI消息
            addMessage('', false, true);

            // 初始化 EventSource
            eventSourceRef.current = chatInteractive(userInput, sessionId);
            const reader = eventSourceRef.current.stream.getReader();

            // 处理流数据
            while (true) {
                const {done, value} = await reader.read();
                if (done) break;
                updateLastMessage(value);
                scrollToBottom();
            }
        } catch (err) {
            message.error('请求失败，请重试').then();
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setLoading(false);
            setInput('')
            eventSourceRef.current?.close();
        }
    }

    // 停止生成
    const handleStop = () => {
        eventSourceRef.current?.close();
        setLoading(false);
        message.info('已停止生成').then();
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const MarkdownRenderer = ({ content }: { content: string }) => {
        const components: Components = {
            code({ node, className, children, ...props }) {
                // 通过父元素判断是否是行内代码
                const isInline = !node?.position?.start.column;

                if (isInline) {
                    return <code className={className} {...props}>{children}</code>;
                }

                return (
                    <pre className="code-block">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
                );
            },
        };

        return (
            <ReactMarkdown
                rehypePlugins={[rehypeHighlight]}
                components={components}
            >
                {content}
            </ReactMarkdown>
        );
    };

    return (
        <Layout className="chat-layout">
            {sessionId === 'new' ? <div className="new-chat">
                <div className='chat-header'>
                    <img src={Rabbit} alt='rabbit'/>
                    <span style={{marginLeft: '12px'}}>我是磐石电气(MonolithIot)的助手，很高兴见到你！</span>
                </div>
                <div className="chat-tip">
                    我可以帮你处理磐石电气相关的运维问题、写代码、写作各种创意内容，请把你的问题交给我吧~
                </div>
            </div> : <Content className="chat-content">
                <List
                    dataSource={messages}
                    locale={{emptyText: '暂无对话历史'}}
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
                                    <div className="message-content">
                                        <MarkdownRenderer content={item.content}/>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                />
                <div ref={messagesEndRef}/>
            </Content>}


            <Footer className="chat-footer">
                <div className="input-container">
                    <Input.TextArea
                        value={input}
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