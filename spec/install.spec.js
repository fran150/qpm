var qpm = require("../qpm")

describe("Install command tests", function() {
    beforeAll(function(done) {
        qpm.install("qk-alchemy", { 
            base: "./spec/mocks", 
            config: './spec/mocks/app/require.config.js' 
        }, done);        
    }, 50000)

    it('Must be always true', function() {
        expect(true).toBeTruthy();
    })
})