const fs = require('fs');
const BuffScrape = require('./lib/buff_id_scraper');
const { ensureSlug } = require('./lib/util');

const init = async (item_name) => {
    const scraper = new BuffScrape(item_name);
    await scraper.fetchAllItems();

    const items = scraper.getAllitems();

    const formattedItems = new Object;
    console.log(`[${item_name}] Formatting to json`);
    items.forEach(item => {
        formattedItems[ensureSlug( item.name)] = {
            'buff_id': item.id,
            'buff_price_cny': item.sell_reference_price,
            'steam_price_cny': item.goods_info.steam_price_cny
        }
    });

    console.log(`[${item_name}] Writing file`);

    if (!fs.existsSync('./log')){
        fs.mkdirSync('./log');
    }
    fs.writeFile(`./log/${item_name}.json`, JSON.stringify({
        data: formattedItems,
        timestamp: scraper.getUnix()
    }), (err) => {
        if (err) {
            console.error(`Error writing file for ${item_name}`);
            throw err;
        }

        console.log(`[${item_name}] saved as JSON`);

    })
}

init('weapon_knife_m9_bayonet');