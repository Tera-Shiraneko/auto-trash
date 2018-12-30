const SettingsUI = require('tera-mod-ui').Settings;

module.exports = function Autotrasher(mod) {

    if (mod.proxyAuthor !== 'caali' || !global.TeraProxy)
        mod.warn('You are trying to use this module on an unsupported version of tera-proxy. It may not work as expected, and even if it does now it may break at any point in the future.');	
	
    let inven = null,
        gameId = -1n,
        playerId = -1,
        myLocation = null;

    mod.command.add('autotrash', () => {
        if (ui) {
            ui.show();
        } else {
            mod.settings.autotrash = !mod.settings.autotrash;
            mod.command.message(`Autotrasher is now ${autotrash ? "enabled" : "disabled"}.`);
        }
    });

    mod.hook('S_LOGIN', 12, event => { ({gameId} = event) });
	
    mod.hook('S_SPAWN_ME', 3, event => { myLocation = event });
	
    mod.hook('C_PLAYER_LOCATION', 5, event => { myLocation = event });

    function deleteitem(slot, amount) {
        mod.send('C_DEL_ITEM', 2, {
            gameId,
            slot: slot - 40,
            amount
        });
    }

    mod.hook('S_INVEN', 16, event => {inven = event.first ? event.items : inven.concat(event.items);

        if(!event.more) {
            if(mod.settings.autotrash)
                for(let item of inven)
                    if(item.slot < 40) continue
                    else if(mod.settings.trashlist.includes(item.id)) deleteitem(item.slot, item.amount)

            inven = null
        }
    });

    let ui = null;
    if (global.TeraProxy.GUIMode) {
        ui = new SettingsUI(mod, require('./settings_structure'), mod.settings, { height: 155 }, { alwaysOnTop: true });
        ui.on('update', settings => { mod.settings = settings; });

        this.destructor = () => {
            if (ui) {
                ui.close();
                ui = null;
            }
        };
    }
};
