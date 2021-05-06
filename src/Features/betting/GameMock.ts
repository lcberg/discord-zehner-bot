import { OpWebsiteGameStats, OpWebsiteScore } from "../../OPService";

export function createTestGame(): OpWebsiteGameStats {
    const opScores: Array<OpWebsiteScore> = [
        {
            name: 'der echte nini',
            place: 10,
            placeText: '10th',
            score: 2
        },
        {
            name: 'Zurücklehner',
            place: 9,
            placeText: '9th',
            score: 3.1
        },
        {
            name: 'LG Der Bamboost',
            place: 8,
            placeText: '8th',
            score: 3.5
        },
        {
            name: 'Mobitax00',
            place: 7,
            placeText: '7th',
            score: 4.2
        },
        {
            name: 'Scheißzapfenplays',
            place: 6,
            placeText: '6th',
            score: 5
        }, 
        {
            name: 'n4rr',
            place: 5,
            placeText: 'ACE',
            score: 6.9
        },
        {
            name: 'KDA Robin',
            place: 4,
            placeText: '4th',
            score: 7.2
        },
        {
            name: 'Raggitroll',
            place: 3,
            placeText: '3rd',
            score: 7.8
        },
        {
            name: 'dumbledocus (booster)',
            place: 2,
            placeText: '2nd',
            score: 8.1
        },
        {
            name: 'LLouis',
            place: 1,
            placeText: 'MVP',
            score: 10
        }
    ];

    return new OpWebsiteGameStats(opScores, '12345678');
}