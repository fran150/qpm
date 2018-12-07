var fs = require("fs-extra");
var qpm = require("../qpm")

describe("Install command tests", function() {
    beforeAll(function(done) {
        fs.remove("./spec/mocks/bower_modules", function(err) {
            if (err) {
                done(err);
            } else {
                fs.remove("./spec/mocks/app/require.config.js", function(err) {
                    if (err) {
                        done(err);
                    } else {
                        fs.copy("./spec/mocks/app/require.config.1.js", "./spec/mocks/app/require.config.js", function(err) {
                            if (err) {
                                done(err);
                            } else {
                                qpm.install("qk-alchemy", { 
                                    base: "./spec/mocks", 
                                    config: './spec/mocks/app/require.config.js'
                                }, done);
                            }
                        })
                    }
                })
            }
        })
    }, 50000)

    it('Must be always true', function() {
        expect(true).toBeTruthy();
    })
})