angular.module('HaskoinApp')
    ////////////////////////////////////////////////////////////////////////////
    .factory('APIService', ['$resource', 
      function($resource) {
        return {
          wallets:      $resource('/wallets/:wname', 
                                  { wname:'@wname'}
                        ),
          accounts:     $resource('/wallets/:wname/accounts/:aname',
                                  { wname:'@wname', aname:'@aname'}, 
                                  { update: {method: 'PUT'} }
                        ),
          addKeys:      $resource('/wallets/:wname/accounts/:aname/keys',
                                  { wname:'@wname', aname:'@aname'}                                   
                        ),
          accBalance:   $resource('/wallets/:wname/accounts/:aname/balance', 
                                  { wname:'@wname', aname:'@aname'}
                        ),
          addresses:    $resource('/wallets/:wname/accounts/:aname/addrs', 
                                  { wname:'@wname', aname:'@aname'}
                        ),
          address:      $resource('/wallets/:wname/accounts/:aname/addrs/:key', 
                                  { wname:'@wname', aname:'@aname', key:'@key'},
                                  { update: {method: 'PUT'}}
                        ),
          transactions: $resource('/wallets/:wname/accounts/:aname/txs', 
                                  { wname:'@wname', aname:'@aname'}
                        ),
          node:         $resource('/node'),
          transaction:  $resource('/wallets/:wname/accounts/:aname/txs/:txhash', 
                                  { wname:'@wname'
                                  , aname:'@aname'
                                  , txhash:'@txhash'}
                        )  
          };
    }]);
