const axios = require('axios');
const { InvalidSessionToken } = require('../errors');
require('dotenv').config();

class BuffScrape {
    constructor(item_name, session_cookie, option = {game: 'csgo', unix: new Date().getTime()}) {
        this.item_name = item_name;
        this.game = option.game;
        this.total_pages = undefined;
        this.unix = option.unix;
        this.items = [];
        this.baseURL = 'https://buff.163.com/api/market';
        this.session_cookie = session_cookie;
    }

    async fetchAllItems() {
        const instance = axios.create({
            baseURL: this.baseURL,
            headers: {
                Cookie: `session=${this.session_cookie};Locale-Supported=en`
            }
        });

        try {
            console.time(this.item_name);
            console.log(`[${this.item_name}] Starting fetching ${this.item_name}`);
            const response = await instance.get(`/goods?game=${this.game}&page_num=1&page_size=80&category=${this.item_name}&_=${this.unix}`);
            if (response.data.code != 'OK') {
                throw Error("session_cookie")
            }
            const totalPages = response.data.data?.total_page;
            const dataArray = [response];
            if (1 < totalPages) {
                console.log(`[${this.item_name}] Fetching for page: 1 of ${totalPages}`);
                for (let i = 2; i <= totalPages; i++) {
                    console.log(`[${this.item_name}] Fetching for page: ${i} of ${totalPages}`);
                    dataArray.push(await instance.get(`/goods?game=${this.game}&page_num=${i}&page_size=80&category=${this.item_name}&_=${this.unix}`))
                }
            }

            const resolvedPromises = await Promise.all(dataArray);
            for (let i = 0; i < resolvedPromises.length; i++) {
                this.items.push(...resolvedPromises[i].data.data?.items)
            }
            console.timeEnd(this.item_name);
        } catch(err) {
            return Promise.reject(InvalidSessionToken);
        }

    }

    getAllitems() {
        return this.items;
    }

    getUnix() {
        return this.unix;
    }

}

class BuffItem {
    constructor(id, session_cookie, option = { game: 'csgo', page_size: 500, unix: new Date().getTime()}) {
        this.id = id;
        this.game = option.game;
        this.unix = option.unix;
        this.page_size = option.page_size;
        this.listings = [];
        this.baseURL = 'https://buff.163.com/api/market';
        this.session_cookie = session_cookie;
        this.item_info = undefined;
    }

    async fetchAllListings() {
        const instance = axios.create({
            baseURL: this.baseURL,
            headers: {
                Cookie: `session=${this.session_cookie};Locale-Supported=en`
            }
        });
        try {
            console.time(`[${this.id}] Fetching done`);
            console.log(`[${this.id}] Starting fetching listings for ${this.id}`);
            const response = await instance.get(`/goods/sell_order?game=${this.game}&goods_id=${this.id}&page_num=1&page_size=${this.page_size}&sort_by=default&mode=&allow_tradable_cooldown=1&_=${this.unix}`);
            if (response.data.code != 'OK') {
                throw Error("session_cookie")
            }
            const totalPages = response.data.data?.total_page;
            this.item_info = response.data.data.goods_infos[this.id];
            const dataArray = [response];
            if (1 < totalPages) {
                console.log(`[${this.id}] Fetching for page: 1 of ${totalPages}`);
                for (let i = 2; i <= totalPages; i++) {
                    console.log(`[${this.id}] Fetching for page: ${i} of ${totalPages}`);
                    dataArray.push(await instance.get(`/goods/sell_order?game=${this.game}&goods_id=${this.id}&page_num=${i}&page_size=${this.page_size}&sort_by=default&mode=&allow_tradable_cooldown=1&_=${this.unix}`))
                }
            }
    
            const resolvedPromises = await Promise.all(dataArray);
            for (let i = 0; i < resolvedPromises.length; i++) {
                this.listings.push(...resolvedPromises[i].data?.data?.items)
            }
            console.timeEnd(`[${this.id}] Fetching done`);
        } catch(err) {
            return Promise.reject(InvalidSessionToken);
        }
    }

    getItemInfo() {
        return this.item_info;
    }

    getListings() {
        return this.listings;
    }

    getUnix() {
        return this.unix;
    }

}

module.exports = { BuffScrape, BuffItem };