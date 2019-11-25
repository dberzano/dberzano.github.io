var Cookies = (function() {

    // Simplified cookies library

    Cookies = {};

    Cookies.set = function(name, value, date) {
        var expires = date ? "; expires=" + date.toUTCString() : "";
        document.cookie = name + "=" + value + expires + "; path=/";
    };

    Cookies.get = function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    };

    Cookies.unset = function(name) {
        var yesteryear = new Date();
        yesteryear.setYear(yesteryear.getFullYear() - 1);
        Cookies.set(name, "", yesteryear);
    };

    Cookies.getQuery = function() {
        var q = new Map();
        var raw = window.location.search;
        if (raw[0] == "?") raw = raw.substring(1);
        raw.split("&").forEach(function(tok) {
            var idx = tok.indexOf("=");
            var key = null;
            var val = null;
            if (idx == -1) {
                key = decodeURIComponent(tok);
                val = true;
            }
            else if (idx > 0) {
                key = decodeURIComponent(tok.substring(0, idx));
                val = decodeURIComponent(tok.substring(idx + 1));
            }
            // idx == 0 is invalid
            if (key) {
                q.set(key, val);
            }
        });
        return q;
    };

    return Cookies;
})();
