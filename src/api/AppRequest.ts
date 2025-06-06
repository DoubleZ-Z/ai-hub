import axios, {Axios, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig} from "axios";
import {message} from 'antd';
import {NotificationUtil} from "../util/NotificationUtil";

const CONTENT_TYPE = 'content-type';
export const createAppAxios = (): Axios => {
    const appAxios = axios.create({})
    appAxios.interceptors.request.use(config => {
        config.headers[CONTENT_TYPE] = "application/json;charset=utf-8";
        return config;
    }, Promise.reject)
    appAxios.interceptors.response.use(async config => {
        const {data, status} = config;
        if (status === 200) {
            const {code, msg} = data;
            if (code === 200) {
                const res = data.data;
                if (!res) {
                    const res: any = {}
                    res._source = config;
                    return res
                } else {
                    res._source = config;
                    return data.data;
                }
            } else {
                console.error(`API_ERROR[${msg}]:`, config);
                throw config;
            }
        } else {
            console.error('HTTP_ERROR:', config);
            throw config;
        }
    }, error => Promise.reject(error))
    return appAxios;
}

export interface VisibleAxiosRequestConfig extends AxiosRequestConfig {
    requestId?: number;
    loadingMsg?: () => void,
    msgKey: number,
    showLoading: boolean,
    showSuccess?: boolean
    errorMsg?: string,
}

interface AppAxiosResponse extends AxiosResponse {
    _source?: { config: AxiosRequestConfig };
}

export const createVisibleAxios = (): Axios => {
    const visibleAxios: Axios = createAppAxios();
    const axiosContext = {
        nextMsgKey: 1,
    };
    visibleAxios.interceptors.request.use((config) => {
        const msgKey = axiosContext.nextMsgKey++;
        const visibleConfig = config as VisibleAxiosRequestConfig;
        if (visibleConfig.showLoading) {
            visibleConfig.loadingMsg = message.loading({
                content: `Loading...`,
                duration: 0,
                key: msgKey,
            });
        }
        visibleConfig.msgKey = msgKey;
        visibleConfig.requestId = msgKey;

        return visibleConfig as InternalAxiosRequestConfig;
    }, err => {
        if (err.config.msgKey) {
            message.error({content: `${err.config.url}:Request Error`, key: err.config.msgKey})
        }
        return Promise.reject(err);
    })
    visibleAxios.interceptors.response.use(resp => {
        const appResponse = resp as AppAxiosResponse;
        console.log(appResponse)
        closeLoading(appResponse._source?.config as VisibleAxiosRequestConfig, true)
        return resp
    }, async err => {
        closeLoading(err.config as VisibleAxiosRequestConfig, false)
        NotificationUtil.showApiErr(err.data.msg);
        return Promise.reject(err);
    });
    return visibleAxios;
}

const closeLoading = (requestConfig: VisibleAxiosRequestConfig, success: boolean) => {
    if (requestConfig.loadingMsg) {
        requestConfig.loadingMsg();
    }
    if (requestConfig.errorMsg && !success) {
        message.error(requestConfig.errorMsg).then(r => {
        });
    }
    if (requestConfig.showSuccess && success) {
        message.success('成功').then(r => {
        })
    }
}

export const visibleAxios = createVisibleAxios();
