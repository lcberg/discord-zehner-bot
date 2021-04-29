import { chromium, ChromiumBrowser } from "playwright";
import { sleep } from './helpers';

export default class OPService {
    private browser: ChromiumBrowser | null = null;
    
    constructor() {
    }
    
    public async setup () {
        this.browser = await chromium.launch({ chromiumSandbox: false });
    }

    public async getUserScores(name: string): Promise<OpWebsiteGameStats> {
        console.log('Calling op.gg');
        if (this.browser) await this.setup();

        const urlUsername = name.replace(/ /g, '+');

        const page = await this.browser!.newPage({ extraHTTPHeaders: { 'Accept-Language': 'de-De' }});
            await page.goto(`https://euw.op.gg/summoner/userName=${name}`);
        await page.click('button:has-text("ZUSTIMMEN")');
        await page.click('#SummonerRefreshButton');
    
        await sleep(3000);
    
        await page.click('.Button.MatchDetail .Off');
    
        await sleep(2000);

        const element = await page.$$('tbody.Content');
        if (!element) throw new Error('Could not find score table');

        const firstRows = await element[0].$$('tr');
        const secondRows = await element[1].$$('tr');

        const rows = [...firstRows, ...secondRows];

        const scores: Array<OpWebsiteScore> = [];

        for (const row of rows) {
            const nameElement = await row.$$('.SummonerName.Cell a');
            const scoreElement = await row.$$('.OPScore.Text');
            const placeElement = await row.$$('.OPScore.Badge');
            
            const nameText = await nameElement[0].textContent();
            const scoreText = await scoreElement[0].textContent();
            let placeText = await placeElement[0].textContent();

            if (!nameText || !scoreText || !placeText) throw new Error ('could not find user elements for row');

            let place = 0;
            placeText = placeText?.replace('th', '');
            placeText = placeText.replace('rd', '');
            placeText = placeText.replace('nd', '');

            if (placeText === 'MVP') place = 1;
            else if (placeText === 'ACE') place = 0;
            else {
                const temp = Number(placeText);
                if (isNaN(temp)) throw new Error(`could not convert place' ${placeText}`);
                place = temp;
            }

            const temp = Number(scoreText);
            if (isNaN(temp)) throw new Error('Could not convert score');

            scores.push(new OpWebsiteScore(nameText, placeText, place, temp));
        }

        const places = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        for (const score of scores) {
            const index = places.findIndex((i) => i === score.place);
            if (index >= 0) {
                places.splice(index, 1);
            }
        }

        scores.find(score => score.place === 0)!.place = places[0];

        const idElements = await page.$$('.GameItem.extended');
        const id = await idElements[0].getAttribute('data-game-id');

        const gameStats = new OpWebsiteGameStats(scores, id!);

        await page.close();

        console.table(scores);

        await this.browser?.close();
        
        console.log('Done getting the element');
        return gameStats;
    }
}

export class OpWebsiteScore {
    constructor(
        public name: string,
        public placeText: string,
        public place: number,
        public score: number
    ) {

    }
}

export class OpWebsiteGameStats {
    constructor (
        public OpScores: Array<OpWebsiteScore> = [],
        public gameId: string
    ) {
    }
}