const fs = require('fs');
const { BuffScrape, BuffItem } = require('./lib/buff_id_scraper');
const { BuffUI } = require('./lib/buff_userface');
const CSGOItems = require('./lib/csgo_game_data');
const { ensureSlug, createFile } = require('./lib/util');
require('dotenv').config();

if (!fs.existsSync('./data')){
    fs.mkdirSync('./data');
}

const BuffUser = new BuffUI({
    username: process.env.steam_username,
    password: process.env.steam_password
}, {headless: true});

const getToken = async () => {
    return await BuffUser.getSessionToken();
}

const retriveBuffID = async (item_name, session_cookie) => {
    const scraper = new BuffScrape(item_name, session_cookie);
    await scraper.fetchAllItems();

    const items = scraper.getAllitems();

    const formattedItems = new Object;
    console.log(`[${item_name}] Formatting and saving`);
    items.forEach(item => {
        formattedItems[ensureSlug(item.name)] = {
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

/**
 * 
 * @param {string} token The session token so the scraper can get access to the endpoints
 * @description Gets all the csgo items, and retrives all the buff id's for each weapon
 */
const initItems = async (token) => {
    const csgo = new CSGOItems('en');
    console.time('Retrive Weapons');
    await csgo.retriveData();
    console.timeEnd('Retrive Weapons');

    const weapons = csgo.getPaintableWeapons();
    console.time('Retrive data');
    try {
        for (const weapon of weapons) {
            await retriveBuffID(weapon.name, token);
        }
    } catch(err) {
        if (err.code = 1) {
            console.log(err.message);
            console.log("Getting new session token");
            const _token = await getToken();
            console.log("Trying again...")
            initItems(_token)
        }
        console.log(err)
    }
    console.log("Complete!");
    console.timeEnd('Retrive data');
}

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


/**
 * 
 * @param { Number } id The Buff id of the item
 * @param { String } session_cookie The session cookie in order to get access to the endpoint
 */
const scrapeItemPrices = async (id, session_cookie) => {
    const item = new BuffItem(id, session_cookie);
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

let token = null

(async () => {

    //session cookie in order to get access to all the data
    if (token === null) {
        token = await getToken()
    }


    // await retriveBuffID("weapon_ak47", token);

    // Retrives all items from csgo and getts all the buff id's for all the skins
    await initItems(token);
    // await scrapeItemPrices(42579, token);
    // await scrapeItemPrices(759246, token);


})()
