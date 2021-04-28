export function sleep (ms: number): Promise<void> {
    console.log(`waiting ${ms} ms`);
    return new Promise((resolve, reject) => {
        setTimeout(() => { 
            console.log('done');
            resolve();
        }, ms); 
    });
}