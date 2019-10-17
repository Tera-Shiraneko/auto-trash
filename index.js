String.prototype.clr = function(hex_color) { return `<font color='#${hex_color}'>${this}</font>`; };

const SettingsUI = require('tera-mod-ui').Settings;

module.exports = function Auto_Trash(mod) {

    let command = mod.command;
    let config = mod.settings;
    let data = mod.game.data;
    let player = mod.game.me;

    mod.game.initialize('inventory');

    let search_timer = null;

    command.add('autotrash', (arg_1, arg_2) => {
        if (!arg_1) {
            config.enabled = !config.enabled;
            command.message(`${config.enabled ? '[Settings] The module is now enabled.'.clr('00ff04') : '[Settings] The module is now disabled.'.clr('ff1d00')}`);
            search_status();
        }
        else if (arg_1 === 'interval') {
            if (arg_2 >= 5000 && arg_2 <= 60000) {
                config.interval = Number.parseInt(arg_2);
                command.message(`[Settings] Scan interval set to | ${config.interval / 1000} | seconds.`.clr('009dff'));
                search_status();
            } else {
                command.message('[Warning] Scan interval must be set between | 5000 | and | 60000 | milliseconds.'.clr('ff00ff'));
            }
        }
        else if (arg_1 === 'add' && arg_2) {
            const item_info = data.items.get(get_item_id_per_chat_link(arg_2));
            const item_index = config.trash_list.indexOf(item_info.id);
            if (item_info && item_index === -1) {
                config.trash_list.push(item_info.id);
                command.message(`[Settings] Item | ${item_info.name} | with the id | ${item_info.id} | has been added to the trash list.`.clr('009dff'));
                search_status();
            }
            else if (!item_info) {
                command.message('[Warning] The module can not find any item data which is needed for adding the id to the trash list.'.clr('ff00ff'));
            }
            else if (item_index != -1) {
                command.message(`[Warning] Item | ${item_info.name} | with the id | ${item_info.id} | is already added to the trash list.`.clr('ff00ff'));
            }
        }
        else if (arg_1 === 'remove' && arg_2) {
            const item_info = data.items.get(get_item_id_per_chat_link(arg_2));
            const item_index = config.trash_list.indexOf(item_info.id);
            if (item_info && item_index != -1) {
                config.trash_list.splice(item_index, 1);
                command.message(`[Settings] Item | ${item_info.name} | with the id | ${item_info.id} | has been removed from the trash list.`.clr('009dff'));
                search_status();
            }
            else if (!item_info) {
                command.message('[Warning] The module can not find any item data which is needed for removing the id from the trash list.'.clr('ff00ff'));
            }
            else if (item_index === -1) {
                command.message(`[Warning] Item | ${item_info.name} | with the id | ${item_info.id} | can not be found in the trash list.`.clr('ff00ff'));
            }
        }
        else if (arg_1 === 'clear') {
            if (config.trash_list.length) {
                config.trash_list = [];
                command.message('[Settings] The trash list is now cleared and can be reconfigured again to your liking.'.clr('009dff'));
                search_status();
            } else {
                command.message('[Warning] Add an item to the trash list before trying to clear an empty trash list.'.clr('ff00ff'));
            }
        }
        else if (arg_1 === 'show') {
            if (config.trash_list.length) {
                config.trash_list.forEach(item => {
                    const item_info = data.items.get(item);
                    if (item_info) {
                        command.message(`[Info] Found item | ${item_info.name} | with the id | ${item_info.id} | in the trash list.`.clr('ffff00'));
                    } else {
                        command.message('[Warning] The module can not find any item data which is needed for showing the name and id of the item.'.clr('ff00ff'));
                    }
                });
            } else {
                command.message('[Warning] Add an item to the trash list before trying to show an empty trash list.'.clr('ff00ff'));
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

    mod.game.on('leave_game', () => {
        stop_searching();
    });

    function start_searching() {
        if (config.enabled && config.trash_list.length) {
            stop_searching();
            search_timer = mod.setInterval(delete_items, config.interval);
        }
    }

    function stop_searching() {
        if (search_timer) {
            mod.clearInterval(search_timer);
            search_timer = null;
        }
    }

    function search_status() {
        if (config.enabled && config.trash_list.length) {
            stop_searching();
            start_searching();
        } else {
            stop_searching();
        }
    }

    function delete_items() {
        mod.game.inventory.findAllInBagOrPockets(config.trash_list).forEach(item => {
            mod.send('C_DEL_ITEM', 3, {
                gameId: player.gameId,
                pocket: item.pocket,
                slot: item.slot,
                amount: item.amount
            });
        });
    }

    function get_item_id_per_chat_link(chat_link) {
        const expression = /#(\d*)@/;
        const item_id = chat_link.match(expression);
        if (item_id) {
            return Number.parseInt(item_id[1]);
        }
    }

    function check_config_file() {
        if (config.interval < 5000 || config.interval > 60000) {
            config.interval = 5000;
            mod.error('Invalid interval settings detected default settings will be applied.');
        }
        if (!Array.isArray(config.trash_list)) {
            config.trash_list = [];
            mod.error('Invalid trash list settings detected default settings will be applied.');
        }
    }

    let ui = null;

    if (global.TeraProxy.GUIMode) {
        ui = new SettingsUI(mod, require('./settings_structure'), config, {
            alwaysOnTop: true,
            width: 1000,
            height: 165
        });
        ui.on('update', settings => {
            if (typeof config.trash_list === 'string') {
                config.trash_list = config.trash_list.split(/\s*(?:,|$)\s*/).map(Number);
            }
            config = settings;
            search_status();
        });
        this.destructor = () => {
            if (ui) {
                ui.close();
                ui = null;
            }
        };
    }
};