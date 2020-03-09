app.directive('kdaTime', function ($filter, $uibModal) {
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {
            if (!ctrl) return;
            ctrl.$formatters.unshift(KdaTime);

            function KdaTime(val) {
                if (val) {
                    let NewVal = moment(val.toString(), "LT").format('HH:mm');
                    elem.val(NewVal);
                    ctrl.$setViewValue(NewVal);
                    return NewVal;
                }
            }
            elem.bind('blur', function (event) {
                if (!isEmpty(elem.val())) {
                    if (moment(elem.val().toString(), "LT").isValid()) {
                        scope.inputModel = KdaTime(elem.val());
                    } else {
                        // $uibModal.open({
                        //     templateUrl: GLOBAL_VARIABLE.WebUrl + 'Scripts_ngapp/_directive/format-time/format-time.error.html?v=' + moment(),
                        //     backdrop: false,
                        //     controller: function ($scope, $uibModalInstance) {
                        //         $scope.Content = elem.val().toString();
                        //         $scope.ok = function () {
                        //             $uibModalInstance.close();
                        //             $(event.target).focus();
                        //         };
                        //     }
                        // });

                        let options = {
                            backdrop: false,
                            templateUrl: GetTemplate('dialog-alert'),
                            windowTemplateUrl: GetTemplate('dialog-alert-window'),
                            controller: function ($scope, $uibModalInstance) {
                                $scope.type = 'danger';
                                $scope.icon = 'clock-o';
                                $scope.text = `"${elem.val().toString()}" is invalid time format.`;

                                $scope.fn_OnSuccess = function () {
                                    $uibModalInstance.close();
                                    $(event.target).focus();
                                };
                            }
                        };

                        $uibModal.open(options);
                    }
                }

            });

        }
    };

    function GetTemplate(FileName) {
        return GLOBAL_VARIABLE.WebUrl + '/Scripts_ngapp/_factory/template/' + FileName + '.html?v=' + moment()
    }
});