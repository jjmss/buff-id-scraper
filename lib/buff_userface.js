const puppeteer = require('puppeteer');
const { findCookie } = require('./util');
// require('dotenv').config();

// (async () => {
//     const browser = await puppeteer.launch({
//         headless: false
//     });
//     const page = await browser.newPage();
//     await page.goto("https://buff.163.com/account/login");

//     await page.waitForSelector("#j_login_other > a");

//     await page.click('#j_login_other > a');
//     console.log("Opening steam login")

//     const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))); 
//     const popup = await newPagePromise;
//     await popup.waitForSelector('input#steamAccountName');

//     console.log("Entering username");
//     await popup.type('#steamAccountName', process.env.steam_username, {delay: 150});
    
//     console.log("Entering password")
//     await popup.type('#steamPassword', process.env.steam_password, {delay: 150});
    
//     if (popup.$('#acceptAllButton')) {
//         await popup.click('#acceptAllButton');
//     }

//     console.log("Submitted login")
//     await popup.click('#login_btn_signin > input');

//     const cookies = await page._client.send('Network.getCookies');
//     // console.log(JSON.stringify(cookies, null, 4));

//     // console.log(cookies);

//     const cookie = findCookie('utid', cookies);
//     console.log(cookie);
    
// })();

class BuffUI {
    constructor (user, options) {
        this.username = user.username;
        this.password = user.password;
        this.headless = options.headless ?? false;
        this.token = undefined;
    }

    async retriveSessionToken() {
        const browser = await puppeteer.launch({
            headless: this.headless
        });
        const page = await browser.newPage();
        await page.goto("https://buff.163.com/account/login");
    
        await page.waitForSelector("#j_login_other > a");
    
        await page.click('#j_login_other > a');
        console.log("Opening steam login")
    
        const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page()))); 
        const popup = await newPagePromise;
        await popup.waitForSelector('input#steamAccountName');
    
        console.log("Entering username");
        await popup.type('#steamAccountName', this.username, {delay: 150});
        
        console.log("Entering password")
        await popup.type('#steamPassword', this.password, {delay: 150});
        
        if (popup.$('#acceptAllButton')) {
            await popup.click('#acceptAllButton');
        }
    
        console.log("Submitted login")
        await popup.click('#login_btn_signin > input');
    
        const cookies = await page._client.send('Network.getCookies');
        const cookie = findCookie('utid', cookies);
        
        this.token = cookie.value;
    }


    getSessionToken() {
        return this.token;
    }

}

module.exports = { BuffUI };