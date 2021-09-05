const axios = require('axios');
require('dotenv').config();

class BuffScrape {
    constructor(item_name, game, unix) {
        this.item_name = item_name;
        this.game = game || 'csgo';
        this.total_pages = undefined;
        this.unix = unix || new Date().getTime();
        this.items = [];
        this.baseURL = 'https://buff.163.com/api/market';
    }

    async fetchAllItems() {
        const instance = axios.create({
            baseURL: this.baseURL,
            headers: {
                Cookie: `session=${process.env.session_cookie};`
            }
        });

        try {
            console.log(`[${this.item_name}] Starting fetching ${this.game} item`);
            const response = await instance.get(`/goods?game=${this.game}&page_num=1&page_size=80&category=${this.item_name}&_=${this.unix}`);
            if (response.data.code != 'OK') {
                throw Error('Invalid cookie');
            }
            const totalPages = response.data.data?.total_page;
            const dataArray = [response];
            if (1 < totalPages) {
                for (let i = 1; i < totalPages + 1; i++) {
                    console.log(`[${this.item_name}] Fetching for page: ${i} of ${totalPages}`);
                    dataArray.push(await instance.get(`/goods?game=${this.game}&page_num=${i}&page_size=80&category=${this.item_name}&_=${this.unix}`))
                }
            }

            const resolvedPromises = await Promise.all(dataArray);
            for (let i = 0; i < resolvedPromises.length; i++) {
                this.items.push(...resolvedPromises[i].data.data?.items)
            }
        } catch(err) {
            console.log(err);
        }

    }

    getAllitems() {
        return this.items;
    }

    getUnix() {
        return this.unix;
    }

    fetchAllItemListings()

}

module.exports = BuffScrape;