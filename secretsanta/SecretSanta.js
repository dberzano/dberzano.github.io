var SecretSanta = (function() {
    // Secret Santa

    var SecretSanta = function(listNames, seed, output) {
        this.giver = listNames;
        this.seed = seed;
        this.output = output;
        this.currentGiver = Cookies.get("giver");
        this.currentSeed = Cookies.get("seed");

        // A date after Christmas
        var now = new Date();
        this.afterXmasDate = new Date();
        this.afterXmasDate.setDate(26);
        this.afterXmasDate.setMonth(11);  // 0-based
        if (now.getTime() > this.afterXmasDate.getTime()) {
            this.afterXmasDate.setYear(this.afterXmasDate.getFullYear() + 1);
        }

        var mt = new MersenneTwister(this.seed);
        var ary = Array.from(this.giver);
        this.receiver = [];
        while (ary.length) {
            var rn = Math.round(mt.random() * (ary.length - 1));
            if (this.giver[this.receiver.length] == ary[rn]) {
                // no gifts to oneself
                if (ary.length == 1) {
                    var lbo = this.receiver.pop();
                    this.receiver.push(ary[0]);
                    this.receiver.push(lbo);
                    break;
                }
                else continue;
            }
            this.receiver.push(ary.splice(rn, 1)[0]);
        }
    };

    SecretSanta.prototype.drawLanding = function() {
        if (this.currentGiver && this.currentSeed == this.seed) {
            this.drawSecretSanta(this.currentGiver);
        }
        else {
            this.drawWhoYouAre();
        }
    };

    SecretSanta.prototype.getReceiver = function(giver) {
        // Get receiver for a certain giver

        for (var i=0; i<this.giver.length; i++) {
            if (this.giver[i] == giver) return this.receiver[i];
        }
        return undefined;
    };

    SecretSanta.prototype.drawSecretSanta = function(giver) {
        // Draw the Secret Santa for a certain person

        this.output.innerHTML = "";
        var div = document.createElement("DIV");
        div.className = "result";
        div.innerHTML = giver + ", sarai il Babbo Natale segreto di <b>" + this.getReceiver(giver) + "</b>!";
        this.output.appendChild(div);
    };

    SecretSanta.prototype.drawPairs = function() {
        // Draw pairs. For debug only. To you people who understand JavaScript: runnning it is
        // cheating!

        this.output.innerHTML = "";
        var h2 = document.createElement("H2");
        h2.innerHTML = "Pairs";
        this.output.appendChild(h2);

        for (var i=0; i<this.giver.length; i++) {
            var span = document.createElement("SPAN");
            span.innerHTML = this.giver[i] + " ➡ " + this.receiver[i];
            this.output.appendChild(span);
        }
    };

    SecretSanta.prototype.drawWhoYouAre = function() {
        // Draw who you are question

        this.output.innerHTML = "";
        var h2 = document.createElement("H2");
        h2.innerHTML = "Chi sei?";
        this.output.appendChild(h2);

        for (var i=0; i<this.giver.length; i++) {
            var span = document.createElement("SPAN");
            span.innerHTML = this.giver[i];
            span.dataset.giver = this.giver[i]; // data-giver
            var that = this;  // "this" inside event handler
            span.onclick = function() {
                that.drawSecretSanta(this.dataset.giver);
                Cookies.set("giver", this.dataset.giver, that.afterXmasDate);
                Cookies.set("seed", that.seed);
            };
            this.output.appendChild(span);
        }
    };

    return SecretSanta;
})();
