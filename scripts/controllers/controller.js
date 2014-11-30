angular.module('HaskoinApp', ['monospaced.qrcode'
                             ,'ngResource'
                             ,'ui.bootstrap'])
    .controller('WalletCtrl', ['APIService',
      function(APIService){
        var self = this;

        // get initial selection
        self.wallets = APIService.wallets.query(
            function (successResult) {
                self.selectedWallet = self.wallets[0];
                self.accounts = APIService.accounts.query(
                    { wname:self.selectedWallet.name } ,
                    function (successResult) {
                        self.selectedAccount = self.accounts[0];
                    }        
                );
            }
        );

        // update the account list when a wallet is selected
        self.updateAccountList = function (wallet) {
            self.accounts = APIService.accounts.query(
                {wname:wallet.name} ,
                function (successResult) {
                    self.selectedAccount = self.accounts[0];
                }        
            );            
        };

    }])
    ////////////////////////////////////////////////////////////////////////////
    // SERVICES
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
                accBalance:   $resource('/wallets/:wname/accounts/:aname/balance', 
                                        { wname:'@wname', aname:'@aname'}
                              ),
                transactions: $resource('/accounts/:name/acctxs', 
                                        { name:'@name'}, 
                                        { get: {isArray: true}}
                              ),
                transPage:    $resource('/accounts/:name/acctxs', 
                                        { name:'@name'}
                              ),    
                addresses:    $resource('/accounts/:name/addrs', 
                                        { name:'@name'}, 
                                        { get: {isArray: true}}
                              ),
                address:      $resource('/accounts/:name/addrs/:key', 
                                        { name:'@name', key:'@key'},
                                        { update: {method: 'PUT'}}
                              ),
                addrPage :    $resource('/accounts/:name/addrs', 
                                        { name:'@name'}
                              ),
                wallets:      $resource('/wallets/:name', 
                                        { name:'@name'}, 
                                        { update: {method: 'PUT'}}
                              ),
                send:         $resource('/accounts/:name/acctxs', 
                                        { name:'@name'}
                              ),    
            };
    }])

    ////////////////////////////////////////////////////////////////////////////
    // FILTERS
    ////////////////////////////////////////////////////////////////////////////
    .filter('addrForQR', [
        function() { 
            return function(addr) {
                return "bitcoin:" + addr;
            };
    }])
    ////////////////////////////////////////////////////////////////////////////
    // DIRECTIVES
    ////////////////////////////////////////////////////////////////////////////
    .directive('ngEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if(event.which === 13) {
                    scope.$apply(function (){
                        scope.$eval(attrs.ngEnter);
                    });
                    event.preventDefault();
                }
            });
        };
    })


    .directive('account', [function() {
        return {
            templateUrl: "scripts/views/accountInfo.html",
            restrict: 'E',
            controller: ['$scope','APIService', function($scope,APIService){
                $scope.getAccountDetails = function(accName) {
                    if (accName) {
                        $scope.account = APIService.accounts.get(
                            { aname:accName, 
                              wname:$scope.wname
                            }
                        );
                        $scope.balance = APIService.accBalance.get(
                            { aname:accName,
                              wname:$scope.wname
                            }
                        );
                    };
                };
                $scope.$watch('aname', function(newAcc, oldAcc) {
                    $scope.getAccountDetails(newAcc);
                });
            }],
            scope: {
                wname: '@',
                aname: '@'
            }
        };
    }])



    .directive('transactions', [function() {
        return {
            templateUrl: "scripts/views/transactions.html",
            restrict: 'E',
            controller: ['$scope','APIService', function($scope,APIService){
                $scope.getTransactionsList = function(accName) {
                    if (accName != "") {
                        $scope.transactionsList = APIService.transactions.get({name:accName});
                    };
                };
                $scope.$watch('name', function(newAcc, oldAcc) {
                    $scope.getTransactionsList(newAcc);
                });
            }],
            scope: {
                name: '@'
            }
        };
    }])

    .directive('addresses', [function() {
        return {
            templateUrl: "scripts/views/addresses.html",
            restrict: 'E',
            controller: ['$scope','APIService', function($scope,APIService){
                
                $scope.maxSize     = 5;   // pagination bar buttons
                $scope.elemxpage   = 10;
                $scope.currentPage = 1;   

                $scope.getAddressesList = function(accName) {
                    if (accName != "") {
                        $scope.infoPage = APIService.addrPage.get(
                            {
                                 name:        accName
                                ,page:        $scope.currentPage
                                ,elemperpage: $scope.elemxpage
                            },
                            function (successResult) {
                                $scope.totalItems = $scope.elemxpage * 
                                                    $scope.infoPage.maxpage;
                            },
                            function (errorResult) {
                                // $scope.alerts = [];
                                // $scope.addAlert('danger',errorResult.data.errors);
                            }
                        );           
                    };
                };

                $scope.submitLabel = function (addr) {
                    addr.editorEnabled =! addr.editorEnabled;
                    var x    = {};
                    x.label  = addr.label; 
                    var newlabel = new APIService.address(x);
                    newlabel.$update(
                        {
                             name: $scope.name
                            ,key:  addr.index
                        }
                    );
                };

                $scope.$watch('name', function(newAcc, oldAcc) {
                    $scope.getAddressesList(newAcc);
                });
            }],
            scope: {
                name: '@'
            }
        };
    }])

    .directive('newWalletForm', [function() {
        return {
            templateUrl: "scripts/views/newWalletForm.html",
            restrict: 'E',
            controller: ['$scope','APIService', function($scope,APIService){
                $scope.alerts = [];
                $scope.addAlert = function(t,m) {
                    $scope.alerts.push({type: t, msg: m});
                };
                $scope.closeAlert = function(index) {
                    $scope.alerts.splice(index, 1);
                };
                $scope.response = "";
                $scope.wallet = {};
                $scope.wallet.passphrase = "";
                $scope.submitNewWallet = function () {
                    var newwallet = new APIService.wallets($scope.wallet);
                    newwallet.$save(function (successResult) {
                                        $scope.alerts = [];
                                        $scope.addAlert('success','Mnemonic: ' + newwallet.mnemonic);
                                    },
                                    function (errorResult) {
                                        $scope.alerts = [];
                                        $scope.addAlert('danger',errorResult.data.errors);
                                    }
                    );
                };
            }],
            scope: {}
        };
    }])

    .directive('newAccountForm', [function() {
        return {
            templateUrl: "scripts/views/newAccountForm.html",
            restrict: 'E',
            controller: ['$scope','APIService', function($scope,APIService){
                $scope.alerts = [];
                $scope.addAlert = function(t,m) {
                    $scope.alerts.push({type: t, msg: m});
                };
                $scope.closeAlert = function(index) {
                    $scope.alerts.splice(index, 1);
                };
                $scope.account = {};
                $scope.account.keys = [];
                $scope.account.type = "regular";
                $scope.account.accountname = "";
                $scope.accountTypes = ["regular","multisig","read","readmultisig"];
                $scope.wallets = APIService.wallets.query();
                
                $scope.submitNewAccount = function () {
                    var newaccount = new APIService.accounts($scope.account);
                    newaccount.$save(function (successResult) {
                                        $scope.alerts = [];
                                        $scope.addAlert('success',newaccount);
                                    },
                                    function (errorResult) {
                                        $scope.alerts = [];
                                        $scope.addAlert('danger',errorResult.data.errors);
                                    }
                    );
                };

                $scope.cleanForm = function (tipus,nom) {
                    delete $scope.account;
                    $scope.account = {};
                    $scope.account.keys = [];
                    $scope.account.type = tipus;
                    $scope.account.accountname = nom;
                };
            }],
            scope: {}
        };
    }])

    .directive('sendForm', [function() {
        return {
            templateUrl: "scripts/views/sendForm.html",
            restrict: 'E',
            controller: ['$scope','APIService', function($scope,APIService){
                $scope.alerts = [];
                $scope.addAlert = function(t,m) {
                    $scope.alerts.push({type: t, msg: m});
                };
                $scope.closeAlert = function(index) {
                    $scope.alerts.splice(index, 1);
                };
                $scope.payment = {};
                $scope.payment.type = "send";
                $scope.payment.recipients = [];
                $scope.payment.fee = 10000;
     
                $scope.submitNewPayment = function () {
                    $scope.payment.recipients.push([$scope.r,$scope.a]);
                    var newpayment = new APIService.send($scope.payment);
                    newpayment.$save({name:$scope.name},
                                    function (successResult) {
                                        $scope.alerts = [];
                                        $scope.addAlert('success',newpayment);
                                    },
                                    function (errorResult) {
                                        $scope.alerts = [];
                                        $scope.addAlert('danger',errorResult.data.errors);
                                        $scope.send.recipients = [];
                                    }
                    );
                };
            }],
            scope: {
                name: '@'
            }
        };
    }]);

// xpub68pbenKo1jm4CuZV4giu7J2eMnoHT3BU8bzwyXYBqzTWd7f8x3PLDDYoFbf6UddQc1gxUqw7niZCeL4ydc8L6u27zvhtJBsVjMAixnu6hJ6
