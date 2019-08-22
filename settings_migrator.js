const fs = require('fs');

const Default_Settings = {
    "enabled": true,
    "interval": 5000,
    "trash_list": []
};

module.exports = function Migrate_Settings(from_ver, to_ver, settings) {
    if (from_ver === undefined) {
        // Migrate legacy config file.
        return Object.assign(Object.assign({}, Default_Settings), settings);
    } else if (from_ver === null) {
        // No config file exists, use default settings.
        return Default_Settings;
    } else if (from_ver + 0.1 < to_ver) {
        // Migrate from older version (using the new system) to latest one.
        settings = Migrate_Settings(from_ver, from_ver + 0.1, settings);
        return Migrate_Settings(from_ver + 0.1, to_ver, settings);
    }
    switch (to_ver) {
        // Switch for each version step that upgrades to the next version.
        case 1.5:
            fs.unlinkSync(__dirname + "/config.json");
            break;
    }
    return Default_Settings;
};
