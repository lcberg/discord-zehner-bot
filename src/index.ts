import playwright, { chromium } from 'playwright';

(async () => {
    console.log('running');

    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://euw.op.gg/summoner/userName=Eiszapfenplays');
    await page.click('button:has-text("ZUSTIMMEN")');
    await page.click('#SummonerRefreshButton');

    await sleep(3000);
    
    await page.click('.Button.MatchDetail .Off');
    
    await sleep(2000);
    const element = await page.$('td:has-text("Eiszapfenplays")');
    const example_parent = (await element?.$('xpath=..'));
    const example_grandparent = (await element?.$('xpath=../..'));
    await example_parent?.screenshot({ path: 'row.png', omitBackground: true });
    await example_grandparent?.screenshot({ path: 'table.png', omitBackground: true });

    console.log('done');
    
    await browser.close();
})();

function sleep (ms: number): Promise<void> {
    console.log(`waiting ${ms} ms`);
    return new Promise((resolve, reject) => {
        setTimeout(() => { 
            console.log('done');
            resolve();
        }, ms); 
    });
}

