const SettingsUI = require('tera-mod-ui').Settings;

module.exports = function Autotrasher(mod) {

    if (mod.proxyAuthor !== 'caali' || !global.TeraProxy) {
        mod.warn('You are trying to use this module on an unsupported legacy version of tera-proxy.');
        mod.warn('The module may not work as expected, and even if it works for now, it may break at any point in the future!');
        mod.warn('It is highly recommended that you download the latest official version from the #proxy channel in http://tiny.cc/caalis-tera-proxy');
    }

    let inven = null;

    mod.command.add('autotrashconfig', () => {
        if (ui) {
            ui.show();
        }
    });

    mod.command.add('autotrash', () => {
        mod.settings.autotrash = !mod.settings.autotrash;
        mod.command.message(`Autotrasher is now ${autotrash ? "enabled" : "disabled"}.`);
    });

    function deleteitem(slot, amount) {
        mod.send('C_DEL_ITEM', 2, {
            gameId: mod.game.me.gameId,
            slot: slot - 40,
            amount
        });
    }

    mod.hook('S_INVEN', 17, (event) => {
        inven = event.first ? event.items : inven.concat(event.items);
        if (!event.more) {
            if (mod.settings.autotrash)
                for (let item of inven)
                    if (item.slot < 40) continue
            else if (mod.settings.trashlist.includes(item.id)) deleteitem(item.slot, item.amount)
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
