angular.module('HaskoinApp', ['monospaced.qrcode'
                             ,'ngResource'
                             ,'ui.bootstrap'])
    .controller('WalletCtrl', ['APIService',
      function(APIService){
        var self = this;

        // get initial selection
        self.wallets = APIService.wallets.query(
            function (successResult) {
                var wallet = self.wallets[0];
                self.accounts = APIService.accounts.query(
                    { wname:wallet.name } ,
                    function (successResult) {
                        self.selectedWallet  = self.wallets[0];
                        self.selectedAccount = self.accounts[0];
                    }        
                );
            }
        );

        // update the account list when a wallet is selected
        self.updateAccountList = function (wallet) {
            self.selectedAccount = {};
            self.accounts = APIService.accounts.query(
                {wname:wallet.name} ,
                function (successResult) {
                    self.selectedAccount = self.accounts[0];
                }        
            );            
        };

        self.canIAddKeys = function (account) {
            if (account) {
              if (account.type === "multisig" || account.type === "readmultisig") {
                if (account.keys.length < account.total) {
                    return true;
                };
              };
            };
            return false;
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
                $scope.getAccountDetails = function(accName, walName) {
                    if (accName) {
                        $scope.account = APIService.accounts.get(
                            { aname:accName, 
                              wname:walName
                            }
                        );
                        $scope.balance = APIService.accBalance.get(
                            { aname:accName,
                              wname:walName
                            }
                        );
                    };
                };
                $scope.$watchGroup(['aname','wname'], 
                    function(newValues, oldValues) {
                        $scope.getAccountDetails(newValues[0],newValues[1]);
                    }
                );
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

                $scope.maxSize     = 5;   // pagination bar buttons
                $scope.elemxpage   = 10;
                $scope.currentPage = 1;   

                $scope.getTransactionsList = function(accName, wallName) {
                    if (accName !== "") {
                        $scope.infoPage = APIService.transactions.get(
                            {
                                 wname:        wallName
                                ,aname:        accName
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
                $scope.$watchGroup(['aname','wname'], 
                    function(newValues, oldValues) {
                        $scope.getTransactionsList(newValues[0], newValues[1]);
                    }
                );
            }],
            scope: {
                 wname: '@'
                ,aname: '@'
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
                //$scope.internal    = true; 

                $scope.getAddressesList = function(wallName,accName) {
                    if (accName !== "") {
                        $scope.infoPage = APIService.addresses.get(
                            {
                                 wname:        wallName
                                ,aname:        accName
                                ,page:        $scope.currentPage
                                ,elemperpage: $scope.elemxpage
                                ,internal:    $scope.internal
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
                    addr.editorEnabled = !addr.editorEnabled;
                    var x    = {};
                    x.label  = addr.label; 
                    var newlabel = new APIService.address(x);
                    newlabel.$update(
                        {
                             wname: $scope.wname
                            ,aname: $scope.aname
                            ,key:   addr.index
                            ,internal: $scope.internal
                        }
                    );
                };
                $scope.$watchGroup(['aname','wname'], 
                    function(newValues, oldValues) {
                        $scope.getAddressesList(newValues[1],newValues[0]);
                    }
                );
            }],
            scope: {
                 wname:    '@'
                ,aname:    '@'
                ,internal: '@'
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
                    $scope.alerts = [];
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
                


                $scope.addNewKey = function() {
                  // var newItemNo = $scope.account.keys.length+1;
                  $scope.account.keys.push("");          
                };

                $scope.submitNewAccount = function () {
                    $scope.account.keys = $scope.account.keys.filter(
                        function(item, index, array){ return item;});
                    var newaccount = new APIService.accounts($scope.account);
                    newaccount.$save({wname:$scope.targetWallet},
                                    function (successResult) {
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
                    $scope.alerts = [];
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
                $scope.payment.minconf = 1;
     
                $scope.submitNewPayment = function () {
                    $scope.payment.recipients.push([$scope.r,$scope.a]);
                    var newpayment = new APIService.transactions($scope.payment);
                    newpayment.$save({aname:$scope.aname, wname:$scope.wname},
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
                wname: '@',
                aname: '@'
            }
        };
    }])

    .directive('addKeysForm', [function() {
        return {
            templateUrl: "scripts/views/addkeys.html",
            restrict: 'E',
            controller: ['$scope','APIService', function($scope,APIService){


                $scope.newKeys = [];
                $scope.alerts = [];
                $scope.addAlert = function(t,m) {
                    $scope.alerts = [];
                    $scope.alerts.push({type: t, msg: m});
                };
                $scope.closeAlert = function(index) {
                    $scope.alerts.splice(index, 1);
                };

                // $scope.account = {};
                // $scope.account.keys = [];
                // $scope.account.type = "regular";
                // $scope.account.accountname = "";
                // $scope.accountTypes = ["regular","multisig","read","readmultisig"];
                // $scope.wallets = APIService.wallets.query();
                


                $scope.addNewKey = function() {
                  $scope.newKeys.push("");          
                };


                $scope.submitAddKeys = function () {
                    $scope.alerts = [];
                    $scope.newKeys = $scope.newKeys.filter(
                        function(item, index, array){ return item;});



                    APIService.addKeys.save({wname:$scope.wname, aname:$scope.aname }, 
                                    $scope.newKeys,
                                    function (successResult) {
                                        $scope.alerts = [];
                                        $scope.addAlert('success','Keys added correctly');
                                        $scope.newKeys = [];
                                        $scope.getAccountDetails($scope.aname, $scope.wname);
                                    },
                                    function (errorResult) {
                                        $scope.alerts = [];
                                        $scope.addAlert('danger',errorResult.data.errors);
                                    }
                    );
                };

                $scope.getAccountDetails = function(accName,walName) {
                    if (accName) {
                        $scope.account = APIService.accounts.get(
                            { aname:accName, 
                              wname:walName
                            }
                        );
                    };
                };
                $scope.$watchGroup(['aname','wname'], 
                    function(newValues, oldValues) {
                        $scope.getAccountDetails(newValues[0],newValues[1]);
                    }
                );
            }],
            scope: {
                wname: '@',
                aname: '@'
            }
        };
    }]);

// xpub68pbenKo1jm4CuZV4giu7J2eMnoHT3BU8bzwyXYBqzTWd7f8x3PLDDYoFbf6UddQc1gxUqw7niZCeL4ydc8L6u27zvhtJBsVjMAixnu6hJ6
