const puppeteer = require('puppeteer');
const { findCookie } = require('./util');
class BuffUI {
    constructor (user, options) {
        this.username = user.username;
        this.password = user.password;
        this.options = options
        this.token = null;
    }

    async retriveSessionToken() {
        console.log("Launching browser");
        const browser = await puppeteer.launch(this.options);
        const page = await browser.newPage();
        await page.goto("https://buff.163.com/account/login");
    
        console.log("Waiting for login form to load..");
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

        console.log("Waiting for login to success!")
        await page.waitForSelector("#j_popup_guide");
    
        const cookies = await page._client.send('Network.getCookies');
        const cookie = findCookie('session', cookies);
        
        this.token = cookie.value;

        browser.close();
    }


    async getSessionToken() {
        if (this.token !== null) {
            return this.token;
        }
        await this.retriveSessionToken();
        return this.token;
    }

}

module.exports = { BuffUI };