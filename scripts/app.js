angular.module('HaskoinApp', ['monospaced.qrcode'
                             ,'ngResource'
                             ,'ui.bootstrap'
                             ,'ngRoute'
                             ,'fundoo.services'
                             ,'passwordEntropy'])
    ////////////////////////////////////////////////////////////////////////////
    // CONFIG ROUTES
    ////////////////////////////////////////////////////////////////////////////
    .config(['$routeProvider', 
      function($routeProvider) {
        $routeProvider
          .when('/',{
              redirectTo: '/wallets',
              template: '<navigation-bar></navigation-bar> \
                         <form role="form" \
                               name="test" \
                               ng-submit="wctrl.testSubmit()"> \
                                <div class="form-group"> \
                                  <label for="pwd">Password: </label> \
                                  <input id="pwd" \
                                         name="passwordInput" \
                                         class="form-control" \
                                         type="text" \
                                         ng-model="wctrl.pwd" \
                                         min-entropy="50" \
                                         required ></input> \
                                  <password-entropy \
                                    password="wctrl.pwd" \
                                    > \
                                  </password-entropy> \
                                </div> \
                                <div class="form-group"> \
                                  <button type="submit" \
                                          class="btn btn-default" \
                                          ng-disabled="test.$invalid"> \
                                          Say hello \
                                  </button> \
                                </div> \
                        </form>'
          })
          .when('/new-wallet',{
              template: '<navigation-bar></navigation-bar>\
                         <new-wallet-form></new-wallet-form>'
          })
          .when('/new-account',{
              template: '<navigation-bar></navigation-bar>\
                         <new-account-form></new-account-form>'
          })
          .when('/administration',{
              template: '<navigation-bar></navigation-bar>\
                         <rescan-form></rescan-form>'
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
          .when('/wallets/:walletName/accounts/:accountName/change',{
              template: '<navigation-bar></navigation-bar><addresses \
                         wname="{{ChLC.wname}}" aname="{{ChLC.aname}}" \
                         internal=true></addresses>',
              controller: 'ChangeListCtrl as ChLC'
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
        self.pwd = "";
        self.testSubmit = function() {alert("Hola!!");};
        self.myOpt = {
                     '0': ['progress-bar-danger',  'very weak'],
                    '15': ['progress-bar-danger',  'weak'],
                    '35': ['progress-bar-warning',  'normal'],
                    '50': ['progress-bar-success', 'strong'],
                    '70': ['progress-bar-success', 'very strong']
        }; 
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
    .controller('ChangeListCtrl', ['$routeParams',
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
    }]);