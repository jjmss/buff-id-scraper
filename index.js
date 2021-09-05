const fs = require('fs');
const BuffScrape = require('./lib/buff_id_scraper');
const CSGOItems = require('./lib/csgo_game_data');
const { ensureSlug } = require('./lib/util');

const retriveBuffID = async (item_name) => {
    const scraper = new BuffScrape(item_name);
    await scraper.fetchAllItems();

    const items = scraper.getAllitems();

    const formattedItems = new Object;
    console.log(`[${item_name}] Formatting to json`);
    items.forEach(item => {
        formattedItems[ensureSlug( item.name)] = {
            'buff_id': item.id,
            'buff_price_cny': item.sell_reference_price,
            'steam_price_cny': item.goods_info.steam_price_cny,
            'quantity': item.sell_num,
            'type': item.goods_info?.info?.tags?.type?.internal_name
        }
    });

    
    if (!fs.existsSync('./log')){
        fs.mkdirSync('./log');
    }
    console.log(`[${item_name}] Saving as JSON`);
    fs.writeFile(`./log/${item_name}.json`, JSON.stringify({
        data: formattedItems,
        timestamp: scraper.getUnix()
    }), (err) => {
        if (err) {
            console.error(`Error writing file for ${item_name}`);
            throw err;
        }
    })
}

const initItems = async () => {
    const csgo = new CSGOItems('en');
    await csgo.retriveData();

    const weapons = csgo.getPaintableWeapons();
    for (const weapon of weapons) {
        await retriveBuffID(weapon.name);
    }
    console.log("Complete!");
}

// initItems();

const combineItems = () => {
    fs.readdir('./log', {}, (err, files) => {
        for (const file of files) {
            fs.readFile(`./log/${file}`, {}, (err, _data) => {
                const content = JSON.parse(_data);
                console.log(content.data);
            })
        }
    }) 
}

combineItems();