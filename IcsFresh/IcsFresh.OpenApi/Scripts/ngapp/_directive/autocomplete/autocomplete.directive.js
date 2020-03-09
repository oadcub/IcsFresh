app.directive('kdaAutocomplete', function (KdaHttp, $compile, $uibModal, $rootScope) {
    return {
        replace: false,
        restrict: 'A',

        scope: {
            // local source
            srcList: '=?',
            // http
            apiParams: '=?',
            qryTable: '=?',
            qryColumn: '=?',
            qryWhere: '=?',
            qryOrder: '=?', 
            qryGroup: '=?', 
            qryMasterdata: '=?',
            // global
            rendLabel: '=?',
            rendValue: '=?',
            ngModel: '=?',
            ngDisabled: '=?',
            srcMode: '=?',
            filterFiled: '=?',
            filterValue: '=?',
            notRecheck: '=?',
           

            filterBy: '=?',

            onAcFocus: '&?',
            onAcSelected: '&?',
            onAcChange: '&?',
            onAcBlur: '&?',
        },
        require: '?ngModel',
        //templateUrl: '../Scripts_ngapp/_directive/autocomplete/autocomplete.directive.html',
        link: function (scope, elm, attrs, ctrl) {
             
             scope.MaxItem = 20;
            if (!isEmpty(scope.srcList)) {
               
                scope.MaxItem = scope.srcList.length;
                //console.log('scope.srcList', scope.MaxItem);

            }
           
            if (scope.qryMasterdata) {
                KdaHttp.Post('masterdata', 'AutoComplete', GetServerModel())
                    .then(function (response) {
                        if (isEmpty(scope.$parent.masterData)) {
                            scope.$parent.masterData = {};
                        }
                        scope.$parent.masterData[scope.qryMasterdata] = response;
                        scope.MaxItem = response.length;
                        scope.Options.maxItemsToRender = scope.MaxItem;
                        //console.log('scope.qryMasterdata', scope.MaxItem);
                    });
            }


            if (typeof scope.notRecheck == undefined) {
                scope.notRecheck = true;
            }
            scope.ngFocus = function ($event) {
                if (scope.onAcFocus) {
                    //console.log('kda onAcFocus');
                    scope.onAcFocus();
                }
            }
            scope.onSelected = function (item) { 
                if (scope.onAcSelected) {
                    let SelectedItem = item;
                    //console.log('kda onAcSelected');
                    scope.onAcSelected();
                }
            }
            scope.ngChnage = function () {
                if (scope.onAcChange) {
                    //console.log('kda onAcChange');
                    scope.onAcChange();
                }
            }
            scope.ngBlur = function () {
                if (scope.onAcBlur) {
                    //console.log('kda onAcBlur');
                    scope.onAcBlur();
                }
            }
            scope.Options = {
                ready: function (e) {

                    scope.hideDropdown = e.hideDropdown;
                },
                dropdownWidth: 'auto',
                minimumChars: 0,
                maxItemsToRender: scope.MaxItem,
                activateOnFocus: true,
                data: function (searchText) {
                    searchText = searchText.toUpperCase();
                    var items = [];
                    if (scope.srcMode === 'api') {
                        const Data = GetServerModel();
                        return KdaHttp.Post('masterdata', 'AutoComplete', Data)
                            .then(function (response) {
                                const List = response.data;
                                items = FilterObject(List, searchText);
                                return items;
                            });
                    } else {
                        if (scope.qryMasterdata) {
                            const List = scope.$parent.masterData[scope.qryMasterdata];
                            items = FilterObject(List, searchText);
                            return items;
                        } else {
                            const List = scope.srcList;
                            items = FilterObject(List, searchText);
                            return items;
                        }
                    }
                },
                renderItem: function (item) {
                    return {
                        value: item.value,
                        label: "<p class='auto-complete' ng-bind-html='entry.item.label'></p>"
                    };
                },
                itemSelected: function (e) {
                    scope.ngModel = e.item.value;
                    //console.log('itemSelected', scope.ngModel);
                    scope.onSelected(e.item);
                    scope.hideDropdown();
                },
                dropdownShown: function () {
                    ////console.log('ac Shown'); 
                    scope.StartCheck = true;
                },
                dropdownHidden: function (e) {
                    ////console.log('ac Hidden');
                    ////console.log('ac StartCheck', scope.StartCheck);

                    if (scope.StartCheck) {
                        ReCheck(this);
                    }

                },
                autoHideDropdown: true
            };
            //console.log(scope.Options);
            elm.removeAttr("kda-autocomplete");
            elm.attr('ng-hide', 'true');
            $compile(elm)(scope);

            scope.ngKeyup = function (event) {
                ////console.log('ac ngKeyup'); 
                if (event.keyCode === 9) {
                    scope.hideDropdown();
                }

            }
            let html = `<input  
                        ng-model="ngModel" 
                        ng-focus="ngFocus($event)"
                        ng-change="ngChnage()"
                        ng-keydown="ngKeyup($event)"
                        ng-disabled="ngDisabled"
                        not-recheck="` + scope.notRecheck + `"`
            if (scope.notRecheck) {
                html += `save-master="` + scope.qryTable + `"`;
                //console.log('scope.qryTable ', scope.qryTable );
            }
            html += `rend-label="rendLabel"
                        rend-value="rendValue" 
                        qry-masterData="qryMasterdata"
                        qry-table="qryTable"
                        qry-type="qryType"
                        qry-column="qryColumn"
                        qry-where="qryWhere"
                        qry-order="qryOrder"
                        auto-complete="Options"
                        class="form-control"/>`;

            $(elm).after($compile(html)(scope));




            function ReCheck(target) {
                //console.log('ReCheck', scope.ngModel);
                ctrl.$setViewValue(scope.ngModel);
                let NotReCheck = $(target).attr("not-recheck") === 'true';
                let isValid = false;
                if (!isEmpty(scope.ngModel)) {
                    if (!isEmpty(scope.$parent.masterData[scope.qryMasterdata])) {
                        isValid = scope.$parent.masterData[scope.qryMasterdata].filter(function (element) {
                            return element[scope.rendValue] == scope.ngModel;
                        }).length > 0;
                    }

                    if (isValid) {
                        scope.ngBlur(target);
                    } else {
                        if (!NotReCheck) {
                            ////console.log('ac alert');
                            let options = { 
                                backdrop: false,
                                templateUrl: GetTemplate('dialog-alert'),
                                windowTemplateUrl: GetTemplate('dialog-alert-window'),
                                controller: function ($scope, $uibModalInstance) {
                                    $scope.type = 'danger';
                                    $scope.icon = 'font';
                                    $scope.text = `"${scope.ngModel}" is not found in list.`;
                                     
                                    $scope.fn_OnSuccess = function () { 
                                        $uibModalInstance.close();
                                        scope.StartCheck = false;
                                        $(target).focus(); 
                                    };
                                }
                            };
                    
                            $uibModal.open(options);
 
                        } else {
                            scope.ngBlur(target);
                        }
                    }

                }
            }
            function GetTemplate(FileName) {
                return GLOBAL_VARIABLE.WebUrl + '/Scripts_ngapp/_factory/template/' + FileName + '.html?v=' + moment()
            }
            function FilterObject(list, searchText) {
                if (!isEmpty(scope.filterBy)) {
                    list = FilterBy(list, scope.filterBy);
                }
                return _.filter(list, function (element) {
                    element.label = '';
                    scope.rendLabel.forEach(function (item, index, array) {
                        if (index != array.length - 1) {
                            element.label += element[item] + " ";
                        } else {
                            element.label += element[item];
                        }
                        element.value = element[scope.rendValue];
                    });
                    return element.label.toUpperCase().indexOf(searchText) !== -1;
                });
            }

            function FilterBy(list, filter) {
                let result = [];
                result = _.filter(list, function (element) {
                    for (key in filter) {
                        const _key = key;
                        const _value = filter[key];

                        return element[_key] == _value;
                    }
                });
                return result;
            }

            function GetServerModel() {
                const result = {};
                result.DataSourceId = scope.qryTable;
                result.List_Select = scope.qryColumn;
                result.List_Where = scope.qryWhere;
                result.OrderBy = scope.qryOrder;
                result.List_GroupBy = scope.qryGroup;

                return result;
            }

        }
    };
});