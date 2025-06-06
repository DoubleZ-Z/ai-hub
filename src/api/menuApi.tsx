import {visibleAxios as axios} from "./AppRequest";
import {MenuInfo} from "../dto/menu.define";

export const apiMenuList = async () => {
    return (await axios.request({
        url: `/api/menu`,
        method: 'get',
    })) as MenuInfo[];
}

export const apiMenuDelete = async (id: string) => {
    return (await axios.request({
        url: `/api/menu/${id}`,
        method: 'delete',
    })) as MenuInfo[];
}