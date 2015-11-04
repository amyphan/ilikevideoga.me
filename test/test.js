var assert = require('assert');
describe ('addition', function (){
it('should add 1+1 correctly',function(){
  var num = 1 + 1;
  assert.equal(num,2);
  });
});

var assert1 = require('assert');
describe('String#split', function() {
  it('should return an array', function(){
	assert(Array.isArray('a,b,c'.split(',')));
  });
})
