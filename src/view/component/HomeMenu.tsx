import React, {useEffect, useState} from "react";
import {apiMenuDelete, apiMenuList} from "../../api/menuApi";
import './HomeMenu.less'
import {ConfigProvider, Menu, MenuProps, theme} from "antd";
import {CloseOutlined, MenuFoldOutlined, MenuUnfoldOutlined, WechatWorkOutlined} from "@ant-design/icons";
import {MenuInfo} from "../../dto/menu.define";
import {NotificationUtil} from "../../util/NotificationUtil";


interface Prop {
    sessionId: string;
    onTitleSelect: (sessionId: string) => void,
    onCollapsedChange: (collapsed: boolean) => void,
}

interface MenuItem {
    key: string;
    label: React.ReactNode;
    icon?: React.ReactNode;
}

const HomeMenu: React.FC<Prop> = ({sessionId, onTitleSelect, onCollapsedChange}) => {
    const [selectKey, setSelectKey] = useState<string[]>([])
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [collapsed, setCollapsed] = useState(false);

    const convertMenuItems = (infos: MenuInfo[]) => {
        let newMenu: MenuItem[] = []
        if (infos) {
            newMenu = infos.map((item): MenuItem => (
                {
                    key: item.sessionId,
                    label: item.title,
                }
            ));
        }
        const item: MenuItem = {
            key: 'new',
            label: '开启新对话',
            icon: <WechatWorkOutlined/>,
        }
        newMenu.unshift(item)
        setMenuItems(newMenu)
    }
    const menuRequest = () => {
        apiMenuList().then(res => {
            convertMenuItems(res);
        }).catch(err => console.error(err));
    }

    useEffect(() => {
        let length = menuItems.filter(item => item.key === sessionId).length;
        if (length === 0){
            apiMenuList().then(res => {
                convertMenuItems(res);
                setSelectKey([sessionId])
            }).catch(err => console.error(err));
        }else {
            setSelectKey([sessionId])
        }
    }, [sessionId]);

    useEffect(() => {
        menuRequest()
    }, []);

    const onClick = (key: string) => {
        onTitleSelect(key)
        setSelectKey([key])
    };

    const handleDelete = (key: string, e: React.MouseEvent) => {
        e.stopPropagation();
        NotificationUtil.showDeleteNotify('删除后将无法恢复', () => {
            apiMenuDelete(key).then(res => {
                convertMenuItems(res);
                onClick("new")
            }).catch(err => console.error(err));
        })
    };

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
        onCollapsedChange(!collapsed)
    };

    const processedItems = (): MenuProps['items'] => {
        let items = menuItems;
        if (collapsed) {
            items = menuItems.filter(item => item.key === 'new');
        }
        return items.map(item => ({
            ...item,
            label: item.key === 'new' ? item.label : (
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span>{item.label}</span>
                    <CloseOutlined
                        style={{
                            fontSize: 12,
                            color: '#999',
                            marginLeft: 8,
                            cursor: 'pointer',
                            transition: 'color 0.3s'
                        }}
                        className="delete-icon"
                        onClick={(e) => handleDelete(item.key, e)}
                    />
                </div>
            ),
        }))
    };

    return (
        <div className="menu-master">
            <div className={`toggle`} onClick={toggleCollapsed}>
                {collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
            </div>
            <Menu
                selectedKeys={selectKey}
                onClick={e => onClick(e.key)}
                mode="inline"
                inlineCollapsed={collapsed}
                items={processedItems()}
            />
        </div>
    )
}

export default HomeMenu;