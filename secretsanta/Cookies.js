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

    return Cookies;
})();
