app.directive('btnConfirm', function ($uibModal) {
    return {
        replace: true,
        scope: {
            dialogTitle: '=?',
            dialogContent: '=?',

            btnText: '=',
            btnIcon: '=?',
            btnClass: '=?',

            onConfirm: '&',
            onCancel: '&',

            textOk: '=?',
            textCancel: '=?'
        },
        templateUrl: GLOBAL_VARIABLE.WebUrl + '/Scripts_ngapp/_directive/btn-confirm/btn-confirm.directive.html?v=' + moment(),
        controller: function BtnConfirmController($scope) {
            //console.log($scope);
            var DialogOptions = {
                DialogTitle: $scope.dialogTitle,
                DialogContent: $scope.dialogContent,
                OnConfirm: $scope.onConfirm,
                OnCancel: $scope.onCancel,
                TextOk: isEmpty($scope.textOk) ? 'OK' : $scope.textOk,
                TextCancel: isEmpty($scope.textCancel) ? 'Cancel' : $scope.textCancel,
            };

            $scope.OpenModal = function () {
                $uibModal.open({
                    templateUrl: GLOBAL_VARIABLE.WebUrl + '/Scripts_ngapp/_directive/btn-confirm/dialog-confirm.directive.html?v=' + moment(),
                    backdrop: 'true',
                    resolve: {
                        DialogOptions: DialogOptions
                    },
                    controller: function ($scope, $uibModalInstance, DialogOptions) {
                        $scope.DialogOptions = DialogOptions;
                        $scope.ok = function () {
                            $uibModalInstance.close('confirmed');
                            $scope.DialogOptions.OnConfirm();
                        };

                        $scope.cancel = function () {
                            $uibModalInstance.dismiss('cancel');
                            $scope.DialogOptions.OnCancel();
                        };
                    }
                });
                // AppService.ModalConfirm($scope.onConfirm, $scope.titleText, $scope.contentText, $scope.footerText);
            };
        }
    };
});