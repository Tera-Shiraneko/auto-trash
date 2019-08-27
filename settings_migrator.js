const fs = require("fs");

const Default_Settings = {
    "enabled": true,
    "interval": 5000,
    "trash_list": []
};

module.exports = function Migrate_Settings(from_ver, to_ver, settings) {
    if (from_ver === undefined) {
        return Object.assign(Object.assign({}, Default_Settings), settings);
    }
    else if (from_ver === null) {
        return Default_Settings;
    }
    else if (from_ver + 0.1 < to_ver) {
        settings = Migrate_Settings(from_ver, from_ver + 0.1, settings);
        return Migrate_Settings(from_ver + 0.1, to_ver, settings);
    }
    switch (to_ver) {
        case 1.5:
            fs.unlinkSync(__dirname + "/config.json");
            break;
    }
    return Default_Settings;
};