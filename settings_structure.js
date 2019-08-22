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
        "min": 5000,
        "max": 60000,
        "step": 5000
    },
    {
        "key": "trash_list",
        "name": "Here you can add or remove item id's to the trash list.",
        "type": "string"
    }
];