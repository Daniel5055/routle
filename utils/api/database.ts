
// db api interface functions
export async function addMapPlay(map: string) {
    const path = `/api/${map}/play`;
    await fetch(path, {
        method: 'POST',
    });
}

export async function addMapFinished(map: string) {
    const path = `/api/${map}/finish`;
    await fetch(path, {
        method: 'POST',
    });
}

export async function addCityEntered(map: string, cityId: number) {
    const path = `/api/${map}/city`;
    await fetch(path, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: cityId }),
    });
}
