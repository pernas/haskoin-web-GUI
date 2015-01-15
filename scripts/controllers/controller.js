angular.module('HaskoinApp', ['monospaced.qrcode'
                             ,'ngResource'
                             ,'ui.bootstrap'
                             ,'ngRoute'
                             ,'fundoo.services'])
    ////////////////////////////////////////////////////////////////////////////
    // CONFIG ROUTES
    ////////////////////////////////////////////////////////////////////////////

    .config(['$routeProvider', 
      function($routeProvider) {

        $routeProvider
          .when('/',{
              redirectTo: '/wallets'
              // template: '<navigation-bar></navigation-bar>\
              //            <h2>Welcome to Haskoin wallet</h2>'
          })
          .when('/new-wallet',{
              template: '<navigation-bar></navigation-bar>\
                         <new-wallet-form></new-wallet-form>'
          })
          .when('/new-account',{
              template: '<navigation-bar></navigation-bar>\
                         <new-account-form></new-account-form>'
          })
          .when('/wallets',{
              template: '<navigation-bar></navigation-bar>\
                         <wallets wallets="WLC.wallets"></wallets>',
              controller: 'WalletListCtrl as WLC',
              resolve:{
                walletsPromise: [ 'APIService',
                    function (APIService) {
                      var walletsData = APIService.wallets.query();
                      return walletsData.$promise;
                    }]
              }
          })
          .when('/wallets/:walletName/accounts',{
              template: '<navigation-bar></navigation-bar>\
                         <accounts wallet="{{ALC.wname}}" accounts="ALC.accts">\
                         </accounts>',
              controller: 'AccountListCtrl as ALC',
              resolve:{
                accountsPromise: [ 'APIService','$route',
                    function (APIService, $route) {
                      var walletName = $route.current.params.walletName;
                      var aData = APIService.accounts.query({wname:walletName});
                      return aData.$promise;
                    }]
              }
          })
          .when('/wallets/:walletName/accounts/:accountName',{
              template: '<navigation-bar></navigation-bar>\
                         <account wname="{{AIC.wname}}" aname="{{AIC.aname}}">\
                         </account>',
              controller: 'AccountInfoCtrl as AIC'
          })
          .when('/wallets/:walletName/accounts/:accountName/transactions',{
              template: '<navigation-bar></navigation-bar>\
                         <transactions wname="{{TLC.wname}}"\
                                       aname="{{TLC.aname}}">\
                         </transactions>',
              controller: 'TransactionListCtrl as TLC'
          })
          .when('/wallets/:walletName/accounts/:accountName/receive',{
              template: '<navigation-bar></navigation-bar><addresses \
                         wname="{{AdLC.wname}}" aname="{{AdLC.aname}}" \
                         internal=false></addresses>',
              controller: 'AddressListCtrl as AdLC'
          })
          .when('/wallets/:walletName/accounts/:accountName/send',{
              template: '<navigation-bar></navigation-bar>\
                         <send-form wname="{{SFC.wname}}"\
                                    aname="{{SFC.aname}}">\
                         </send-form>',
              controller: 'SendFormCtrl as SFC'
          })
          .when('/wallets/:walletName/accounts/:accountName/signTx',{
              template: '<navigation-bar></navigation-bar>\
                         <sign-tx-form wname="{{SiC.wname}}"\
                                    aname="{{SiC.aname}}">\
                         </sign-tx-form>',
              controller: 'SignCtrl as SiC'
          })
          .when('/wallets/:walletName/accounts/:accountName/importTx',{
              template: '<navigation-bar></navigation-bar>\
                         <import-tx-form wname="{{ImC.wname}}"\
                                    aname="{{ImC.aname}}">\
                         </import-tx-form>',
              controller: 'ImportCtrl as ImC'
          })
                

          .otherwise({redirectTo: '/'});
    }])
    ////////////////////////////////////////////////////////////////////////////
    // MAIN CONTROLLER
    ////////////////////////////////////////////////////////////////////////////
    .controller('WalletCtrl', ['$scope','$location','APIService',
      function($scope, $location, APIService){
        var self = this;
    }])
    ////////////////////////////////////////////////////////////////////////////
    // ROUTES CONTROLLERS
    ////////////////////////////////////////////////////////////////////////////
    .controller('WalletListCtrl', ['walletsPromise',
      function(walletsPromise){
        var self = this;
        self.wallets = walletsPromise;
    }])
    .controller('AccountListCtrl', ['accountsPromise','$routeParams',
      function(accountsPromise,$routeParams){
        var self = this;
        self.wname = $routeParams.walletName;
        self.accts = accountsPromise;
    }])
    .controller('AccountInfoCtrl', ['$routeParams',
      function($routeParams){
        var self = this;
        self.wname = $routeParams.walletName;
        self.aname = $routeParams.accountName;
    }])
    .controller('TransactionListCtrl', ['$routeParams',
      function($routeParams){
        var self = this;
        self.wname = $routeParams.walletName;
        self.aname = $routeParams.accountName;
    }])
    .controller('AddressListCtrl', ['$routeParams',
      function($routeParams){
        var self = this;
        self.wname = $routeParams.walletName;
        self.aname = $routeParams.accountName;
    }])
    .controller('SendFormCtrl', ['$routeParams',
      function($routeParams){
        var self = this;
        self.wname = $routeParams.walletName;
        self.aname = $routeParams.accountName;
    }])
    .controller('SignCtrl', ['$routeParams',
      function($routeParams){
        var self = this;
        self.wname = $routeParams.walletName;
        self.aname = $routeParams.accountName;
    }])
    .controller('ImportCtrl', ['$routeParams',
      function($routeParams){
        var self = this;
        self.wname = $routeParams.walletName;
        self.aname = $routeParams.accountName;
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
          transaction:  $resource('/wallets/:wname/accounts/:aname/txs/:txhash', 
                                  { wname:'@wname'
                                  , aname:'@aname'
                                  , txhash:'@txhash'}
                        )  
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

    .directive('wallets', [function() {
        return {
            templateUrl: "scripts/views/wallets.html",
            restrict: 'E',
            scope: {
                 wallets: '='
            }
        };
    }])

    .directive('accounts', [function() {
        return {
            templateUrl: "scripts/views/accounts.html",
            restrict: 'E',
            scope: {
                 wallet: '@',
                 accounts: '='
            }
        };
    }])

    .directive('navigationBar', [ function() {
        return {
            templateUrl: "scripts/views/navigationBar.html",
            restrict: 'E',
            controller: ['$scope','$routeParams','$location','APIService',
              function($scope, $routeParams, $location, APIService){
                $scope.wallet = $routeParams.walletName;
                $scope.account = $routeParams.accountName; 
                $scope.isActive = function (viewLocation) { 
                    return viewLocation === $location.path();
                }; 
                $scope.getAccountDetails = function(accName, walName) {
                    if (accName) {
                        $scope.accountDetails = APIService.accounts.get(
                            { aname:accName, wname:walName }
                        );
                    };
                };
                $scope.getAccountDetails($scope.account,$scope.wallet);

                $scope.isMultisig = function(){
                    if ($scope.accountDetails ) {
                    return $scope.accountDetails.type === "multisig"; 
                    };
                };
                $scope.isOnlyRead = function(){
                    if ($scope.accountDetails ) {
                    return $scope.accountDetails.type === "readmultisig" ||
                           $scope.accountDetails.type === "read";
                    };
                };
              }
            ],
            scope: {}
        };
    }])

    .directive('account', [function() {
        return {
            templateUrl: "scripts/views/accountInfo.html",
            restrict: 'E',
            controller: ['$scope',
                         'APIService',
                         'createDialog',
              function($scope,APIService,createDialog){
          
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
                $scope.canIAddKeys = function (account) {
                    if (account) {
                      if (account.type === "multisig" || 
                          account.type === "readmultisig") {
                            if (account.keys.length < account.total) {
                                return true;
                            };
                      };
                    };
                    return false;
                };
                $scope.showKey = function (key) {
                  alert(key);
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

    .directive('balance', [function() {
        return {
            template: '<strong>{{balance.balance.balance / 100000.0 | number:5}} mBTC</strong>',
            restrict: 'E',
            controller: ['$scope',
                         'APIService',
              function($scope,APIService){
                $scope.getBalance = function(accName, walName) {
                    if (accName) {
                        $scope.balance = APIService.accBalance.get(
                            { aname:accName,
                              wname:walName
                            }
                        );
                    };
                };
                $scope.$watchGroup(['aname','wname'], 
                    function(newValues, oldValues) {
                        $scope.getBalance(newValues[0],newValues[1]);
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

                $scope.isTransaction = function (tx) { 
                    return tx.confidence !== 'offline'; 
                };
                $scope.isProposition = function (tx) { 
                    return tx.confidence === 'offline'; 
                };
                $scope.getTransactionsList = function(accName, wallName) {
                    if (accName) {
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
            controller: ['$scope',
                         '$route',
                         'APIService', function($scope,$route,APIService){
                
                $scope.maxSize     = 5;   // pagination bar buttons
                $scope.elemxpage   = 10;
                $scope.currentPage = 1;  
                //$scope.internal    = true; 

                $scope.getAddressesList = function(wallName,accName) {
                    if (accName) {
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
                $scope.createNewAddr = function (label) {          
                    var x    = {};
                    x.label  = label; 
                    var newLabeledAddr = new APIService.address(x);
                    newLabeledAddr.$save(
                        {
                             wname: $scope.wname
                            ,aname: $scope.aname
                        }
                    );
                    $scope.label.label = "";
                    $route.reload();

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
                                        $scope.addAlert('success',
                                                        'Mnemonic: ' + 
                                                         newwallet.mnemonic);
                                    },
                                    function (errorResult) {
                                        $scope.alerts = [];
                                        $scope.addAlert('danger',
                                                    errorResult.data.errors);
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
                                        $scope.addAlert('danger',
                                                    errorResult.data.errors);
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

    .controller('confirmPaymentModalCtrl', ['$scope','payment','data',
       function($scope, payment, data) {
        $scope.payment = payment;
        $scope.wallet = data.wallet;
        $scope.account = data.account;
        $scope.isMultisig = data.multisig;
    }])

    .directive('sendForm', [function() {
        return {
            templateUrl: "scripts/views/sendForm.html",
            restrict: 'E',
            controller: ['$scope',
                         'APIService',
                         'createDialog',
              function($scope, APIService, createDialog){
                $scope.alerts = [];
                $scope.addAlert = function(t,m) {
                    $scope.alerts.push({type: t, msg: m});
                };
                $scope.closeAlert = function(index) {
                    $scope.alerts.splice(index, 1);
                };
                $scope.getAccountDetails = function(accName, walName) {
                    if (accName) {
                        var accountDetails = APIService.accounts.get(
                            { aname:accName, wname:walName }
                        );
                        return accountDetails;
                    };
                    return {};
                };
                $scope.isMultisig = function(acc){
                    if (acc) {return acc.type === "multisig"; }
                    else {return false;};
                };

                $scope.account = $scope.getAccountDetails($scope.aname,$scope.wname);
                $scope.payment = {};
                $scope.payment.type = "send";
                $scope.payment.recipients = [];
                $scope.payment.fee = 10000;
                $scope.payment.minconf = 1;
                $scope.payment.proposition = false;
     
                $scope.submitNewPayment = function () {
                    $scope.payment.recipients = [];
                    $scope.payment.recipients.push([$scope.r,$scope.a*100000]); //amout submited in satoshi
                    var newpayment = new APIService.transactions($scope.payment);
                    newpayment.$save({aname:$scope.aname, wname:$scope.wname},
                                    function (successResult) {
                                        $scope.alerts = [];
                                        $scope.addAlert('success',newpayment);
                                    },
                                    function (errorResult) {
                                        $scope.alerts = [];
                                        $scope.addAlert('danger',
                                            errorResult.data.errors);
                                        $scope.payment.recipients = [];
                                    }
                    );
                };

                $scope.confirmPaymentModal = function() {
                    var ms = $scope.isMultisig($scope.account);
                    var title = "";
                    if (!ms) {modalTitle = "Payment confirmation";} 
                    else {modalTitle = "Proposotion confirmation";};
                    $scope.payment.recipients = [];
                    $scope.payment.recipients.push([$scope.r,$scope.a]);  //amout showed in mBTC
                    createDialog('scripts/views/modals/sendConfirm.html', {
                      id: 'sendConfirmation',
                      title: modalTitle,
                      backdrop: true,
                      controller: 'confirmPaymentModalCtrl',
                      success: {label: 'Accept', 
                                fn: function() {$scope.submitNewPayment();}
                            },
                      cancel: {label: 'Cancel', fn: null},
                      css: {
                              top: '100px',
                              left: '0%',
                              margin: '0 auto'
                            }
                      },
                      // parameters for the modal
                      { payment: $scope.payment,
                        data: { wallet: $scope.wname 
                               ,account: $scope.aname
                               ,multisig: ms
                             }
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

    .directive('importTxForm', [function() {
        return {
            templateUrl: "scripts/views/importTxForm.html",
            restrict: 'E',
            controller: ['$scope','APIService', function($scope,APIService){
                $scope.alerts = [];
                $scope.addAlert = function(t,m) {
                    $scope.alerts.push({type: t, msg: m});
                };
                $scope.closeAlert = function(index) {
                    $scope.alerts.splice(index, 1);
                };
                $scope.details = {};
                $scope.details.type = "import";

     
                $scope.submitTransaction = function () {
                    
                    var newTx = new APIService.transactions($scope.details);
                    newTx.$save({aname:$scope.aname, wname:$scope.wname},
                                    function (successResult) {
                                        $scope.alerts = [];
                                        $scope.addAlert('success',newTx);
                                    },
                                    function (errorResult) {
                                        $scope.alerts = [];
                                        $scope.addAlert('danger',
                                            errorResult.data.errors);
                                        
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

    .directive('signTxForm', [function() {
        return {
            templateUrl: "scripts/views/signTxForm.html",
            restrict: 'E',
            controller: ['$scope','APIService', function($scope,APIService){
                $scope.alerts = [];
                $scope.addAlert = function(t,m) {
                    $scope.alerts.push({type: t, msg: m});
                };
                $scope.closeAlert = function(index) {
                    $scope.alerts.splice(index, 1);
                };
                $scope.details = {};
                $scope.details.type = "sign";
                $scope.details.final = false;

     
                $scope.submitSign = function () {
                    
                    var newTx = new APIService.transactions($scope.details);
                    newTx.$save({aname:$scope.aname, wname:$scope.wname},
                                    function (successResult) {
                                        $scope.signedTx = APIService.transaction.get(
                                            {
                                                 wname:       $scope.wname
                                                ,aname:       $scope.aname
                                                ,txhash:      $scope.newTx.txhash
                                            },
                                            function (successResult) {
                                                $scope.alerts = [];
                                                $scope.addAlert('success',signedTx.tx);
                                            },
                                            function (errorResult) {
                                                $scope.alerts = [];
                                                $scope.addAlert('danger',errorResult.data.errors);
                                            }
                                        );
                                    },
                                    function (errorResult) {
                                        $scope.alerts = [];
                                        $scope.addAlert('danger',
                                            errorResult.data.errors);    
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
            templateUrl: "scripts/views/addKeys.html",
            restrict: 'E',

            controller: ['$scope','APIService', 
              function($scope,APIService){
                $scope.newKeys = [];
                $scope.alerts = [];

                $scope.addAlert = function(t,m) {
                    $scope.alerts = [];
                    $scope.alerts.push({type: t, msg: m});
                };
                $scope.closeAlert = function(index) {
                    $scope.alerts.splice(index, 1);
                };
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
