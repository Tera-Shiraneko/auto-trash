module.exports = [
    {
        "key": "enabled",
        "name": "Automatic discarding of self defined items in your trash list.",
        "type": "bool"
    },
    {
        "key": "interval",
        "name": "Here you can set the desired item deleter scan interval.",
        "type": "range",
        "min": 25000,
        "max": 600000,
        "step": 25000
    },
    {
        "key": "trash_list",
        "name": "Here you can add or remove item id's to the trash list.",
        "type": "string"
    }
];