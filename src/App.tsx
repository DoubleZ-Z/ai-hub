import React from 'react';
import './App.css';
import {ConfigProvider} from "antd";
import Home from "./view/Home";

function App() {
    return (
        <ConfigProvider
            theme={{
                components: {
                    Layout: {
                        bodyBg: '#ffffff',
                        siderBg: '#f8fbfc',
                        footerBg: '#ffffff',
                    },
                    Menu:{
                        itemBg: 'transparent',
                    },
                }
            }}>
            <div className='app-master'>
                <Home/>
            </div>
        </ConfigProvider>
    );
}

export default App;
