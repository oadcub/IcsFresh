app.directive('kdaDatepicker', function ($uibModal, $compile) {
    return {
        require: 'ngModel',
        restrict: 'AE',
        replace: false,
        scope: false,
        link: function (scope, elem, attr, ctrl) {
            if (!ctrl) return;
            let NgPrefix = attr.ngModel.replace(/\./g, '').split('=')[0].trim();

            if (!isEmpty(attr.ngModelOptions)) {
                let opts = JSON.parse(JSON.stringify(eval("(" + attr.ngModelOptions + ")")));
                if (!opts.getterSetter) {
                    ctrl.$formatters.unshift(KdaDate);
                }
            } else {
                ctrl.$formatters.unshift(KdaDate);
            }


            function KdaDate(val, target) {
                if (val) {
                    var NewDate = moment.utc(moment(val).format('DD/MM/YYYY'), 'DDMMYYYY').toDate();
                    elem.val(NewDate);
                    ctrl.$setViewValue(NewDate);
                    ngModel = NewDate;
                    let isInRange = KdaCheckRangeDate(NewDate, target);
                    return NewDate;
                }
            }
            scope[`${NgPrefix}DatePickerOptions`] = {
                ngModelOptions: {},
                showWeeks: false,
             };
            scope.$watch(attr.minDate, function (value) {
                scope[`${NgPrefix}DatePickerOptions`].minDate = value;
            });
            scope.$watch(attr.maxDate, function (value) {
                scope[`${NgPrefix}DatePickerOptions`].maxDate = value;
            });
            //console.log(scope);
            function KdaCheckRangeDate(NewDate, target) {
                const CompareDate = moment(NewDate, "DD/MM/YYYY");
                if (!isEmpty(scope[`${NgPrefix}DatePickerOptions`].minDate)) {
                    let MinDate = moment(scope[`${NgPrefix}DatePickerOptions`].minDate, "DD/MM/YYYY");
                    //console.log('MinDate', MinDate);
                    if (!CompareDate.isSameOrAfter(MinDate)) {
                        Text = `"${moment(NewDate).format("DD/MM/YYYY")}" must be no less than "${moment(MinDate).format("DD/MM/YYYY")}".`;
                        AlertError(target, Text);
                        return false;
                    }
                }
                if (!isEmpty(scope[`${NgPrefix}DatePickerOptions`].maxDate)) {
                    let MaxDate = moment(scope[`${NgPrefix}DatePickerOptions`].maxDate, "DD/MM/YYYY");
                    //console.log('MaxDate', MaxDate);
                    if (!CompareDate.isSameOrBefore(MaxDate)) {
                        Text = `"${moment(NewDate).format("DD/MM/YYYY")}" must be no more than "${moment(MaxDate).format("DD/MM/YYYY")}".`;
                        AlertError(target, Text);
                        return false;
                    }
                }
                return true;
            }

            scope[`${NgPrefix}DtpOnBlur`] = function (event, onChange) {

                let $JqEvent = event;
                const DateFormat = 'DDMMYYYY';
                let InputValue = $JqEvent.target.value;

                if (InputValue) {
                    let IsValidDate = moment(InputValue.toString(), DateFormat).isValid();
                    let Text = '';
                    if (IsValidDate) {
                        let NewDate = moment.utc(InputValue, DateFormat).toDate();
                        KdaDate(NewDate, $JqEvent.target);
                        $JqEvent.target.value = moment(NewDate).format('DD/MM/YYYY');
                    } else {
                        Text = `"${InputValue}" is invalid date format.`;
                        AlertError($JqEvent.target, Text);
                    }

                }

            };
            scope[`${NgPrefix}DtpOnChange`] = function (onChange) {
                if (!isEmpty(onChange) && onChange !== 'undefined') {
                    OnChangeList = onChange.split(';');
                    OnChangeList.forEach(element => {
                        if (!isEmpty(element)) {
                            let ngChange = element.replace('()', '');
                            scope[ngChange]();
                        }
                    });

                }
            };

            // let onChange = "";
            // if (!isEmpty(attr.ngChange)) {
            //     onChange = attr.ngChange.replace('()', '');
            // }
            //ng-change="${NgPrefix}DtpOnChange('${attr.ngChange}')"
            let html = `<div class="input-group kda-datepicker">
                            <input type="text"
                                   class="form-control" 
                                   ng-class="${attr.dtpClass}" 
                                   ng-model="${attr.ngModel}"
                                   is-open="${NgPrefix}opened"
                                   uib-datepicker-popup="dd/MM/yyyy"
                                   ng-required="true"
                                   ng-blur="${NgPrefix}DtpOnBlur($event, '${attr.ngChange}')" 
                                   datepicker-append-to-body="true"
                                   ng-change="${attr.ngChange}"
                                   `
            if (!isEmpty(attr.ngShow)) {
                html += `ng-show="${attr.ngShow}"`;
            }
            html += ` close-text="Close" datepicker-options="${NgPrefix}DatePickerOptions"`
            if (!isEmpty(attr.ngDisabled)) {
                html += `ng-disabled="${attr.ngDisabled}"`;
            }
            if (!isEmpty(attr.ngModelOptions)) {
                html += `ng-model-options="${attr.ngModelOptions}"`;
                if (!attr.ngDisabled) {
                    html += `ng-disabled="true"`;
                }
            }

            html += `/><span class="input-group-btn" `
            if (!isEmpty(attr.ngShow)) {
                html += `ng-show="${attr.ngShow}"`;
            }
            html += `><button type="button" class="btn btn-default kda-dtp-btn" ng-click="${NgPrefix}opened = true"`
            if (!isEmpty(attr.ngDisabled)) {
                html += `ng-disabled="${attr.ngDisabled}"`;
            }
            if (!isEmpty(attr.ngModelOptions)) {
                if (isEmpty(attr.ngDisabled)) {
                    html += `ng-disabled="true"`;
                }
            }
            html += `><i class="glyph-icon icon-calendar"></i>
                                </button>
                            </span>
                        </div>`;
            $(elem).after($compile(html)(scope));
            elem.attr("ng-hide", "true");
            elem.removeAttr("kda-datepicker");
            elem.removeAttr("ng-change");
            $compile(elem)(scope);
        },

    };


    function GetTemplate(FileName) {
        return `${GLOBAL_VARIABLE.WebUrl}/Scripts_ngapp/_factory/template/${FileName}.html?v=${moment()}`
    }

    function AlertError(target, text) {

        let options = {
            backdrop: false,
            templateUrl: GetTemplate('dialog-alert'),
            windowTemplateUrl: GetTemplate('dialog-alert-window'),
            controller: function ($scope, $uibModalInstance) {
                $scope.type = 'danger';
                $scope.icon = 'calendar';
                $scope.text = text;

                $scope.fn_OnSuccess = function () {
                    // $uibModalInstance.close();
                    $('.modal').hide();
                    $(target).focus();
                 };
            }
        };

        $uibModal.open(options);
    }
});