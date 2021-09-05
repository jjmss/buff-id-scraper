const fs = require('fs');
const { BuffScrape, BuffItem } = require('./lib/buff_id_scraper');
const CSGOItems = require('./lib/csgo_game_data');
const { ensureSlug, createFile } = require('./lib/util');

if (!fs.existsSync('./data')){
    fs.mkdirSync('./data');
}

const retriveBuffID = async (item_name) => {
    const scraper = new BuffScrape(item_name);
    await scraper.fetchAllItems();

    const items = scraper.getAllitems();

    const formattedItems = new Object;
    console.log(`[${item_name}] Formatting and saving`);
    items.forEach(item => {
        formattedItems[ensureSlug( item.name)] = {
            'buff_id': item.id,
            'buff_price_cny': item.sell_reference_price,
            'steam_price_cny': item.goods_info.steam_price_cny,
            'quantity': item.sell_num,
            'type': item.goods_info?.info?.tags?.type?.internal_name
        }
    });

    createFile({
        path: './data/id',
        filename: item_name,
        type: 'json'
    }, JSON.stringify({
        data: formattedItems,
        timestamp: scraper.getUnix()
    }));

}

const initItems = async () => {
    const csgo = new CSGOItems('en');
    console.time('Retrive Weapons');
    await csgo.retriveData();
    console.timeEnd('Retrive Weapons');

    const weapons = csgo.getPaintableWeapons();
    console.time('Retrive data');
    for (const weapon of weapons) {
        await retriveBuffID(weapon.name);
    }
    console.log("Complete!");
    console.timeEnd('Retrive data');
}

// initItems();

const combineItems = () => {
    fs.readdir('./data/id', {}, (err, files) => {
        for (const file of files) {
            fs.readFile(`./data/id/${file}`, {}, (err, _data) => {
                const content = JSON.parse(_data);
                console.log(content.data);
            })
        }
    }) 
}

// combineItems();

const scrapeItemPrices = async (id) => {
    const item = new BuffItem(id);
    await item.fetchAllListings();
    const itemInfo = item.getItemInfo();
    const listings = item.getListings();

    const formattedListings = new Array;
    listings.forEach(listing => {
        const _listing = {
            buff_id: listing.goods_id,
            id: listing.id,
            price_cny: listing.price,
            float: listing.asset_info?.paintwear,
            fade: parseFloat(listing.asset_info.info?.phase_data?.name),
            phase: parseFloat(listing.asset_info.info?.phase_data?.name),
            stickers: listing.asset_info.info.stickers,
            lowest_bargain_price_cny: listing.lowest_bargain_price,
            created_at: listing.created_at,
            updated_at: listing.created_at != listing.updated_at ? listing.updated_at : false,
        }

        if (itemInfo.tags.type.internal_name === ('csgo_type_knife' || 'type_hands' || 'csgo_tool_sticker' || 'type_customplayer')) {
            delete _listing.stickers;
        }

        switch(itemInfo.tags.series?.internal_name) {
            case 'fade':
                delete _listing.phase;
                break;
            case 'doppler':
                delete _listing.fade;
                break;
            default:
                delete _listing.phase;
                delete _listing.fade;
                break;
        }
        formattedListings.push(_listing);
    })

    createFile({
        path: './data/price',
        filename: ensureSlug(item.getItemInfo().name),
        type: 'json'
    }, JSON.stringify({
        data: formattedListings,
        timestamp: item.getUnix()
    }));
    
}

scrapeItemPrices(42579);
scrapeItemPrices(759246);