
// db api interface functions
export async function addMapPlay(map: string) {
    const path = `/api/${map}/play`
    await fetch(path);
}

export async function addMapFinished(map: string) {
    const path = `/api/${map}/finish`
    await fetch(path);
}
