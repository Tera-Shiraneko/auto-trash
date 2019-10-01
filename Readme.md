### Tera toolbox module which is discarding undesired items from your inventory or pocket.

---

### Console Commands
| Command | Description | Status |
| :---: | :---: | :---: |
| `/8 autotrash` | To automatically discard undesired items from your inventory or pocket. | Enabled by default. |
| `/8 autotrash interval + ms` | To set the desired item deleter scan interval. | 5 seconds by default. |
| `/8 autotrash add + link` | To add the desired item id's to the trash list. |  |
| `/8 autotrash remove + link` | To remove the desired item id's from the trash list. |  |
| `/8 autotrash clear` | To remove all added item id's from the trash list. |  |
| `/8 autotrash show` | To show all added items with their names and id's in your toolbox chat. |  |

---

### Interface Commands
| Command | Description |
| :---: | :---: |
| `/8 autotrash config` | To enable or disable the functions written above and edit your trash list. |

---

### Configuration
- If you want to edit the config file you need to start tera toolbox and go to the server selection.
    - It will be generated afterwards in the modules folder.

---

- An list of things that can be edited can be found here. Only for experienced users.

| Name | Description |
| :---: | :---: |
| `interval` | Here you can set the desired item deleter scan interval. |
| `trash_list` | Here you can add or remove item id's to the trash list. |

---

### Item Information
- [Tera Toolbox Module](https://github.com/Tera-Shiraneko/item-id-finder)
- [Tera Damage Meter Data => Items](https://github.com/neowutran/TeraDpsMeterData/tree/master/items)

---

### Note
- In case you want to edit the scan interval in the settings interface notice that each step is 5 seconds up to 1 minute.
- In case of multiple item id's in the config file or settings interface you need to seperate them with a comma.
- To add an item link into the chat just press ctrl and left mouse onto the desired item.
- The commands should be written without the plus just an space between it.