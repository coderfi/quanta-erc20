var Token = artifacts.require("./QuantaToken.sol");
var BigNumber = require('bignumber.js');
var Helpers = require('./helpers.js');

////////////////////////////////////////////////////////////////////////////////

var tokenContract;

var tokenOwner;
var tokenAdmin;

var tokenOwnerAccount;
var nonOwnerAccount;

var totalSupply = new BigNumber(400000000 * (10**9));

var erc20TokenContract;

contract('token contract', function(accounts) {

  beforeEach(function(done){
    done();
  });
  afterEach(function(done){
    done();
  });

  it("mine one block to get current time", function() {
    return Helpers.sendPromise( 'evm_mine', [] );
  });

  it("deploy token and init accounts", function() {
    tokenOwner = accounts[0];
    tokenAdmin = accounts[1];
    
    var currentTime = web3.eth.getBlock('latest').timestamp;

    return Token.new({from: tokenOwner}).then(function(result){
      tokenContract = result;
      
      // check total supply
      return tokenContract.totalSupply();        
    }).then(function(result){
      assert.equal(result.valueOf(), totalSupply.valueOf(), "unexpected total supply");
    });
  });
  
  it("transfer before transfer start time", function() {
    var value = new BigNumber(5);
    return tokenContract.transfer(accounts[2], value, {from:tokenOwner}).then(function(){
        // get balances
        return tokenContract.balanceOf(tokenOwner);
      }).then(function(result){
        assert.equal(result.valueOf(), totalSupply.minus(value).valueOf(), "unexpected balance");
        return tokenContract.balanceOf(accounts[2]);
      }).then(function(result){
        assert.equal(result.valueOf(), value.valueOf(), "unexpected balance");    
      });
  });

  it("transfer from owner when transfers started", function() {
    var value = new BigNumber(5);
    return tokenContract.transfer(accounts[2], value, {from:tokenOwner}).then(function(){
        // get balances
        return tokenContract.balanceOf(tokenOwner);
      }).then(function(result){
        assert.equal(result.valueOf(), totalSupply.minus(value.mul(2)).valueOf(), "unexpected balance");
        return tokenContract.balanceOf(accounts[2]);
      }).then(function(result){
        assert.equal(result.valueOf(), value.mul(2).valueOf(), "unexpected balance");    
      });
  });

  it("transfer from non owner when transfers started", function() {
    var value = new BigNumber(5);
    return tokenContract.transfer(accounts[1], value, {from:accounts[2]}).then(function(){
        assert.fail("transfer is during sale is expected to fail");
    }).catch(function(error){
        assert( true, "expected throw got " + error);    
    });
  });

  it("unpause contract", function () {
    return tokenContract.pause(false, false);
  });
  
  it("transfer more than balance", function() {
    var value = new BigNumber(101);
    return tokenContract.transfer(accounts[8], value, {from:accounts[7]}).then(function(){
        assert.fail("transfer should fail");                
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("transfer to address 0", function() {
    var value = new BigNumber(1);
    return tokenContract.transfer("0x0000000000000000000000000000000000000000", value, {from:accounts[7]}).then(function(){
        assert.fail("transfer should fail");                
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("transfer to token contract", function() {
    var value = new BigNumber(1);
    return tokenContract.transfer(tokenContract.address, value, {from:accounts[7]}).then(function(){
        assert.fail("transfer should fail");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });
  
  it("approve more than balance", function() {
    var value = new BigNumber(180);
    return tokenContract.approve(accounts[9], value, {from:accounts[8]}).then(function(){
        return tokenContract.allowance(accounts[8],accounts[9]);
    }).then(function(result){
        assert.equal(result.valueOf(), value.valueOf(), "unexpected allowance");
    });
  });

  it("transferfrom more than balance", function() {
    var value = new BigNumber(180);  
    return tokenContract.transferFrom(accounts[8], accounts[7], value, {from:accounts[9]}).then(function(){
        assert.fail("transfer should fail");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("transferfrom to address 0", function() {
    var value = new BigNumber(10);  
    return tokenContract.transferFrom(accounts[8], "0x0000000000000000000000000000000000000000", value, {from:accounts[9]}).then(function(){
        assert.fail("transfer should fail");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });

  it("transferfrom to token contract", function() {
    var value = new BigNumber(10);  
    return tokenContract.transferFrom(accounts[8], tokenContract.address, value, {from:accounts[9]}).then(function(){
        assert.fail("transfer should fail");
    }).catch(function(error){
        assert( Helpers.throwErrorMessage(error), "expected throw got " + error);    
    });
  });
  
  it("transfer from owner when transfers started", function() {
    var value = new BigNumber(100);
    return tokenContract.transfer(accounts[5], value, {from:tokenOwner});
  });

  it("mine one block to get current time", function() {
    return Helpers.sendPromise( 'evm_mine', [] );
  });

  it("deploy token and init accounts", function() {
    var currentTime = web3.eth.getBlock('latest').timestamp;

    return Token.new({from: accounts[5]}).then(function(result){
      erc20TokenContract = result;
      return erc20TokenContract.transfer(tokenContract.address,new BigNumber(1),{from:accounts[5]});
    }).then(function(){
      // check balance
      return erc20TokenContract.balanceOf(tokenContract.address);
    }).then(function(result){
      assert.equal(result.valueOf(),(new BigNumber(1)).valueOf(), "unexpected balance" );          
    });
  });

});
