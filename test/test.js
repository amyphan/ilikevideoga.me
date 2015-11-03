var assert = require('assert');
describe('Array', function() {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    });
  });
});

var assert1 = require('assert');
describe('String#split', function() {
  it('should return an array', function(){
	assert(Array.isArray('a,b,c'.split(',')));
  });
})
