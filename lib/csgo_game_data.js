const axios = require('axios');
require('dotenv').config();

class CSGOItems {
    constructor(lang) {
        this.lang = lang || 'en';
        this.loaded = false;
        this.items = [];
    }

    async retriveData() {
        try {
            const response = await axios.get(`https://api.steampowered.com/IEconItems_730/GetSchema/v2/?key=${process.env.steam_api_key}&language=${this.lang}`)
            this.items = response.data.result.items;
            this.loaded = true;
        } catch (err) {
            console.log(err);
        }
    }

    getItems() {
        if (!this.loaded || !this.items) {
            return
        }

        return this.items;
    }

    getPaintableWeapons() {
        const paintableWeapons = [];
        this.items.forEach(item => {
            if (!item?.capabilities?.paintable || item.craft_class != 'weapon') {
                return
            }
            paintableWeapons.push(item);
        });

        return paintableWeapons;
    }


}

module.exports = CSGOItems;