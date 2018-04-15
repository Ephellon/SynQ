# SynQ.js Help
SynQ.js is a local storage caching/syncing system.

Help is also built into SynQ, just use `SynQ.help( string:item-name )` or `SynQ.help('*')`.

# HTML
## synq-data
Synchronizes an element's value, or innerText (priority to value).
- Usage: `<element synq-data>...</element>`
- Interpreted Type: Boolean

## synq-host
Creates a main object (for multiple frames), and is given the highest priority. Also sets the element's [NAME] to its [ID], or [SYNQ-UUID].
- Usage: `<element synq-host=host-name>...</element>`
- Interpreted Type: String

## synq-html
Synchronizes an element's outerHTML.
- Usage: `<element synq-html>...</element>`
- Interpreted Type: Boolean

## synq-skip
Delays synchronizing an element. Especially useful for multiple IFRAMEs with access to the parent document.
- Usage: `<element synq-skip=number-of-delays>...</element>`
- Interpreted Type: Number

_synq-skip: defaults to 0 if no value is given._

## synq-text
Synchronizes an element's innerHTML.
- Usage: `<element synq-text>...</element>`
- Interpreted Type: Boolean

## synq-uuid
The UUID that SynQ generates for each synchronized element.
- Usage: `<element synq-uuid=static-uuid>...</element>`
- Interpreted Type: String

_synq-uuid: if you set [synq-uuid], all copies of the element (including across frames) will need to have the same value. Otherwise, SynQ will handle this assignment automatically._

# JavaScript
## addEventListener
Adds an event listener to SynQ's push, pull, pop, clear, broadcast, retrieve, or cage method.
- Usage: `SynQ.addEventListener(event-name, callback)`
- Arguments: String, Function
- Returns: Number

event-name: push, pull, pop, clear, broadcast, retrieve, or cage.
_return: the number of events attached._

## append
Adds data to a global array.
- Usage: `SynQ.append(array-name, data[, key[, delimiter]])`
- Arguments: String, String[, String[, String]]
- Returns: <array-name>

_key: the password to lock/unlock the data with._

## clear
Removes all owned items from storage (related to SynQ).
- Usage: `SynQ.clear([remove-all])`
- Arguments: [Boolean]
- Returns: Undefined

remove-all: if set to true, will remove all private items too.

## decodeURL
Decodes a URL string.
- Usage: `SynQ.decodeURL(URL)`
- Arguments: String
- Returns: String

## download
Retruns data from the global storage item (see also, 'SynQ.push').
- Usage: `SynQ.download(name[, key])`
- Arguments: String[, String]
- Returns: String

_key: the password to lock/unlock the data with._

## esc
The list delimeter for SynQ to use when storing element values.
- Usage: `SynQ.esc = delimeter`
- Types: String

## eventlistener
The Event Listener for SynQ (fires automatically from SynQ).
- Usage: `SynQ.eventlistener(event)`
- Arguments: Object
- Returns: Undefined

## get
Returns data from the local storage storage item.
- Usage: `SynQ.get(name[, key])`
- Arguments: String[, String]
- Returns: String

_key: the password to lock/unlock the data with._

## help
Displays help messages.
- Usage: `SynQ.help(item-name)`
- Arguments: String
- Returns: String

## host
Creates a main object (for multiple frames), and is given the highest priority. Also sets the element's [NAME] to its [ID], or [SYNQ-UUID].
- Usage: `<element synq-host=host-name>...</element>`
- Interpreted Type: String

## last
An array that's used to hold each item's name in the order they're created.
- Usage: `SynQ.last = ['name-1', 'name-2'...]`
- Types: Array

## last_upload
An array that's used to hold each item's name in the order they're created.
- Usage: `SynQ.lastupload = ['name-1', 'name-2'...]`
- Types: Array

## list
Returns the currently owned storage items.
- Usage: `SynQ.list([show-all])`
- Arguments: Boolean
- Returns: Object

show-all: when set to true, will return private items as well.

## lock
Locks and unlocks a string.
- Usage: `SynQ.lock(data, key)`
- Arguments: String, String
- Returns: String

## pack16
Packs (encodes) a UTF-16 character, by using two UTF-8 characters.
- Usage: `SynQ.pack16(character[, character])`
- Arguments: Character[, Character]
- Returns: String

_return: if the second character is missing, then the first character will be returned._

## parseFunction
Returns an array of function data.
- Usage: `SynQ.parseFunction(function-string)`
- Arguments: String
- Returns: Array => {0: [function parameters], 1: [function statements], 2: [function name], length: 3}

## parseSize
Returns a number from an SI formatted* string.
- Usage: `SynQ.parseSize(number[, base[, symbol]])`
- Arguments: String[, Number[, String]]
- Returns: Number

* Does not recognize 'd' (deci), 'h' (hecto) or 'c' (centi)

## parseURL
Returns a URL object.
- Usage: `SynQ.parseURL(URL)`
- Arguments: String
- Returns: Object => {href, origin, protocol, scheme, username, password, host, port, path, search, searchParameters}

## pop
Removes, and returns the item from the local storage.
- Usage: `SynQ.pop([name[, key]])`
- Argumments: [String[, String]]
- Returns: String

_name: the name of the item to fetch. If left empty, will use the name of the last item created._
_key: the password to lock/unlock the data with._

## prevent
Used to prevent a value from being used.
- Usage: `SynQ.prevent(variable, illegal-values, error-message[, helper-link])`
- Arguments: (Array|String), (Array|RegExp), String[, String]
- Returns: Undefined
- Throws: Error(<message[ + helper-link]>)

helper-link: the word, or phrase used by SynQ.help to display the help message,
- - e.g. SynQ.prevent(null, [null], 'This is an example error', 'example') => "... see SynQ.help('example')".

## pull
Returns data from a local storage array.
- Usage: `SynQ.pull(array-name[, key[, delimiter]])`
- Arguments: String[, String[, String]]
- Returns: Array

_key: the password to lock/unlock the data with_

## push
Appends data to a local storage array (delimited by SynQ.esc).
- Usage: `SynQ.push(array-name, data[, key])`
- Arguments: String, String[, String]
- Returns: String<array-name>

_key: the password to lock/unlock the data with_

## recall
Gets data from a global array.
- Usage: `SynQ.recall(array-name[, key[, delimiter]])`
- Arguments: String[, String[, String]]
- Returns: Array

_key: the password to lock/unlock the data with_

## removeEventListener
Removes a(n) event listener(s).
- Usage: `SynQ.removeEventListener(function-name[, event-name])`
- Arguments: String[, String]
- Returns: Array | String

event-name: push, pull, pop, clear, broadcast, retrieve, or cage. If left empty, will remove <function-name> from every event.

## salt
Salts (encrypts) a string, usually a password.
- Usage: `SynQ.salt(string)`
- Arguments: String
- Returns: String

## set
Adds the item to the storage.
- Usage: `SynQ.set(name, data[, key])`
- Arguments: String, String[, String]
- Returns: <name>

_key: the password to lock/unlock the data with._

## sign
Hashes a string (think of SHA, or MD5).
- Usage: `SynQ.sign(string[, fidelity-level])`
- Arguments: String[, Float]
- Returns: String

fidelity-level: determines the size of the returned string. The closer to 1 the level is, the shorter the string.

## signature
The UUID of the current page (if use_global_synq_token is undefined), or current domain.

Current Signature: synq://njp494dk4/

## size
1. Returns the maximum amount of space for the storage (in bytes; 1B = 8b)
- Usage: `SynQ.size()`
- Arguments: NONE
- Returns: Integer

2. Returns the SI formatted version of the given number.
- Usage: `SynQ.size(number[base, [symbol]])`
- Arguments: Number[, Number[, String]]
- Returns: String

_base: the base to use, e.g. 1000; default is 1024._
_symbol: the symbol to append to the returned string, default is 'iB'._

## snip
Removes, and returns the item from the global storage (similar to 'SynQ.pop').
- Usage: `SynQ.snip(name[, key])`
- Arguments: String[, String]
- Returns: String

_key: the password to lock/unlock the data with._

## syn
The attribute name(s) for elements to update.
- Usage: `SynQ.syn = ['name-1', 'name-2'...]`
- Types: Array | String
- Default: ["synq-data","synq-text","synq-html","synq-host"]

## triggerEvent
Triggers all event listeners for an event.
- Usage: `SynQ.triggerEvent(event-name[, data])`
- Arguments: String[, Array]
- Returns: <data>

_data: the arguments to pass onto each listener._

## unlock
Locks and unlocks a string.
- Usage: `SynQ.unlock(data, key)`
- Arguments: String, String
- Returns: String

## unpack16
Unpacks (decodes) a UTF-16 character into two UTF-8 characters.
- Usage: `SynQ.unpack16(character)`
- Arguments: Character
- Returns: String
_return: automatically handles UTF-8 characters, and returns the character iteslf._

## upload
Adds data to the global storage item (see also, 'SynQ.pull').
- Usage: `SynQ.upload(name[, data[, key]])`
- Arguments: String[, String[, String]]
- Returns: String

_return: a UUID for the data._
_data: if no data is given, still returns the UUID._
_key: the password to lock/unlock the data with._

## used
Returns the number of bytes (1B = 8b) in use.
- Usage: `SynQ.used([synq-only])`
- Arguments: [Boolean]
- Returns: Integer

_synq-only: when set to true, will ony return the amount of owned space SynQ is using._
