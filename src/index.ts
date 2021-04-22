import playwright, { chromium } from 'playwright';
import Discord, { TextChannel } from 'discord.js';
import dotenv from 'dotenv';

const send = true;
dotenv.config();

const client = new Discord.Client();

client.on('ready', () => {
    console.log('client ready');
})

client.on('message', async message => {
    if (message.channel.id === process.env.CHANNEL_ID && message.content.startsWith('!zehner')) {
        console.log(`${message.author.username} has requested a zehner screenshot: ${message.content}`);
        
        if (send) message.reply('Moment ich schaue nach...');

        const name = message.content.replace('!zehner', '').trim();

        if (name) {
            const elem = await getTableElement(name);
            if (!elem) return;
            await elem.screenshot({ path: 'row.png', omitBackground: true });

            const score = await getScore(elem);
            const zehner = await isZehner(elem);

            if (send && !zehner) {
                console.log('Wasnt zehner... sending trump');

                message.reply('Nee Atze...', {
                    files: [
                        './wrong.jpg'
                    ]
                });
            } else if (send) {
                console.log('was zehner... sending score');
                message.reply('Ergebnis:', {
                    files: [
                        "./row.png"
                    ]
                });
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);


function sleep (ms: number): Promise<void> {
    console.log(`waiting ${ms} ms`);
    return new Promise((resolve, reject) => {
        setTimeout(() => { 
            console.log('done');
            resolve();
        }, ms); 
    });
}

async function getTableElement(name: string): Promise<playwright.ElementHandle<HTMLElement | SVGElement> | null> {
    try {
        console.log('Fetching element...');
    
        const browser = await chromium.launch({ chromiumSandbox: false });
        const page = await browser.newPage({ extraHTTPHeaders: { 'Accept-Language': 'de-De' }});
        await page.goto(`https://euw.op.gg/summoner/userName=${name}`);
        await page.click('button:has-text("ZUSTIMMEN")');
        await page.click('#SummonerRefreshButton');
    
        await sleep(3000);
    
        await page.click('.Button.MatchDetail .Off');
    
        await sleep(2000);

        const element = await page.$(`td:has-text("${name}")`);
        const example_parent = (await element?.$('xpath=..'));
        
        console.log('Done getting the element');

        await browser.close();
    
        return example_parent!;
    } catch(error) {
        console.log(error);
        return null;
    }
}

async function getScore(elem: playwright.ElementHandle<HTMLElement | SVGElement>): Promise<string> {
    const scoreElem = await (elem.$$('.OPScore.Text'));
    if (scoreElem.length > 0) {
        const score = (await scoreElem[0].textContent())!;
        return score;
    }
    return '0'
}

async function isZehner(elem: playwright.ElementHandle<HTMLElement | SVGElement>): Promise<boolean> {
    const placeElem = await (elem.$$('.OPScore.Badge'));
    if (placeElem.length > 0) {
        const place = (await placeElem[0].textContent()!);
        if (place === '10th') return true;
        return false;
    }
    return false;
}