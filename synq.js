/** Ephellon Grey (2015 - 2019)
 * How to use SynQ (Notice, [...] is optional):
 * Simply call on SynQ([attribute-name]), and that's it

 * For in depth help, use SynQ.help([string:item-name])

 * FAQ:
 * Q1) What if I don't want to update elements, just some data?
 * A2)  To add, retrieve, or remove (respectively):
        SynQ.set(string:name, string:data[, string:password])
        SynQ.get(string:name[, string:password])
        SynQ.pop(string:name[, string:password])
 * Q2) What if I'd like to get rid of all of my data (in SynQ)?
 * A2)  Use SynQ.clear([boolean:clear-all]) {See note #1}
 * Q3) What if I'd like to synchronize across my entire domain?
 * A3)  Set the [use_global_synq_token] variable to a defined value (null counts as defined)
 * Q4) How do I check on the status of my data?
 * A4)  You can use SynQ.list([boolean:show-private]) to show your data
 * Q5) What about the other things I see under SynQ?
 * A5)  Those are for future technologies, but you can use them as you see fit.
 * Q6) How much space do I have? {See note #3}
 * A6)  It depends on the browser but you can use SynQ.size() to find the current maximum.
        The highest is 5 MiB (5,242,880 b, with UTF-16 enabled) because JS uses UTF-16 characters {See note #4} by default.
        SynQ.size([number:value[, number:base[, string:symbol]]]) also converts "value" into an SI foramatted string,
        e.g. SynQ.size(8214, 1000, "m") returns "8.214km"
 * Q7) What if I want more space? {See note #3}
 * A7)  Set the [use_utf8_synq_token] variable to a defined value (SynQ will then force UTF-8 data strings);
        the used space will be doubled, max being 10 MiB (10,485,760 b, with UTF-16 disabled).
 * Q8) How can I see how much space I am using?
 * A8)  Use SynQ.used([boolean:synq-data-only])

 * Notes:
 * 1) SynQ.clear will only remove "local" {See note #2} items if the "use_global_synq_token" isn't set
 * 2) By "local" I mean per the unique page identifier (URL),
        i.e. "https://example.com/page-1" won't share data with ".../page-2"
 * 3) Data units are given in bits and bytes (1B = 8b [0000 0000]), with no regard to encoding.
        E.g. if SynQ.used() returns "16" it means 16 bits (2 Bytes), which is 1 UTF-16 character, or 2 UTF-8 characters
 * 4) According to [Mozilla](https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage),
        pretty sure they know what they're talking about
 */

 let SynQ;

(() => {
    let ERROR = {
            NO_NAME:    'The resource name is missing',
            UTF8_ONLY:  'Only UTF-8 characters are allowed',
        },
        IE = {
            'addEventListener': 'attachEvent',
            'dispatchEvent':    'fireEvent',
            'Event':            'CustomEvent',
        },
        SA = false,
        __ = '[[InternalAccess]]',
        top, global, window, frame,
        document,
        navigator,
        self, _this_, _self_,
        localStorage, sessionStorage, storage, connection,
        CustomEvent;

    /* The SynQ flags */
    let use_synq_token_global,
        use_synq_token_utf16,
        use_synq_token_cookie,
        use_synq_token_uuid,
        use_synq_token_vpn;

    window = top || global || window || frame || self || this || {};
    document = window.document || {};
    navigator = window.navigator || {};

    /* Determine if the browser if IE/Edge or Safari */
    if(typeof CustomEvent == 'object') {
        // IE/Edge
        for(let property in IE)
            window[property] = window[IE[property]] || window[property];

        (_ => {
            CustomEvent = function(event, parameters = { bubbles: false, cancelable: false, detail: undefined }) {
                let e = doc.createEvent('CustomEvent');

                e.initCustomEvent(event, parameters.bubbles, parameters.cancelable, parameters.detail);
                return e;
            };

            CustomEvent.prototype = Event.prototype;

            window.CustomEvent = CustomEvent;
        })();

        IE = true;
    } else if(CustomEvent === undefined) {
        // Safari
        (_ => {
            CustomEvent = function(event, parameters = { bubbles: false, cancelable: false, detail: undefined }) {
                addEventListener(event, parameters);
            };

            CustomEvent.prototype = Event.prototype;

            window.CustomEvent = CustomEvent;
        })();

        SA = true;
        IE = false;
    } else {
        // Chrome, Firefox, or Opera (Chromium-based)
        IE = false;
    }

    /* Helper functions/properties/variables */
    let doc = document,
        win = window,
        nav = navigator;

    // Returns a random integer
    let Random = (minimum, maximum) =>
        (Math.random() * (maximum | 0)) + (minimum | 0);

    // Repeat a string
    String.prototype.repeat = String.prototype.repeat || function repeat(count) {
        let string = this + '';
        for(;count-- > 0;)
            string += string;

        return string;
    };

    // Ping an address
    // https://stackoverflow.com/questions/4282151/is-it-possible-to-ping-a-server-from-javascript
    // Powered by: Lorem Picsum
    function ping(address, options) {
        if(ping.inUse)
            return 'Currently pinging an address, please wait';

        let fallback = {
            callback: (...arguments) => arguments,
            pass: () => {},
            fail: () => {},
            timeout: 30000,
        },
        x = Random(126, 638),
        y = Random(126, 638);

        address = address || `picsum.photos/${ y }/${ x }/?random`;
        options = options || fallback;

        let catcher = { ...fallback, ...options };

        ping.inUse = true;
        ping.address = address;
        ping.callback = catcher.callback;
        ping.pass = catcher.pass;
        ping.fail = catcher.fail;

        ping.ping = new Image();
        ping.clear = status => {
            clearTimeout(ping.timeout);
            ping.inUse = false;

            let time = +(new Date) - ping.start,
                size = (ping.ping.height * ping.ping.width * 64) || 1;

            return ping.callback.call(null, ping.trip = {
                time,
                size,
                speed: (size / time) | 0,
                uplink: (size / time / 2) | 0,
                address: ping.address,
                resolve: ping.ping.src,
                status: (status? 'pass': 'fail'),
            });
        };

        ping.ping.onload = event => {
            ping.clear(true);
            ping.pass(event);
        };

        ping.ping.onerror = event => {
            ping.clear(false);
            ping.fail(event);
        };

        ping.start = +(new Date);
        ping.ping.src = address.replace(/^(https?)?(?:\:?\/\/)?/i, `https://${ address }`);
        ping.timeout = setTimeout(ping.fail, catcher.timeout);
    }

    /* SynQ */
    SynQ = (name = null) => {
        ++SynQ[__];

        if(name === null)
            name = SynQ.syn;
        if(name instanceof Array)
            name = name.join('],[');

        let messages = [],
            uuids = SynQ.get('.uuids'),
            copies = {},
            query;

        try {
            query = doc.querySelectorAll(`[${ name }]`);
        } catch(error) {
            return error;
        }

        uuids = (uuids || '').split(',');

        function fetch(e) {
            let a = e.attributes,
                n =
                    ('synq-attr' in a)?
                        '#attr':
                    ('synq-data' in a)?
                        ('value' in e)?
                            'value':
                        'innerText':
                    ('synq-text' in a)?
                        'innerHTML':
                    ('synq-html' in a)?
                        'outerHTML':
                    '';

            if(n === '')
                return n;

            switch(n) {
                case '#attr':
                    let o = {},
                        l = a['synq-attr'].value,
                        f = (v, i, r) => o[v] = a[v].value;

                    if(!l.length)
                        [...a].map(f);
                    else
                        l.split(/\s+/).map(f);
                    return o;
            }

            return e[n];
        }

        for(let index = 0, element, attr, tag, id, uuid, name, value, host, o, u; index < query.length; o = !1, index++) {
            // Handle the elements' information
            element = query[index];
            attr = element.attributes;
            tag = element.tagName;
            id = ('id' in attr)? attr.id.value: u;
            name = ('name' in attr)? attr.name.value: u;
            uuid = ('synq-uuid' in attr)? attr['synq-uuid'].value: u;
            host = ('synq-host' in attr)? attr['synq-host'].value: u;
            copies[tag] |= 0;

            // Setup the SynQ host(s)
            if(host)
                element.setAttribute('name', SynQ.host = host || id || uuid || name);

            // Adds copies of elements for the UUID to work properly
            tag += (id || uuid)?
                `#${ id || uuid }`:
            `:nth-child(${ ++copies[tag] })`;

            // Get, and test the value
            value = fetch(element);

            if(o = typeof value == 'object')
                value = SynQ.defalte(value);

            // Assign the element's UUID
            if(!uuid)
                uuid = (o? '!': '') + SynQ.sign(tag, 1);
            else
                uuid = /^!/.test(uuid)? uuid: `!${ uuid }`;

            // Set the element's UUID for future references
            element.setAttribute('synq-uuid', uuid);

            // Push the UUID
            if(!~uuids.indexOf(uuid))
                uuids.push(uuid);

            // Push the messages
            uuid = `.values/#${ uuid }`;

            messages.push(SynQ.encodeURL(value));
            SynQ.set(uuid, value);
        }

        SynQ.set('.values', messages.join(SynQ.esc));
        SynQ.set('.uuids', uuids.join(',').replace(/^,+|,+$/g, ''));

        --SynQ[__];
    };

    /* Helper functions/properties */
    SynQ.esc = `%%`;
    // change to your liking; this is the list's delimeter

    SynQ.syn = 'synq-attr synq-data synq-text synq-html synq-host'.split(' ');
    // Change this accordingly; this is the synchronizing attribute for your elements
    // synq-data: .innerText OR .value (preference to .value)
    // synq-text: .innerHTML
    // synq-html: .outerHTML

    /* The event listeners */
    // event listener target
    SynQ.EventListener = event => {
        ++SynQ[__];

        let messages = SynQ.get('.values'),
            uuids = SynQ.get('.uuids'),
            copies = {},
            query;

        try {
            query = doc.querySelectorAll(`[${ SynQ.syn.join('],[') }]`);
        } catch(error) {
            return error;
        }

        messages = (messages || '').length?
            messages.split(SynQ.esc):
        [];

        uuids = (uuids || '').length?
            uuids.split(','):
        [];

        function write(e, m) {
            let a = e.attributes,
                n =
                    ('synq-attr' in a)?
                        '#attr':
                    ('synq-data' in a)?
                        ('value' in e)?
                            'value':
                        'innerText':
                    ('synq-text' in a)?
                        'innerHTML':
                    ('synq-html' in a)?
                        'outerHTML':
                    '';

            if(n === '')
                return n;

            switch(n) {
                case '#attr':
                    for(let p in m)
                        e.setAttribute(p, m[p]);
                    return a;
            }

            e[n] = m? m: e[n];
        }

        updating:
        for(let index = 0, length = query.length, element, attr, tag, id, uuid, name, value, host, skip, o, u; index < length; o = !1, index++) {
            // The elements' information
            element = query[index];
            tag = element.tagName;
            attr = element.attributes;
            id = ('id' in attr)? attr.id.value: u;
            name = ('name' in attr)? attr.name.value: u;
            uuid = ('synq-uuid' in attr)? attr['synq-uuid'].value: u;
            host = ('synq-host' in attr)? attr['synq-host'].value: u;
            copies[tag] |= 0;

            // Don't overwrite skip-elements (higher number = higher priority)
            // synq-skip = number of times to ignore SynQ-ing
            if('synq-skip' in attr) {
                skip = +attr['synq-skip'].value | 0;

                if(skip > 0) {
                    element.setAttribute('synq-skip', --skip);
                    continue updating;
                } else {
                    element.removeAttribute('synq-skip');
                }
            }

            if(host)
                element.setAttribute('name', SynQ.host = SynQ.host || host || uuid);

            tag += (id || uuid)?
                `#${ id || uuid }`:
            `:nth-child(${ ++copies[tag] })`;

            // Get the element's UUID
            if(uuid === null)
                uuid = SynQ.sign(tag, 1);

            // The UUID is set (preferred)
            // Write confidently, even if the HTML document has changed
            if(uuid) {
                value = SynQ.get(`.values/#!${ uuid }`);
                value = (o = value !== null)?
                    value:
                SynQ.get(`.values/#${ uuid }`);

                value = o? value: '';
            }
            // UUID is NOT set
            // Write, assuming the HTML document hasn't changed
            else {
                value = messages[index] || '';
            }

            // Set the element's UUID for future references
            element.setAttribute('synq-uuid', uuid);

            value = SynQ.decodeURL(value);

            if(o || /^!/.test(uuid))
                value = SynQ.inflate(value);

            write(element, value);
        }

        --SynQ[__];
    };

    // Add an event listener
    SynQ.addEventListener = (event, callback) => {
        SynQ.prevent([event, callback], [undefined, null, ''], `Failed to add event listener "${ event }"`, 'addEventListener');

        if(SynQ[__])
            return callback;
        else
            ++SynQ[__];

        event = `${ SynQ.eventName }/${ event }/#`;

        let events = SynQ.get(event + '!'), // synq://uuid/#!
            fn = SynQ.parseFunction(callback),
            nm = fn[2] || events.length;

        events = (events || '').length?
            events.split(SynQ.esc):
        [nm];

        if(!~events.indexOf(nm))
            events.push(nm);

        SynQ.set(event + '!', events);
        SynQ.set(event + name, callback + '');

        return --SynQ[__], events.length - 1;
    };

    // Remove an event listener
    SynQ.removeEventListener = (event, parent) => {
        SynQ.prevent(name, [undefined, null, ''], `Failed to remove event listener "${ parent || '*' }"/"${ event }"`, 'removeEventListener');

        if(SynQ[__])
            return parent;
        else
            ++SynQ[__];

        if(parent)
            return --SynQ[__],
                SynQ.pop(`${ SynQ.eventName }/${ parent }/#${ event }`);

        let events = SynQ.events.split(' '),
            popped = [];

        for(let index = 0, listener, values; index < events.length; index++) {
            parent = `${ SynQ.eventName }/${ events[index] }/#`;
            listener = SynQ.pop(parent + event);

            if(listener) {
                values = SynQ.pop(parent += 0).split(',');
                values.splice(values.indexOf(event) - 1, 1);
                SynQ.set(parent, values + '');
                popped.push(listener);
            }
        }

        return --SynQ[__], popped;
    };

    // Trigger an event listener
    SynQ.triggerEventListener = (event, data) => {
        SynQ.prevent(event, [undefined, null, ''], `Failed to trigger event "${ event }"`, 'triggerEventListener');

        if(SynQ[__])
            return data;
        else
            ++SynQ[__];

        event = `${ SynQ.eventName }/${ event }/#`;

        let events = SynQ.get(event + 0);

        events = (events || '').length?
            events.split(SynQ.esc):
        [];

        for(let index = 0, head, body, fn, host = SynQ.host; index < events.length; index++) {
            fn = SynQ.parseFunction(SynQ.get(event + events[index]));
            head = fn[0];
            body = fn[1];
            --SynQ[__];
            new Function(head, body).call(null, data);
            ++SynQ[__];
        }

        return --SynQ[__], data;
    };

    /* The URL oriented functions */
    // URI encoder
    SynQ.encodeURL = url => {
        url = url + '';

        for(let index = 0, characters = '% "<>[\\]^`{|}'; index < characters.length; index++)
            url = url.replace(
                RegExp(`\\${ characters[index] }`, 'g'),
                `%${ characters.charCodeAt(index).toString(16) }`
            );

        return url;
    };

    // URI decoder
    SynQ.decodeURL = url => {
        url = url + '';

        for(let regexp = /%([a-f]\d){2}/ig; regexp.test(url);)
            url = url.replace(regexp, ($0, $1, $$, $_) =>
                String.fromCharCode(+(`0x${ $1 }`)) + '\r\f'
                // \r\f prevents intentional %code from being removed
            );

        return url.replace(/(% "<>\[\\\]\^`\{\|\})\r\f/g, '$1');
    };

    /* The storage oriented functions */
    // List all of the current data (paths)
    SynQ.list = all => {
        let signature = SynQ.shadow || SynQ.signature,
            regexp = RegExp(
                `^(${ use_synq_token_global || all? 'synq://localhost:(443|80)/.*|': '' }${ signature.replace(/(\W)/g, '\\$1') })${ all? '.+': '[^\\.].+' }$`
            ),
            array = {};

        for(let item in storage)
            if(regexp.test(item))
                array[item] = storage[item];

        return array;
    };

    // Search for entries
    SynQ.find = (query, all, results = []) => {
        if(/^synq:\/\/([^\n\r\f\v]+)\/\?/.test(query)) {
            let url = SynQ.parseURL(query),
                original = SynQ.signature,
                shadow = SynQ.shadow,
                shade = url.origin + '/',
                params = url.searchParameters;

            SynQ.shadow = shade;
            results = SynQ.find(params.query, params.all);
            SynQ.shadow = shadow;

            return results;
        }

        if(query instanceof Array) {
            query.forEach(entry => results.concat(SynQ.find(entry, all, results)));

            return results;
        }

        let owned = SynQ.list(all),
            test;

        if(query instanceof RegExp)
            test = string => query.test(string);
        else
            test = string => (string == (query += '') || !!~string.indexOf(query));

        for(let entry in owned)
            if(!~results.indexOf(entry) && (test(entry) || test(owned[entry] + '')))
                results.push(entry);

        return results;
    };

    // The 'clear all' function
    SynQ.clear = all => {
        let signature = SynQ.shadow || SynQ.signature,
            regexp = RegExp(`^(${ signature.replace(/(\W)/g, '\\$1') })${ all? '.+': '(.*/)?[^\\.].+' }$`);

        for(let item in storage)
            if(regexp.test(item))
                storage.removeItem(item);

        return SynQ.triggerEventListener('clear');
    };

    // Import items from the storage
    SynQ.import = name => {
        SynQ.prevent(name, [undefined, null], ERROR.NO_NAME, 'import');

        let data = storage.getItem(name);

        storage.setItem(SynQ.signature + name, data);

        SynQ.last.push(name);

        return SynQ.triggerEventListener('import', name);
    };

    // Export items to the storage
    SynQ.export = name => {
        SynQ.prevent(name, [undefined, null], ERROR.NO_NAME, 'export');

        let data = storage.getItem(SynQ.signature + name);

        storage.setItem(name, data);

        return SynQ.triggerEventListener('export', name);
    };

    // Single, local targets //
    // Remove a resource (local)
    SynQ.pop = (name = SynQ.last.pop(), key = null) => {
        ++SynQ[__];

        SynQ.prevent(name, [undefined, null, ''], ERROR.NO_NAME, 'pop');

        let data = SynQ.get(name, key);

        if(key !== null)
            storage.removeItem(`${ SynQ.signature }.${ name }`);
        else
            storage.removeItem(SynQ.signature + name);

        return --SynQ[__], SynQ.triggerEventListener('pop', data);
    };

    // Remove a resource (global)
    SynQ.snip = (name = SynQ._last.pop(), key = null) => {
        ++SynQ[__];
        SynQ.prevent(name, [undefined, null, ''], ERROR.NO_NAME, 'snip');

        let data = SynQ.get(name, key);
        name = SynQ.set(name, null, key);

        if(key !== null)
            storage.removeItem(`synq://localhost:443/${ name }`);
        else
            storage.removeItem(`synq://localhost:80/${ name }`);

        return --SynQ[__], SynQ.triggerEventListener('snip', data);
    };

    // Push (set) a resource's value
    SynQ.set = (name, data, key = null) => {
        SynQ.prevent(name, [undefined, null], ERROR.NO_NAME, 'set');

        data = data + '';

        let UTF16 = use_synq_token_utf16;

        if(UTF16)
            SynQ.prevent(data, /[^\u0000-\u00ff]/, ERROR.UTF8_ONLY, 'set');

        if(key !== null) {
            data = SynQ.lock(data, key);
            key = '.';
        } else {
            key = '';
        }

        if(UTF16 && data) {
            let array = [];
            for(let index = 0, length = data.length; index < length;)
                array.push(SynQ.pack16(data[index++], data[index++]));
            data = array.join('');
        }

        storage.setItem(SynQ.signature + key + name, data);

        SynQ.last.push(name);

        return SynQ.triggerEventListener('set', name);
    };

    // Pull (get) a resource's value
    SynQ.get = (name, key = null) => {
        SynQ.prevent(name, [undefined, null], ERROR.NO_NAME, 'get');

        let data,
            UTF16 = use_synq_token_utf16;

        if(key !== null)
            data = storage.getItem(`${ SynQ.signature }.${ name }`);
        else
            data = storage.getItem(SynQ.signature + name);

        if(UTF16)
            SynQ.prevent(data, /[^\u0000-\u00ff]/, ERROR.UTF8_ONLY);

        if(UTF16 && data) {
            let array = [];
            for(let index = 0, length = data.length; index < length;)
                array.push(SynQ.unpack16(data[index++]));

            data = [];
            array = array.join('').split(/([01]{8})/);
            for(let index = 0, length = array.length; index < length; index++)
                if(array[index] !== '')
                    data.push(String.fromCharCode(+(`0b${ array[index] }`)));

            data = data.join('');
        }

        if(key !== null)
            data = SynQ.unlock(data, key);

        return SynQ.triggerEventListener('get', data);
    };

    // Multiple, local targets //
    // Push to a resource's value
    SynQ.push = (name, data, key, delimeter = SynQ.esc) => {
        SynQ.prevent(name, [undefined, null, ''], ERROR.NO_NAME, 'push');

        ++SynQ[__];

        let last = SynQ.get(name, key) || '';

        data = (last.length > 0)?
            last.split(delimeter).concat(data):
        [data];
        data = SynQ.set(name, data.join(delimeter), key);

        return --SynQ[__], SynQ.triggerEventListener('push', data);
    };

    // Pull a resource's value
    SynQ.pull = (name, key, delimeter = SynQ.esc) => {
        ++SynQ[__];

        let data = SynQ.get(name, key) || '';

        data = (data.length)?
            data.split(delimeter):
        [data];

        return --SynQ[__], SynQ.triggerEventListener('pull', data);
    };

    // Single, global targets //
    // Broadcast and set a resource's value
    SynQ.upload = (name, data = null, key = null) => {
        SynQ.prevent(name, [undefined, null], ERROR.NO_NAME, 'upload');

        if(data === null) {
            key = (key? '.': '');

            return (
                key + SynQ.sign(key + name)
                    .replace(/(.{1,4})(.{1,2})?(.{1,2})?(.{1,2})?(.{1,6})?(.{1,12})?/, '$1-$2-$3-$4-$5:$6')
                    .replace(/[\-\:]+$/, '')
            );
        }

        data = data + '';

        let UTF16 = use_synq_token_utf16;

        if(UTF16)
            SynQ.prevent(data, /[^\u0000-00ff]/, ERROR.UTF8_ONLY);

        if(key !== null) {
            data = SynQ.lock(data, key);
            key = '.';
        } else {
            key = '';
        }

        if(UTF16 && data) {
            let array = [];
            for(let index = 0, length = data.length; index < length;)
                array.push(SynQ.pack16(data[index++], data[index++]));
            data = array.join('');
        }

        // '.name' and 'name' will NOT be interchangable
        name = SynQ.sign(key + name)
            .replace(/(.{1,4})(.{1,2})?(.{1,2})?(.{1,2})?(.{1,6})?(.{1,12})?/, "$1-$2-$3-$4-$5:$6")
            .replace(/[\-\:]+$/, '');

        storage.setItem(`synq://localhost:${ key.length? 443: 80 }/${ name }`, data);

        SynQ._last.push(name);

        return SynQ.triggerEventListener('upload', name);
    };

    // Retrieve (get) a resource's value
    SynQ.download = (name, key = null) => {
        SynQ.prevent(name, [undefined, null, ERROR.NO_NAME], 'download');

        let data,
            UTF16 = use_synq_token_utf16;

        // '.name' and 'name' are NOT interchangable
        name = SynQ.sign((key? '.': '') + name)
            .replace(/(.{1,4})(.{1,2})?(.{1,2})?(.{1,2})?(.{1,6})?(.{1,12})?/, '$1-$2-$3-$4-$5:$6')
            .replace(/[\-\:]+$/, '');

        if(key !== null)
            data = storage.getItem(`synq://localhost:443/${ name }`);
        else
            data = storage.getItem(`synq://localhost:80/${ name }`);

        if(UTF16)
            SynQ.prevent(data, /[^\u0000-\u00ff]/, ERROR.UTF8_ONLY);

        if(UTF16 && data) {
            let array = [];
            for(let index = 0, length = data.length; index < length;)
                array.push(SynQ.unpack16(data[index++]));

            data = [];
            array = array.join('').split(/([01]{8})/);
            for(let index = 0, length = array.length; index < length; index++)
                if(array[index] !== '')
                    data.push(String.fromCharCode(+(`0b${ array[index] }`)));

            data = data.join('');
        }

        if(key !== null)
            data = SynQ.unlock(data, key);

        return SynQ.triggerEventListener('download', data);
    };

    // Multiple, global targets //
    // Append (push) to a resource's value
    SynQ.append = (name, data, key, delimeter = SynQ.esc) => {
        ++SynQ[__];
        SynQ.prevent(name, [undefined, null, ''], ERROR.NO_NAME, 'append');

        data = SynQ.download(name, key)
            .split(SynQ.esc)
            .concat(data);
        data = SynQ.upload(name, data.join(delimeter), key);

        return --SynQ[__], SynQ.triggerEventListener('append', data);
    };

    // Recall (pull) a resource's value
    SynQ.recall = (name, key, delimeter = SynQ.esc) => {
        ++SynQ[__];

        let data = SynQ.download(name, key) || '';
        data = (data.length)?
            data.split(delimeter):
        [data];

        return --SynQ[__], SynQ.triggerEventListener('recall', data);
    };

    /* The data oriented functions/properties */
    // Test the data limits (in Bytes, iB) or return an SI formatted value
    SynQ.size = (number = null, base, symbol) => {
        let backup = {},
            size = (n, b = 1024, s) => {
                let g, k, x;
                s = s || (n < 1024? 'b': 'iB');

                if(n < b && n > -b)
                    for(k = 'mµnpfaz', x = 0, g = k.length; (x < g) && (n < 1); x++)
                        n *= b;
                else
                    for(k = 'kMGTPEZY', x = 0, g = k.length; (x < g) && (n >= b); x++)
                        n /= b;

                return n + (k[x - 1] || '') + s;
            },
            found;

        if(number === null)
            if(IE && use_synq_token_cookie === undefined) {
                for(let item in storage)
                    backup[item] = storage;

                storage.clear();
                found = storage.remainingSpace  | 0;

                for(let item in backup)
                    storage[item] = backup[item];
            } else {
                for(let item in storage)
                    backup[item] = storage;

                storage.clear();

                let i, j, l = 1024, p = true, s = '_';

                _1kiB: // 0b - 1kiB
                    for(i = 1; p && i < l; i *= 2)
                        try {
                            storage.setItem('SizeTest', s.repeat(i));
                        } catch(error) {
                            p = false;

                            break _1kiB;
                        }

                _1MiB: // 1kiB - 1MiB
                    for(j = l, l *= 1024; p && i < l; i *= 2)
                        try {
                            storage.setItem('SizeTest', s.repeat(i));
                        } catch(error) {
                            p = false;

                            break _1MiB;
                        }

                _1GiB: // 1MiB - 1GiB
                    for(j = l, l *= 1024; p && i < l; i += j)
                        try {
                            storage.setItem('SizeTest', s.repeat(i));
                        } catch(error) {
                            p = false;

                            break _1GiB;
                        }

                storage.clear();

                for(let item in backup)
                    storage[item] = backup[item];

                found = i;
            } // :defined number

        SynQ.size = (number = null, base, symbol) =>
            (number === null)?
                SynQ.size.max | 0:
            SynQ.size.convert(+number, base, symbol);

        SynQ.size.convert = size;
        SynQ.size.max = found *= 2;

        if(number !== null)
            return SynQ.size(number, base, symbol);

        return found;
    };

    // Return the how much space is in use
    SynQ.used = exclusive => {
        let size = 0,
        signature = SynQ.shadow || SynQ.signature;

        for(let item in storage)
            if(storage.hasOwnProperty(item))
                if(exclusive && RegExp(signature.replace(/(\W)/g, '\\$1')).test(item))
                    size += storage[item].length | 0;
                else if(!exclusive)
                    size += storage[item].length | 0;

        return size * 2;
    };

    // Return a number from an SI formatted string
    SynQ.parseSize = (size, base = 1024, symbol) => {
        let e = '';

        symbol = symbol || (+size < 1024? 'b': 'iB');
        size = (size || e)
            .replace(/^\s*([\d\. ]+[zafpn\u00b5mkMGTPEZY]|[\d\., ]+).*/, '$1')
            .replace(/[^\w\.]/g, e)
            .replace(symbol, e)
            .replace(/(\d+)?(\.\d+)?/, ($0, $1 = e, $2 = e, $_) => $1 + $2.replace(/\./g, e));

        let sizes = 'zafpnµm kMGTPEZY',
            tail = size.replace((size = parseInt(size)), e);

        return size * Math.pow(base, sizes.indexOf(tail) - 7);
    };

    /* The security oriented functions */
    // Lock/unlock data (weak security)
    SynQ.lock = (data = '', key) => {
        key = SynQ.salt(SynQ.sign(key, 0));

        let salted = [];
        for(let index = 0; index < data.length; index++)
            salted.push(String.fromCharCode(
                data.charCodeAt(index) ^ key.charCodeAt(index % 256)
            ));

        return salted.join('');
    };

    SynQ.unlock = (data, key) => SynQ.lock(data, key);

    // KSA Algorithm (Salt)
    SynQ.salt = (text = '') => {
        let salted = [];

        for(let index = 0; index < 256; index++)
            salted[index] = index;

        for(let index = 0, exdex = 0, swap = 0; index < 256; index++) {
            exdex = (exdex + salted[index] + text.charCodeAt(index % text.length)) % 256;
            salted[swap] = salted[index];
            salted[index] = salted[exdex];
            salted[exdex] = salted[swap];
        }

        for(let index = 0; index < 256; index++)
            salted[index] = String.fromCharCode(salted[index]);

        return salted.join('');
    };

    // The hash/signature algorithm (Mi/o, by Ephellon Grey)
    SynQ.sign = (string = '', fidelity) => {
        let array = (string += '').split(/([^]{256})/),
            result = [],
            gamma = 0,
            method, base;

        fidelity = 2 + (((+fidelity || 0) * 14) | 0);
        method = s => s? s.charCodeAt(0): s;

        let R = t => {
            let s = [],
                S = [],
                N = 256,
                u = '',
                l = (t = (t || u) + u).length;

            if(!l)
                return u;
            else
                t = ' ' + t;

            for(let n = 0; n < N;)
                s.push(n++);

            for(let n = 0, x = 0, w = 0; n < N; n++) {
                x = (x + s[n] + t.charCodeAt(n % 1)) % N;
                s[w] = s[n];
                s[n] = s[x];
                s[x] = s[w];
            }

            for(let n = -1; n < N; n++)
                S.push(t[s[n]] || u);

            return S.join(u);
        };

        array.forEach((value, index, self) =>
            (value === '')?
                (self || this).splice(index, 1):
            R(value).split('').forEach((character, position) => gamma += +R(character.charCodeAt(0) * (position | 1)))
        );

        gamma = +R(gamma);

        for(let index = 0, length = array.length, last = length - 1; index < length; index++)
            for(let self = array[index], next = (array[index + 1] || ''), mirror = array[last], a, b, c, d, e, f, g = gamma, i = 0, j = self.length, k = mirror.length, l = length, m = k - 1, q = fidelity; i < j; ++i, --m, gamma = g += a + b + c + d + e + f) {
                a = (method(self[i]) | q) | 0;
                b = (method(self[j - i - 1]) - a) | 0;
                c = (method(mirror[m]) + b) | 0;
                d = (method(mirror[k - m]) ^ c) | 0;
                e = (method(next[i]) | d) | 0;
                f = (method(next[m]) ^ e) | 0;
                result.push(
                    (((a ^ ~b) << (i + k)) | (j & e) | g) ^
                    (((b | -c) ^ (m + j)) | (j & f) | g) ^
                    (((c & ~d) << (e - k)) >> (k ^ q) + g) ^
                    (((d << a) ^ (f - j)) >> (k ^ q) + g) ^
                    ((a & b | c ^ d) ^ e - f) << (q & e & f)
                );
            }

        result.splice(fidelity, result.length - fidelity);
        base = ((gamma % 16) + (fidelity % 16)) | 16;

        result.forEach((value, index, self) =>
            self.splice(index, 1, Math.abs(value ^ gamma).toString(base))
        );

        result = result.join('').slice(0, 256);
        gamma = gamma.toString(base);
        base = (base * (fidelity || 1)).toString(base);

        return R(result) + base + gamma;
    };

    /* Miscellaneous helpers */
    // Parse a function (returns a 'head' nad 'body')
    SynQ.parseFunction = fn => {
        SynQ.prevent(fn, [undefined, null, ''], `Failed to parse empty function`, 'parseFunction');

        fn = fn.toString()
            .replace(/(?:\bfunction(\s+[a-zA-Z\$_]\w*)?)?\s*(\(.*?\))\s*(\{[^]*\})/, '$2 => $3');

        let name = (RegExp.$1 || '').replace(/\s+/g, '');

        fn = fn.split(/ => /, 2);

        return [fn[0].replace(/^\(|\)$/g, ''), fn[1].replace(/^\{|\}$/g, ''), name];
    };

    // Parse a URL (even unconventional ones)
    SynQ.parseURL = (url = null) => {
        if(url === null)
            return {};

        url = url + '';

        let data = url.match(/^((([^:\/?#]+):)?(?:\/{2})?)(?:([^:]+):([^@]+)@)?(([^:\/?#]*)?(?:\:(\d+))?)?([^?#]*)(\?[^#]*)?(#.*)?$/),
            i = 0, e = '';

        return {
            href: data[i++] || e,
            origin: (data[i++] + data[i + 4]) || e,
            protocol: data[i++] || e,
            scheme: data[i++] || e,
            username: data[i++] || e,
            password: data[i++] || e,
            host: data[i++] || e,
            hostname: data[i++] || e,
            port: data[i++] || e,
            pathname: data[i++] || e,
            search: data[i++] || e,
            searchParameters: (sd => {
                let s = {},
                    e = '';

                parsing:
                for(let i = 0, d = sd.slice(1, sd.length).split('&'), n, p, c; sd != e && i < d.length; i++) {
                    c = d[i].split('=');
                    n = c[0] || e;
                    p = c.slice(1, c.length).join('=');
                    s[n] = (s[n] !== undefined)?
                        s[n] instanceof Array?
                            [...s[n], p]:
                        [s[n], p]:
                    p;
                }

                return s;
            })(data[i - 1] || e),
            hash: data[i++] || e,
        };
    };

    // Prevent &/ handle errors
    SynQ.prevent = (variable, failures, message, helper) => {
        let prevent = (a, b, c, d) => {
            if(a == b)
                throw new Error(c + (d? `, please see SynQ.help("${ d }").`: '.'));
        };

        let index, length;

        // Array, *, *
        if(variable instanceof Array)
            for(index = 0, length = variable.length; index < length; index++)
                SynQ.prevent(variable[index], failures, message, helper);
        // *, Function, *
        else if(failures instanceof RegExp)
            prevent(failures.test(variable), true, message, helper);
        // *, Array, *
        else if(failures instanceof Array)
            for(index = 0, length = failures.length; index < length; index++)
                prevent(variable, failures[index], message, helper);
    };

    // Pack UTF8 characters
    SynQ.pack = string => {
        let array = [];

        for(let index = 0, length = string.length; index < length;)
            array.push(SynQ.pack16(string[index++], string[index++]));
    };

    // Pack UTF8 characters
    SynQ.pack16 = (a, b) => {
        let s = c => (`00000000${ c.charCodeAt(0).toString(2) }`).slice(-8);

        return String.fromCharCode(+(`0b${ s(a) + (b? s(b): '') }`));
    };

    // Unpack UTF16 characters
    SynQ.unpack = function (string) {
        let array = [], data = [];

        for(let index = 0, length = string.length; index < length;)
            array.push(SynQ.unpack16(string[index++]));
        array = array.join('').split(/([01]{8})/);

        for(let index = 0, length = array.length; index < length; index++)
            if(array[index] !== '')
                data.push(String.fromCharCode(+(`0b${ array[index] }`)));

        return data.join('');
    };

    // Unpack UTF16 characters
    SynQ.unpack16 = a => {
        let b,
            s = c => (((b = c.charCodeAt(0)) < 0xff? '': '00000000') + b.toString(2)).slice(-16);

        return s(a);
    };

    let JSON, Symbol,
        Map, WeakMap, Set, WeakSet,
        Int8Array, Int16Array, Int32Array,
        Uint8Array, Uint8ClampedArray, Uint16Array, Uint32Array,
        Float32Array, Float64Array;

    // Stringify objects
    SynQ.deflate = (object = null, filter = (key, value) => value, space = '', indent = 0) => {
        let pack = SynQ.deflate,
            json = [],
            blacklist = [],
            max = 10,
            filterfn,
            ltypes = [Boolean, Number, String],
            atypes = [Array, Map, Set, WeakMap, WeakSet],
            otypes = [Object, Int8Array, Int16Array, Int32Array, Uint8Array, Uint8ClampedArray, Uint16Array, Uint32Array, Float32Array, Float64Array],
            constructor = ((object && object.constructor)? object.constructor: null),
            type =
                (!!~atypes.indexOf(constructor))?
                    '[]':
                (!!~otypes.indexOf(constructor))?
                    '{}':
                (!!~ltypes.indexOf(constructor))?
                    '':
                (object && typeof object == 'object' && 'toJSON' in object)?
                    '""':
                (object !== undefined && object !== null)?
                    '{}':
                '';

        if(object === null || !!~ltypes.indexOf(object.constructor))
            return (
                (object && object.constructor == String)?
                    `"${ object.replace(/\\/g, '\\\\') }"`:
                (object !== null && (object.constructor == Boolean || (object.constructor == Number && (object.valueOf() < Infinity && object.valueOf() > -Infinity))))?
                    object:
                null
            ) + '';

        indent = indent || space.length;
        space = (
            (typeof space == 'number')?
                '\t'.repeat(space):
            space
        ).slice(0, max);

        function format(string, data) {
            if(!filterfn(data.key, data.value))
                return '';

            for(let regexp = /#\{(\w+)\}/g; regexp.test(string);)
                string = string.replace(regexp, ($0, $1, $$, $_) => {
                    if(data.string && data[$1].constructor == String)
                        return data[$1].replace(/[\\"]/g, '\\$&').replace(/\n/g, '\\n').replace(/\r/g, '\\r');

                    return data[$1];
                });

            return space + string.replace(/\:\s+/, space? ': ': ':');
        }

        if(!!atypes.indexOf(filter.constructor))
            filterfn = (key, value) => !!~filter.indexOf(key);
        else if(filter instanceof Function)
            filterfn = filter;
        else
            filterfn = (key, value) => value;

        if(!!~atypes.indexOf(object.constructor))
            for(let index = 0, length = object.length | 0; index < length; index++)
                json.push(format('#{value}', {
                    value: pack(object[index], filter, space)
                }));
        else if('toJSON' in object)
            json.push(format('#{value}', {
                key: 'toJSON',
                value: object.toJSON()
            })),
            type = '';
        else serializing:
            for(let key in object) {
                let value = object[key];

                if(value == object || !!~blacklist.indexOf(key)) {
                    blacklist.push(key);
                    continue serializing;
                }

                if(value === undefined || value === null || value.constructor == Function || value.constructor == Symbol)
                    json.push(format('"#{key}": null', {
                        key: key,
                        value: value
                    }));
                else if(value.constructor == RegExp)
                    json.push(format('"#{key}": #{value}', {
                        key: key,
                        value: pack(value.source + '$=' + value.flags, filter, space)
                    }));
                else if(value.constructor == String)
                    json.push(format('"#{key}": "#{value}"', {
                        key: key,
                        value: value,
                        string: true
                    }));
                else if(!!~ltypes.indexOf(value.constructor))
                    json.push(format('"#{key}": #{value}', {
                        key: key,
                        value: value
                    }));
                else if(!!~atypes.indexOf(value.constructor))
                    json.push(format('"#{key}": #{value}', {
                        key: key,
                        value: pack(value, filter, space)
                    }));
                else if(!!~otypes.indexOf(value.constructor))
                    json.push(format('"#{key}": #{value}', {
                        key: key,
                        value: pack(value, filter, space + space, space.length)
                    }));
                else if(/^synq\:\/\//.test(key))
                    if(!key.indexOf(SynQ.signature))
                        json.push(format('"#{key}": "#{value}"', {
                            key: key,
                            value: value,
                            string: true
                        }));
                    else
                        /* foreign SynQ token */;
                else if(value instanceof Object && !(value instanceof Function))
                    json.push(format('"#{key}": #{value}', {
                        key: key,
                        value: pack(value = Object.assign(value, {
                            constructor: Object
                        }), filter, space, space.length)
                    }));
                else if(value instanceof Object)
                    json.push(format('"#{key}": #{value}', {
                        key: key,
                        value: '{}'
                    }));
                else
                    json.push(format('"#{key}": "#{value}"', {
                        key: key,
                        value: value,
                        string: true
                    }));
            }

        let head = (type[0] || '') + (space? '\n': ''),
            tail = (space? '\n' + space.slice(indent, space.length): '') + (type[1] || '');

        function trim(array) {
            for(let index = 0, length = json.length; index < length; index++)
                if(array[index] === '' || array[index] === undefined)
                    array.splice(index, 1);
            return array;
        }

        for(let index = 0; index < max && !~json.indexOf(undefined); index++)
            trim(json);

        return (head + json.join(',' + (space? '\n': '')) + tail).replace(/\{\s*\}/g, '{}').replace(/(".+?"\:\s*)undefined\b/g, '$1null');
    };

    // Parse JSON strings
    SynQ.inflate = (string, mutator = (key, value) => value) => {
        let object,
            parse = SynQ.inflate,
            R = RegExp,
            type =
                /^\s*\{[^]*\}\s*$/.test(string)?
                    'object':
                /^\s*\[[^]*\]\s*$/.test(string)?
                    'array':
                'literal';

        switch(type) {
            case 'object':
                object = {};

                if(/^\s*\{(?:[,\s]*)?\}\s*$/.test(string))
                    break;
                else
                    for(let regexp = /\s*\{([^]*)\}\s*/g, dummy = (string = string.replace(/^\s*\{/, '^').replace(/\}\s*$/, '$')), layer; regexp.test(string);)
                        string = string.replace(regexp, ($0, $1, $$, $_) => {
                            for(let index = layer = 0; layer >= 0 && index < $1.length; index++)
                                layer += $1[index] == '{'? 1: $1[index] == '}'? -1: 0;

                            index -= +(layer < 0);

                            (dummy = $1.split('')).splice(index, 1, ')@');
                            dummy = dummy.join('');

                            return '@(' + dummy.slice(0, index).replace(/\{/g, '#(').replace(/\}/g, ')#') + dummy.slice(index, dummy.length) + (layer < 0 ? '}' : '');
                        });

                string = string
                /* All */
                    .replace(/#\(/g, '{')
                    .replace(/\)#/g, '}')
                /* First */
                    .replace(/@\(/, '{')
                    .replace(/\)@/, '}')
                    .split(/\s*("(?:[^\\"]|\\.)*?"\s*(?:\:\s*(?:null|true|false|\d+|"(?:[^\\"]|\\.)*?"|\[[^]*\]|\{[^]*\}|@\([^]*?\)@)(?=\s*,|(?:\s*,)?\s*\$\s*$))?)/)
                    .map(value => {
                        if(/^([\{\s,\}]+|[\^\$])$/.test(value = value.replace(/@\(/g, '{').replace(/\)@/g, '}')) || /^\^|\$$/.test(value))
                            return;

                        value.replace(/\s*"((?:[^\\"]|\\.)*?)"\s*(?:\:\s*(null|true|false|\d+|"(?:[^\\"]|\\.)*?"|\[[^]*\]|\{[^]*\}))?/);

                        return (R.$2 && R.$2.length)?
                            object[R.$1] = mutator(R.$1, parse(R.$2.replace(/^\^|\$$/g, ''), mutator)):
                        object[R.$1] = mutator(R.$1, R.$1.replace(/^\^|\$$/g, ''), mutator);
                    });
                break;

            case 'array':
                object = [];

                if(/^\s*\[\s*(?:,\s*)?\]\s*$/.test(string))
                    break;
                else
                    for(let regexp = /\s*\[([^]*)\]\s*/g, dummy = (string = string.replace(/^\[/, '^').replace(/\]$/, '$')), layer; regexp.test(string);)
                        string = string.replace(regexp, ($0, $1, $$, $_) => {
                            for(let index = layer = 0; layer >= 0 && index < $1.length; index++)
                                layer += $1[index] == '['? 1: $1[index] == ']'? -1: 0;

                            index -= +(layer < 0);

                            (dummy = $1.split('')).splice(index, 1, ')@');
                            dummy = dummy.join('');

                            return '@(' + dummy.slice(0, index).replace(/\[/g, '#(').replace(/\]/g, ')#') + dummy.slice(index, dummy.length) + (layer < 0 ? ']' : '');
                        });

                string = string
                /* All */
                    .replace(/#\(/g, '[')
                    .replace(/\)#/g, ']')
                /* First */
                    .replace(/@\(/, '[')
                    .replace(/\)@/, ']');

                let index = 0;

                string
                    .split(/\s*(null|true|false|\d+|"(?:[^\\"]|\\.)*?"|\[[^]*\]|\{[^]*\}|@\([^]*?\)@|\s*)(?=\s*,|(?:\s*,)?\s*\$\s*$)/)
                    .map(value => {
                        if(/^([\[\s,\]]+|[\^\$])$/.test(value = value.replace(/@\(/g, '[').replace(/\)@/g, ']')) || /^\^|\$$/.test(value))
                            return;

                        object.push(mutator(index++, parse(value.replace(/^\^|\$$/g, ''), mutator)));
                    });
                break;

            case 'literal':
            default:
                let isString, flags;

                object = (isString = /^"(.*)"$/.test(string))?
                    R.$1:
                string.length && +string <= +Infinity?
                    +string:
                /\b(true|false)\b/.test(string)?
                    !(string.length - 4):
                null;

                if(isString && /\$\=([imguy]+)$/.test(object)) {
                    flags = R.$1;
                    object = R(object.replace(R['$&'], ''), flags);
                }
                break;
            }

        return object;
    };

    // Help
    SynQ.help = (item = null) => {
        if(item === null)
            item = 'help';

        item = item.replace(/[^a-z\d]|synq([\.\-]|_token)/gi, '');

        let m, i = item.toLowerCase();

        switch(i) {
        /* HTML */
            case 'attr':
                m = "Synchronizes an element's attributes. The list should be space separated./~Usage: <% $-@=attributes-to-sync>...<\\%>/~Interpreted Type: Array//$-@: defaults to all attributes if no value is given.";
                break;

            case 'data':
                m = "Synchronizes an element's value, or innerText (priority to value)./~Usage: <% $-@>...<\\%>/~Interpreted Type: Boolean";
                break;

            case 'host':
                m = "Creates a main object (for multiple frames), and is given the highest priority. Also sets the element's [NAME] to its [ID], or [SYNQ-UUID]./~Usage: <% $-@=host-name>...<\\%>/~Interpreted Type: String";
                break;

            case 'html':
                m = "Synchronizes an element's outerHTML./~Usage: <% $-@>...<\\%>/~Interpreted Type: Boolean";
                break;

            case 'skip':
                m = "Delays synchronizing an element. Especially useful for multiple IFRAMEs with access to the parent document./~Usage: <% $-@=number-of-delays>...<\\%>/~Interpreted Type: Number//$-@: defaults to 0 if no value is given.";
                break;

            case 'text':
                m = "Synchronizes an element's innerHTML./~Usage: <% $-@>...<\\%>/~Interpreted Type: Boolean";
                break;

            case 'uuid':
                m = "The UUID that $ generates for each synchronized element./~Usage: <% $-@=static-uuid>...<\\%>/~Interpreted Type: String//$-@: if you set [$-@], all copies of the element (including across frames) will need to have the same value. Otherwise, SynQ will handle this assignment automatically.";
                break;

            /* JS */
            case 'addeventlistener':
                m = "Adds an event listener to $'s {events} method./~Usage: $.@(event-name, callback)/~Arguments: String, Function/~Returns: Number//event-name: {events}./return: the number of events attached.";
                break;

            case 'append':
                m = "Pushes data to a global array./~Usage: $.@(array-name, data[, key[, delimiter]])/~Arguments: String, String[, String[, String]]/~Returns: <array-name>//key: {key}.";
                break;

            case 'clear':
                m = "Removes all owned items from storage (related to $)./~Usage: $.@([remove-all])/~Arguments: [Boolean]/~Returns: Undefined//remove-all: if set to true, will remove all private items too.";
                break;

            case 'decodeurl':
                m = "Decodes a URL string (e.g. '%20' -> ' ')./~Usage: $.@(URL)/~Arguments: String/~Returns: String";
                break;

            case 'deflate':
                m = "Polyfill of JSON.stringify. Defaltes\\serializes objects (turns them into strings)./~Usage: $.@(object[, filter[, spaces]])/~Arguments: *[, Function[, String | Number]]/~Returns: String => '<object>'//object: any JavaScript object./filter: searches for true\\non-empty entries. Called on as:/~for(var key in <object>)/~~<filter>(key, <object>[key]);//spaces: if set, then the ouput will be stylised using indentation.";
                break;

            case 'download':
                m = "Retruns data from the global storage item (see also, '$.get')./~Usage: $.@(name[, key])/~Arguments: String[, String]/~Returns: String//key: {key}.";
                break;

            case 'encodeurl':
                m = "Encodes a URL string (e.g. ' ' -> '%20')./~Usage: $.@(URL)/~Arguments: String/~Returns: String";
                break;

            case 'esc':
                m = "The list delimeter for $ to use when storing element values./~Usage: $.@ = delimeter/~Types: String/~Current: '{esc}'/~Default: '%%'";
                break;

            case 'export':
                m = "Exports (copies) data to the storage object./~Usage: $.@(name)/~Arguments: String~/Returns: <name>";
                break;

            case 'eventlistener':
                m = "The Event Listener for $ (fires automatically from $)./~Usage: $.@(event)/~Arguments: Object/~Returns: Undefined";
                break;

            case 'find':
                m = "Searches $ for the given item(s). Can also traverse foreign (unowned) entries./~Usage: $.@(query[, search-private[, previous-finds]])/~Arguments: Array | RegExp | String[, Boolean[, Array]]//query: if you have a $ URL to another site (verbatim), you can search its entries via:/~synq:{uuid}\\?auth=<BtoA {username}:{password}>&all=<search-private>&query=<query>&query=...//previous-finds: used to prevent $ from duplicating entries/URL => auth: btoa(username + ':' + password), only used for VPN searches, where 'password' is the original key (before being signed)";
                break;

            case 'get':
                m = "Returns data from the local storage item./~Usage: $.@(name[, key])/~Arguments: String[, String]/~Returns: String//key: {key}.";
                break;

            case 'help':
                m = "Displays help messages./~Usage: $.@(item-name)/~Arguments: String/~Returns: String";
                break;

            case 'export':
                m = "Imports (copies) data from the storage object./~Usage: $.@(name)/~Arguments: String~/Returns: <name>";
                break;

            case 'inflate':
                m = "Polyfill of JSON.parse. Inflates\\deserializes strings (turns them into objects)./~Usage: $.@(json-string[, mutator])/~Arguments: String[, Function]/~Returns: Array | Boolean | Object | Number | String | null | undefined => <object>//string: a JSON compliant string./mutator: mutates each entry. Called on as:/~for(var key in <object>)/~~<mutator>(key, <object>[key]);";
                break;

            case 'isnan':
                m = "Tests to see if an object is a number or not./~Usage: @(object)/~Arguments: */~Returns: Boolean";
                break;

            case 'last':
                m = "An array that's used to hold each item's name in the order they're created./~Usage: $.@ = ['name-1', 'name-2'...]/~Types: Array";
                break;

            case 'lastupload':
                m = "An array that's used to hold each item's name in the order they're created./~Usage: $.@ = ['name-1', 'name-2'...]/~Types: Array";
                break;

            case 'list':
                m = "Returns the currently owned storage items./~Usage: $.@([show-all])/~Arguments: Boolean/~Returns: Object//show-all: when set to true, will return private items as well.";
                break;

            case 'lock':
            case 'unlock':
                m = "Locks and unlocks a string./~Usage: $.@(data, key)/~Arguments: String, String/~Returns: String";
                break;

            case 'pack':
                m = "Packs (encodes) a UTF-8 string into UTF-16 characters./~Usage: $.@(string)/~Arguments: String/~Return: String => UTF16";
                break;

            case 'pack16':
                m = "Packs (encodes) a UTF-16 character, by using two UTF-8 characters./~Usage: $.@(character[, character])/~Arguments: Character[, Character]/~Returns: String//return: if the second character is missing, then the first character will be returned.";
                break;

            case 'parsefunction':
                m = "Returns an array of function data./~Usage: $.@(function-string)/~Arguments: String/~Returns: Array => {0: [function parameters], 1: [function statements], 2: [function name], length: 3}";
                break;

            case 'parsesize':
                m = "Returns a number from an SI formatted* string./~Usage: $.@(number[, base[, symbol]])/~Arguments: String[, Number[, String]]/~Returns: Number//* Does not recognize 'd' (deci), 'h' (hecto) or 'c' (centi)";
                break;

            case 'parseurl':
                m = "Returns a URL object./~Usage: $.@(URL)/~Arguments: String/~Returns: Object => {href, origin, protocol, scheme, username, password, host, port, path, search, searchParameters, hash}";
                break;

            case 'ping':
                m = "Pings an address. If no address is given, then pings a random address. Powered by Lorem Picsum (https:picsum.photos)./~Usage: $.@(address[, options])/~Arguments: String[, Object => {callback, pass, fail, timeout}]/~Returns: Undefined//address: must be an address to an image./return: calls on <callback> using: <callback>.call(null, ping.trip);//ping.trip => {/~address: <address>/~resolve: [image address]/~size: [image height * image.width]/~speed: [image size \\ time]/~status: 'pass' | 'fail'/~time: [ping time]/~uplink: [speed \\ 2]/}";
                break;

            case 'pop':
                m = "Removes, and returns the item from the local storage./~Usage: $.@([name[, key]])/~Argumments: [String[, String]]/~Returns: String//name: the name of the item to fetch. If left empty, will use the name of the last item created./key: {key}.";
                break;

            case 'prevent':
                m = "Used to prevent a value from being used./~Usage: $.@(value-to-test, illegal-values, error-message[, helper-link])/~Arguments: Array | String, Array | RegExp, String[, String]/~Returns: Undefined/~Throws: Error(<message[ + helper-link]>)//helper-link: the word, or phrase used by $.help to display the help message,/~~e.g. $.prevent($.doesNotExist, [null, undefined], 'This is an example error', 'example')/~~throws Error => 'This is an eample error, see $.help('example')'.";
                break;

            case 'pull':
                m = "Returns data from a local storage array./~Usage: $.@(array-name[, key[, delimiter]])/~Arguments: String[, String[, String]]/~Returns: Array//key: {key}";
                break;

            case 'push':
                m = "Pushes data to a local storage array (delimited by $.esc)./~Usage: $.@(array-name, data[, key])/~Arguments: String, String[, String]/~Returns: String<array-name>//key: {key}";
                break;

            case 'recall':
                m = "Gets data from a global array (see also, '$.pull')./~Usage: $.@(array-name[, key[, delimiter]])/~Arguments: String[, String[, String]]/~Returns: Array//key: {key}";
                break;
            case 'removeeventlistener':
                m = "Removes a(n) event listener(s)./~Usage: $.@(function-name[, event-name])/~Arguments: String[, String]/~Returns: Array | String//event-name: {events}./~If left empty, will remove <function-name> from every event.";
                break;

            case 'salt':
                m = "Salts (encrypts) a string, usually a password./~Usage: $.@(string)/~Arguments: String/~Returns: String";
                break;

            case 'set':
                m = "Adds the item to storage./~Usage: $.@(name, data[, key])/~Arguments: String, String[, String]/~Returns: <name>//key: {key}.";
                break;

            case 'sign':
                m = "Hashes a string (think of SHA, or MD5)./~Usage: $.@(string[, fidelity-level])/~Arguments: String[, Float]/~Returns: String//fidelity-level: determines the size of the returned string. The closer to 1 the level is, the shorter the string.";
                break;

            case 'signature':
                m = "The UUID of the current page (if use_global# is undefined), or current domain.//Current Signature: {signature}/Global Token Flag: {global#}";
                break;

            case 'size':
                m = "1. Returns the maximum amount of space for the storage (in bytes; 1B = 8b)/~Usage: $.@()/~Arguments: NONE/~Returns: Integer//2. Returns the SI formatted version of the given number./~Usage: $.@(number[, base[, symbol]])/~Arguments: Number[, Number[, String]]/~Returns: String//base: the base to use, e.g. 1000; default is 1024./symbol: the symbol to append to the returned string, default is 'iB'.";
                break;

            case 'snip':
                m = "Removes, and returns the item from the global storage (see also, '$.pop')./~Usage: $.@(name[, key])/~Arguments: String[, String]/~Returns: String//key: {key}.";
                break;

            case 'syn':
                m = "The attribute name(s) for elements to update./~Usage: $.@ = ['name-1', 'name-2'...]/~Types: Array | String/~Default: {syn}";
                break;

            case 'synq':
                m = "The main function and container. Updates the storage, while also updating all 'attached' elements./~Usage: $([attribute-names])/~Arguments: String | Array/~Returns: Undefined//attribute-name: if you want to use multiple names, you can also set $.syn";
                break;

            case 'triggerevent':
                m = "Triggers all event listeners for an event./~Usage: $.@(event-name[, data])/~Arguments: String[, Array]/~Returns: <data>//data: the arguments to pass onto each listener.";
                break;

            case 'unpack':
                m = "Unacks (decodes) a UTF-16 string into UTF-8 characters./~Usage: $.@(string)/~Arguments: String/~Return: String => {UTF8}";
                break;

            case 'unpack16':
                m = "Unpacks (decodes) a UTF-16 character into two UTF-8 characters./~Usage: $.@(character)/~Arguments: Character/~Returns: String//return: automatically handles UTF-8 characters, and returns the character iteslf.";
                break;

            case 'upload':
                m = "Adds data to global storage (see also, '$.set')./~Usage: $.@(name[, data[, key]])/~Arguments: String[, String[, String]]/~Returns: String//return: a UUID for the data./data: if no data is given, still returns the UUID./key: {key}.";
                break;

            case 'used':
                m = "Returns the number of bytes (1B = 8b) in use./~Usage: $.@([$-only])/~Arguments: [Boolean]/~Returns: Integer//$-only: when set to true, will ony return the amount of owned space $ is using.";
                break;

            case 'usecookie':
                m = "Forces the page to use cookies instead of the localStorage./This may increase storage capcity on some browsers*, but not all. See the table below.//Browser (version)/~UTF-16 \\ UTF-8//Chrome (65.0.3325.181)/~22 \\ 44 MiB/Firefox (59.0.2)/~22 \\ 44 MiB/Opera (52.0.2871.40)/~22 \\ 44 MiB/Safari (7534.57.2)**/~22 \\ 44 B/Edge (41.16299.248.0)/~22 \\ 44 MiB/Internet Explorer (11.309.16299.0)**/~32 \\ 64 B//* Obtained values by hand (Windows 10 PC, x64)./** Note that this browser wasn't intended for my machine. Also, the cookie size can be changed by the user.";
                break;

            case 'useuuid':
                m = "TODO!Forces $ to use the assigned value as the 'UUID.'/This can be useful for dynamic pages that change their name often (like CodePen's debug feature), but still need a static ID.//Basically, a manual, selective version of 'global#'";
                break;

            case 'useglobal':
                m = "Used to determine if $ should use a local* or global** name.//* $ will save all data for the current URL only, i.e. http:github.com\\page-1 will not have access to http:github.com\\page-2./** $ will save all data for the current host, i.e. http:github.com will be used by $, instead of http:github.com\\page-n.";
                break;

            case 'useutf16':
                m = "Used to instruct $ to save data as UTF-16 streams, e.g. 'acdf' will be combined into 'be' (as an example)./It does this by combining UTF-8 characters (\u0000 - ÿ), and generating a UTF-16 character (Ā - ￿).";
                break;

            case 'usevpn':
                m = "Forces $ to use a VPN-like setup with a 'private' session. This uses sessionStorage; a one-time, non-iterable signature; and a forced local state./~Usage: vpn# = <value>/~Interpreted Type: String";
                break;

            case '':
            case '*':
                m = "Help can be used for the following items://<!-- HTML -->//$-attr/$-data/$-host/$-html/$-skip/$-text/$-uuid//\\* JavaScript *\\//ping/$/~addEventListener/~append#push/~clear/~decodeURL/~deflate/~download#get/~enocdeURL/~esc/~eventlistener/~find/~get/~help/~host/~inflate/~last/~list/~lock/~pack/~pack16/~parseFunction/~parseSize/~parseURL/~pop/~prevent/~pull/~push/~recall#pull/~removeEventListener/~salt/~set/~sign/~signature/~size/~snip#pop/~syn/~triggerEvent/~unlock/~unpack/~unpack16/~upload#set/~used/cookie#/global#/utf16#/uuid#/vpn#";
                break;

            default:
                m = "Sorry, couldn't find '@'; try $.help('*') to list all items that have help messages.";
                break;
            }

            m = (`/${ m }/`)
                .replace(/\bTODO!/, "This feature (@) is not yet ready, but is planned for future releases./Please note that the documentation for '@' is not final, and may change or be removed.//")
                .replace(/\//g, '\n')
                .replace(/~/g, '\t')
                .replace(/\\/g, '/')
                .replace(/\$-/g, 'synq-')
                .replace(/\$/g, 'SynQ')
                .replace(/\b(?:use_?)?(\w+)#(?!\b)/g, 'use_synq_token_$1')
                .replace(/%/g, 'element')
                .replace(/#(\w+)/g, ' - Global $1')
                .replace(/@/g, item)
                .replace(/\b(https?|synq)\:/g, '$1://')
                .replace(/(\w+\s+\|(?:[\w \|]+?))( ?[^\w |])/g, '($1)$2')
                .replace(/\B'([^']+?)'\B/g, '"$1"')
                .replace(/\{key\}/gi, 'the password to lock/unlock the data with')
                .replace(/\{events\}/gi, SynQ.events.split(' ')
                    .join(', ')
                    .replace(/(.+),\s*(.+?)$/, '$1, or $2')
                )
                .replace(/\{syn\}/gi, '["' + SynQ.syn.join('","') + '"]');

            for(let r = /\{(\w+?)\}/g, e = [], i = 0; r.test(m) && !~e.indexOf(RegExp['$&']);)
                m = m.replace(r, ($0, $1, $$, $_) =>
                    ($1 in SynQ)?
                        SynQ[$1]:
                    ($1 in window)?
                        window[$1]:
                    e[i++] = $0
                );

            return m;
    };

    /* Polyfills */
    // localStorage - Mozilla
    if(!('localStorage' in win) || (use_synq_token_cookie !== undefined && !SA))
        Object.defineProperty(win, 'localStorage', new(function() {
            let keys = [],
                StorageObject = {},
                onstorage;

            try {
                onstorage = new CustomEvent('storage', {
                    bubbles: false,
                    cancelable: false,
                    composed: true,
                });
            } catch(error) {
                onstorage = win.onstorage;
            }

            Object.defineProperty(StorageObject, 'getItem', {
                value: key => (
                    key?
                        this[key]:
                    null
                ),
                writable: false,
                configurable: false,
                enumerable: false,
            });

            Object.defineProperty(StorageObject, 'key', {
                value: keyID => keys[keyID],
                writable: false,
                configurable: false,
                enumerable: false,
            });

            Object.defineProperty(StorageObject, 'setItem', {
                value: (key = null, value) => {
                    if(key === null)
                        return;

                    doc.cookie = `${ escape(key) }=${ escape(value) };expires=Thu, Dec 31 2099 23:59:59 GMT;path=/`;
                    win.dispatchEvent(onstorage);
                },
                writable: false,
                configurable: false,
                enumerable: false,
            });

            Object.defineProperty(StorageObject, 'length', {
                get: () => keys.length,
                configurable: false,
                enumerable: false,
            });

            Object.defineProperty(StorageObject, 'removeItem', {
                value: (key = null) => {
                    if(key === null)
                        return;

                    doc.cookie = `${ escape(key) }=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                    win.dispatchEvent(onstorage);
                },
                writable: false,
                configurable: false,
                enumerable: false,
            });

            Object.defineProperty(StorageObject, 'clear', {
                value: () => {
                    if(keys.length === undefined || keys.length === null)
                        return;

                    for(let key in keys)
                        doc.cookie = `${ escape(key) }=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                    win.dispatchEvent(onstorage);
                },
                writable: false,
                configurable: false,
                enumerable: false,
            });

            Object.defineProperty(StorageObject, 'type', {
                value: 'cookie',
                writable: false,
                configurable: false,
                enumerable: false,
            });

            this.get = () => {
                for(let key in StorageObject) {
                    let index = keys.indexOf(key);

                    if(index == -1)
                        StorageObject.setItem(key, StorageObject[key]);
                    else
                        keys.splice(index, 1);

                    delete StorageObject[key];
                }

                for(;keys.length > 0; keys.splice(0, 1))
                    StorageObject.removeItem(keys[0]);

                for(let cookie, key, index = 0, cookies = doc.cookie.split(/\s*;\s*/); index < cookies.length; index++) {
                    cookie = cookies[index].split(/\s*=\s*/);

                    if(cookie.length > 1) {
                        key = unescape(cookie[0]);
                        StorageObject[key] = unescape(cookie[1]);
                        keys.push(key);
                    }
                }

                return StorageObject;
            };

            this.configurable = false;
            this.enumerable = true;
        })());

    storage = (use_synq_token_vpn === undefined)?
        win.localStorage:
    win.sessionStorage || win.localStorage;

    // navigator.connection - Mozilla, Ephellon
    if(!('connection' in nav))
        Object.defineProperty(win, 'NetworkInformation', new(function() {
            let NetworkObject = {},
                onnetwork;

            try {
                onnetwork = new CustomEvent("online", {
                    bubbles: false,
                    cancelable: false,
                    composed: true
                });
            } catch(error) {
                onnetwork = null;
            }

            ping('', {
                callback: TripInformation => {
                    let k = 1000,
                        M = k * k,
                        t = TripInformation,
                        s = t.speed,
                        m = t.time,
                        r = (x, y) => (x / y) - ((x / y) % y);

                    s = r(s, 25);
                    m = r(m, 25);

                    Object.defineProperty(NetworkObject, 'downlink', {
                        value: s,
                        writable: false,
                        configurable: false,
                        enumerable: true,
                    });

                    Object.defineProperty(NetworkObject, 'downlinkMax', {
                        value: s,
                        writable: false,
                        configurable: false,
                        enumerable: true,
                    });

                    Object.defineProperty(NetworkObject, 'effectiveType', {
                        value: (speed => {
                            if(speed < 500)
                                return '4g';
                            if(speed < 500 * k)
                                return '3g';
                            if(speed < 500 * M)
                                return '2g';
                            return 'slow-2g';
                        })(s),
                        writable: false,
                        configurable: false,
                        enumerable: true,
                    });

                    Object.defineProperty(NetworkObject, 'onchange', {
                        value: null,
                        writable: true,
                        configurable: false,
                        enumerable: true,
                    });

                    Object.defineProperty(NetworkObject, 'rtt', {
                        value: m,
                        writable: false,
                        configurable: false,
                        enumerable: true,
                    });

                    Object.defineProperty(NetworkObject, 'saveData', {
                        value: false,
                        writable: true,
                        configurable: false,
                        enumerable: true,
                    });

                    Object.defineProperty(NetworkObject, 'type', {
                        value: 'unknown',
                        writable: false,
                        configurable: false,
                        enumerable: true,
                    });
                }
            });

            this.get = () => NetworkObject;
            this.configurable = false;
            this.enumerable = true;
        })());

    connection = nav.connection;

    /* Setup and auto-management */
    // Auto-update & run
    if(use_synq_token_uuid !== undefined)
        Object.defineProperty(SynQ, 'signature', {
            value: `synq://${ use_synq_token_uuid }/`,
            writable: false,
            configurable: false,
            enumerable: true,
        });
    else if(use_synq_token_vpn !== undefined)
        Object.defineProperty(SynQ, 'signature', {
            value: `synq://${ SynQ.sign(+(new Date)) }:${ use_synq_token_vpn = SynQ.sign(use_synq_token_vpn, 0.75) }@${ SynQ.sign(location, 1) }:443/`,
            writable: false,
            configurable: false,
            enumerable: true,
        });
    else if(use_synq_token_global !== undefined)
        Object.defineProperty(SynQ, 'signature', {
            value: `synq://${ SynQ.sign(location.origin, 1) }/`,
            writable: false,
            configurable: false,
            enumerable: true,
        });
    else
        Object.defineProperty(SynQ, 'signature', {
            value: `synq://${ SynQ.sign(location.origin + location.pathname) }/`,
            writable: false,
            configurable: false,
            enumerable: true,
        });

    SynQ.eventName = '.events';
    SynQ.events = 'set get pop push pull upload download snip append recall import export clear copy';
    SynQ.last = [];
    SynQ._last = [];
    SynQ.host = null;
    SynQ.shadow = null;
    SynQ[__] |= 0;

    SynQ.EventListener();

    win.addEventListener('storage', win.onstorage = SynQ.EventListener, false);
})();
