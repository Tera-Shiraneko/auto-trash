String.prototype.clr = function(hex_color) { return `<font color='#${hex_color}'>${this}</font>`; };

const SettingsUI = require('tera-mod-ui').Settings;

module.exports = function Auto_Trasher(mod) {

    if (mod.proxyAuthor !== 'caali' || !global.TeraProxy) {
        mod.warn('You are trying to use this module on an unsupported legacy version of tera-proxy.');
        mod.warn('The module may not work as expected, and even if it works for now, it may break at any point in the future!');
        mod.warn('It is highly recommended that you download the latest official version from the #toolbox channel in http://tiny.cc/caalis-tera-toolbox');
    }

    mod.game.initialize('inventory');

    let search_interval = null;

    mod.command.add('autotrash', (arg_1, arg_2) => {
        if (!arg_1) {
            mod.settings.enabled = !mod.settings.enabled;
            mod.command.message(`Auto trasher is now ${mod.settings.enabled ? 'enabled'.clr('00ff04') : 'disabled'.clr('ff1d00')}.`);
            stop_searching();
            start_searching();
        }
        else if (arg_1 === 'interval') {
            mod.settings.interval = Number.parseInt(arg_2);
            mod.command.message(`Auto trasher scan interval set to ${mod.settings.interval / 1000} seconds.`);
            stop_searching();
            start_searching();
        }
        else if (arg_1 === 'config') {
            if (ui) {
                ui.show();
            }
        }
    });

    mod.game.on('enter_game', () => {
        start_searching();
    });

    const start_searching = () => {
        if (!mod.settings.enabled) return;
        stop_searching();
        search_interval = mod.setInterval(delete_items, mod.settings.interval);
    };

    const delete_items = () => {
        const trash_list = mod.settings.trash_list.map(Number);
        mod.game.inventory.findAllInBag(trash_list).forEach(item => {
            mod.send('C_DEL_ITEM', 2, {
                gameId: mod.game.me.gameId,
                slot: item.slot,
                amount: item.amount
            });
        });
    };

    const stop_searching = () => {
        if (search_interval) {
            mod.clearInterval(search_interval);
            search_interval = null;
        }
    };

    mod.game.on('leave_game', () => {
        stop_searching();
    });

    const is_searching = () => {
        return !!search_interval;
    };

    let ui = null;

    if (global.TeraProxy.GUIMode) {
        ui = new SettingsUI(mod, require('./settings_structure'), mod.settings, {
            alwaysOnTop: true,
            width: 850,
            height: 165
        });
        ui.on('update', settings => {
            if (typeof mod.settings.trash_list === 'string') {
                mod.settings.trash_list = mod.settings.trash_list.split(/\s*(?:,|$)\s*/);
            }
            if (is_searching()) {
                stop_searching();
                start_searching();
            }
            mod.settings = settings;
        });
        this.destructor = () => {
            if (ui) {
                ui.close();
                ui = null;
            }
        };
    }
};