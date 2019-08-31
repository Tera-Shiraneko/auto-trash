String.prototype.clr = function(hex_color) { return `<font color='#${hex_color}'>${this}</font>`; };

const SettingsUI = require('tera-mod-ui').Settings;

module.exports = function Auto_Trash(mod) {

    mod.game.initialize('inventory');

    let search_interval = null;

    mod.command.add('autotrash', (arg_1, arg_2) => {
        if (!arg_1) {
            mod.settings.enabled = !mod.settings.enabled;
            mod.command.message(`${mod.settings.enabled ? '[Settings] The module is now enabled.'.clr('00ff04') : '[Settings] The module is now disabled.'.clr('ff1d00')}`);
            check_interval();
        }
        else if (arg_1 === 'interval') {
            if (arg_2 >= 5000 && arg_2 <= 60000) {
                mod.settings.interval = Number.parseInt(arg_2);
                mod.command.message(`[Settings] Scan interval set to | ${mod.settings.interval / 1000} | seconds.`.clr('009dff'));
                check_interval();
            } else {
                mod.command.message('[Error] Scan interval must be set between | 5000 | and | 60000 | milliseconds.'.clr('ff1d00'));
            }
        }
        else if (arg_1 === 'add' && arg_2) {
            const item_info = mod.game.data.items.get(get_item_id_per_chat_link(arg_2));
            const item_index = mod.settings.trash_list.indexOf(item_info.id);
            if (item_info && item_index === -1) {
                mod.settings.trash_list.push(item_info.id);
                mod.command.message(`[Settings] Item | ${item_info.name} | with the item id | ${item_info.id} | added to the trash list.`.clr('009dff'));
                check_interval();
            }
            else if (!item_info) {
                mod.command.message('[Error] The module can not find any item data which is needed for adding the id to the trash list.'.clr('ff1d00'));
            }
            else if (item_index != -1) {
                mod.command.message(`[Error] Item | ${item_info.name} | with the item id | ${item_info.id} | is already added to the trash list.`.clr('ff1d00'));
            }
        }
        else if (arg_1 === 'remove' && arg_2) {
            const item_info = mod.game.data.items.get(get_item_id_per_chat_link(arg_2));
            const item_index = mod.settings.trash_list.indexOf(item_info.id);
            if (item_info && item_index != -1) {
                mod.settings.trash_list.splice(item_index, 1);
                mod.command.message(`[Settings] Item | ${item_info.name} | with the item id | ${item_info.id} | removed from the trash list.`.clr('009dff'));
                check_interval();
            }
            else if (!item_info) {
                mod.command.message('[Error] The module can not find any item data which is needed for adding the id to the trash list.'.clr('ff1d00'));
            }
            else if (item_index === -1) {
                mod.command.message(`[Error] Item | ${item_info.name} | with the item id | ${item_info.id} | can not be found in the trash list.`.clr('ff1d00'));
            }
        }
        else if (arg_1 === 'clear') {
            if (mod.settings.trash_list.length != 0) {
                mod.settings.trash_list = [];
                mod.command.message('[Settings] Trash list is now cleared and can be reconfigured again to your liking.'.clr('009dff'));
                check_interval();
            } else {
                mod.command.message('[Error] Add an item to the trash list before trying to clear an empty trash list.'.clr('ff1d00'));
            }
        }
        else if (arg_1 === 'show') {
            if (mod.settings.trash_list.length != 0) {
                mod.settings.trash_list.forEach(item => {
                    mod.command.message(`[Info] Found item | ${mod.game.data.items.get(item).name} | with the item id | ${mod.game.data.items.get(item).id} | in the trash list.`.clr('ffff00'));
                });
            } else {
                mod.command.message('[Error] Add an item to the trash list before trying to show an empty trash list.'.clr('ff1d00'));
            }
        }
        else if (arg_1 === 'config') {
            if (ui) {
                ui.show();
            }
        }
    });

    mod.game.on('enter_game', () => {
        check_config_file();
        start_searching();
    });

    const start_searching = () => {
        if (!mod.settings.enabled) return;
        stop_searching();
        search_interval = mod.setInterval(delete_items, mod.settings.interval);
    };

    const delete_items = () => {
        mod.game.inventory.findAllInBagOrPockets(mod.settings.trash_list).forEach(item => {
            mod.send('C_DEL_ITEM', 3, {
                gameId: mod.game.me.gameId,
                pocket: item.pocket,
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

    const check_interval = () => {
        if (mod.settings.enabled) {
            stop_searching();
            start_searching();
        } else {
            stop_searching();
        }
    };

    const get_item_id_per_chat_link = (chat_link) => {
        const expression = /#(\d*)@/;
        const item_id = chat_link.match(expression);
        if (item_id) {
            return Number.parseInt(item_id[1]);
        }
    };

    const check_config_file = () => {
        if (mod.settings.interval < 5000 || mod.settings.interval > 60000) {
            mod.settings.interval = 5000;
            mod.error('Invalid interval settings detected default settings will be applied.');
        }
        if (!Array.isArray(mod.settings.trash_list)) {
            mod.settings.trash_list = [];
            mod.error('Invalid trash list settings detected default settings will be applied.');
        }
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
                mod.settings.trash_list = mod.settings.trash_list.split(/\s*(?:,|$)\s*/).map(Number);
            }
            mod.settings = settings;
            check_interval();
        });
        this.destructor = () => {
            if (ui) {
                ui.close();
                ui = null;
            }
        };
    }
};