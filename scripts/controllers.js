angular.module('HaskoinApp')
    ////////////////////////////////////////////////////////////////////////////
    .controller('showKeyModalCtrl', ['$scope','xPubKey',
       function($scope, xPubKey) { $scope.xPubKey = xPubKey;}
    ])
    ////////////////////////////////////////////////////////////////////////////
    .controller('showTxDetailsModalCtrl', ['$scope'
                                          ,'transaction'
                                          ,'data'
                                          ,'APIService'
                                          ,'$route'
       ,function($scope, transaction, data, APIService, $route) { 
            $scope.transaction = transaction;
            $scope.wallet = data.wallet;
            $scope.account = data.account;
            $scope.isProposition = data.isProposition;

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
            $scope.details.tx = transaction.tx;

            $scope.shellTx = APIService.transaction.get(
                {
                     wname:       $scope.wallet
                    ,aname:       $scope.account
                    ,txhash:      $scope.transaction.txid
                    ,proposition: $scope.isProposition
                }
            );

            $scope.submitSign = function () {            
                var newTx = new APIService.transactions($scope.details);
                newTx.$save({aname:$scope.account, wname:$scope.wallet},
                        function (successResult) {
                            $scope.alerts = [];
                            $scope.addAlert('success', 'Transaction signed');
                            $route.reload();                     
                        },
                        function (errorResult) {
                            $scope.alerts = [];
                            $scope.addAlert('danger', errorResult.data.errors);    
                        }
                );
            };



      }
    ])
    ////////////////////////////////////////////////////////////////////////////
    .controller('showQRModalCtrl', ['$scope','address',
       function($scope, address) { $scope.address = address;}
    ])
    ////////////////////////////////////////////////////////////////////////////
    .controller('confirmPaymentModalCtrl', ['$scope','payment','data',
       function($scope, payment, data) {
        $scope.payment = payment;
        $scope.wallet = data.wallet;
        $scope.account = data.account;
        $scope.isMultisig = data.multisig;
    }]);