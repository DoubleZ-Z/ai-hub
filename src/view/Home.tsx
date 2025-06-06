import React, {useState} from "react";
import HomeMenu from "./component/HomeMenu";
import {Layout} from "antd";
import ChatContent from "./component/ChatContent";

const Home: React.FC = () => {
    const [sessionId, setSessionId] = useState<string>('new')
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout className="ai-master" style={{height: "100vh"}}>
            <Layout.Sider collapsed={collapsed}>
                <HomeMenu sessionId={sessionId} onTitleSelect={key => {
                    setSessionId(key)
                }} onCollapsedChange={setCollapsed}/>
            </Layout.Sider>
            <Layout>
                <ChatContent sessionId={sessionId} onSessionChange={setSessionId}/>
            </Layout>
        </Layout>)
}

export default Home;