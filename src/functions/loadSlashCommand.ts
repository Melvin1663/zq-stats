import client from '../../index';

export default async () => {
    let aoi: any[] = [];
    const interactions: Record<string, any> = client.interactions as Record<string, any>;
    for (let type in interactions) {
        switch (type) {
            case 'commands': {
                for (let cmdName in interactions[type]) {
                    const cmd: any = interactions[type][cmdName];
                    const cmdCopy = Object.assign({}, cmd);
                    delete cmdCopy.run;
                    delete cmdCopy.category;
                    aoi.push(cmdCopy);
                }
            };
                break;
            case 'context': {
                for (let ctxType in interactions[type]) {
                    for (let ctxName in interactions[type][ctxType]) {
                        const ctx: any = interactions[type][ctxType][ctxName];
                        aoi.push({
                            name: ctx.name,
                            type: String(ctx.type).toUpperCase()
                        });
                    }
                }
            };
                break;
        }
    }

    const guild = client.guilds.cache.get('1509864373139537951');
    await guild?.commands.set(aoi).then(r => {
        console.log(`${r.size} Interaction(s) loaded`);
    });
}
