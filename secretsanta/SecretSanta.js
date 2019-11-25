var SecretSanta = (function() {
    // Secret Santa

    var SecretSanta = function(listNames, seed, output) {
        this.giver = listNames;
        this.seed = seed;
        this.output = output;
        this.currentGiver = Cookies.get("giver");
        this.currentSeed = Cookies.get("seed");
        this.valid = true;

        if (isNaN(seed)) {
            this.errorMessage = "Errore: seed non definito";
            this.valid = false;
            return;
        }

        // A date after Christmas
        var now = new Date();
        this.afterXmasDate = new Date();
        this.afterXmasDate.setDate(26);
        this.afterXmasDate.setMonth(11);  // 0-based
        if (now.getTime() > this.afterXmasDate.getTime()) {
            this.afterXmasDate.setYear(this.afterXmasDate.getFullYear() + 1);
        }

        var valid = false;
        while (!valid) {
            var mt = new MersenneTwister(this.seed);
            this.receiver = Array.from(this.giver); // copy

            // Shuffle (Fisher-Yates)
            // See: https://medium.com/@nitinpatel_20236/how-to-shuffle-correctly-shuffle-an-array-in-javascript-15ea3f84bfb
            for (var i=this.receiver.length-1; i>0; i--) {
                var j = Math.floor(mt.random() * i);
                var tmp = this.receiver[i];
                this.receiver[i] = this.receiver[j];
                this.receiver[j] = tmp;
            }

            // Check if I have elements in the same position (no giver == receiver)
            for (var i=0; i<this.giver.length; i++) {
                if (this.giver[i] == this.receiver[i]) {
                    this.seed += 13;
                    console.log("Attention: seed updated to " + this.seed);
                    valid = false;
                    break;
                }
            }

            console.log("Extraction done with seed " + this.seed);
            valid = true;
        }
    };

    SecretSanta.prototype.drawError = function(msg) {
        // Error

        this.output.innerHTML = "";
        var div = document.createElement("H2");
        div.innerHTML = msg;
        this.output.appendChild(div);
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
        h2.innerHTML = "Se sei qua stai barando!";
        this.output.appendChild(h2);

        for (var i=0; i<this.giver.length; i++) {
            var span = document.createElement("SPAN");
            span.innerHTML = "🎅 " + this.giver[i] + "<br> ⭐ " + this.receiver[i];
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
