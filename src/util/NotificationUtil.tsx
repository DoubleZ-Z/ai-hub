import {Modal, notification} from 'antd';
import React, {JSX} from 'react';

export class NotificationUtil {
    static show({
                    title,
                    content,
                    okText = "确认",
                    cancelText = "取消",
                    onOk = () => {
                    },
                    onCancel = () => {
                    },
                }: {
        title: string;
        content: string | JSX.Element;
        okText?: string;
        cancelText?: string;
        onOk?: () => void;
        onCancel?: () => void;
    }) {
        Modal.confirm({
            title,
            content: typeof content === 'string' ? <p>{content}</p> : content,
            okText,
            cancelText,
            onOk,
            onCancel,
        });
    }

    static showError(message: string) {
        this.show({
            title: '错误提示',
            content: message,
            okText: "确认",
            cancelText: undefined,
            onOk: () => {
            },
        });
    }

    static showOperationNotify(message: string, handleOk: () => void) {
        this.show({
            title: '操作提示',
            content: message,
            okText: "确认",
            cancelText: undefined,
            onOk: () => {
                handleOk()
            },
        });
    }

    static showDeleteNotify(message: string, handleOk: () => void) {
        this.show({
            title: '删除提示',
            content: message,
            okText: "确认",
            cancelText: undefined,
            onOk: () => {
                handleOk()
            },
        });
    }

    static showNotification({
                                message,
                                description = '',
                                type = 'success',
                                duration = 4,
                            }: {
        message: string;
        description?: string;
        type?: 'success' | 'info' | 'warning' | 'error';
        duration?: number;
    }) {
        notification[type]({
            message,
            description,
            duration,
            placement: 'topRight',
        });
    }

    /**
     * 显示接口问题的通知
     */
    static showApiErr(message: string) {
        this.showNotification({
            message: '服务器请求失败',
            description: message,
            type: 'error',
            duration: 3,
        });
    }

    /**
     * 显示一个发布成功的通知
     */
    static showStatusChangeSuccess() {
        this.showNotification({
            message: '状态修改通知',
            description: '成功',
            type: 'success',
            duration: 3,
        });
    }

    /**
     * 显示一个保存成功的通知
     */
    static showSaveSuccess() {
        this.showNotification({
            message: '保存通知',
            description: '成功',
            type: 'success',
            duration: 3,
        });
    }

    static showSaveErr(message?: string) {
        this.showNotification({
            message: message ? message : '保存失败',
            description: '请联系管理员',
            type: 'error',
            duration: 3,
        });
    }
}