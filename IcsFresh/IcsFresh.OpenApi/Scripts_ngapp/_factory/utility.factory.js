app.factory('KdaUtil', function ($uibModal, KdaHttp, $q) {
    return {
        Dialog: function (Options) {

            let ModalOpts = ModalOption(Options);

            let UibModalModalOpts = {
                backdrop: false,
                templateUrl: GetTemplate('dialog'),
                windowTemplateUrl: GetTemplate('dialog-alert-window'),
                controller: function ($scope, $uibModalInstance) {
                    $scope.Dialog = ModalOpts;

                    $scope.fn_OnSuccess = function () {
                        if (!isEmpty($scope.Dialog.onSuccess)) {
                            $scope.Dialog.onSuccess();
                        }
                        $uibModalInstance.close();
                    };

                    $scope.fn_OnCancel = function () {
                        if (!isEmpty($scope.Dialog.onCancel)) {
                            $scope.Dialog.onCancel();
                        }
                        $uibModalInstance.close();
                    };
                }
            };

            $uibModal.open(UibModalModalOpts);
            // Process 
            function ModalOption(Options) {
                let result = Options;
                result.btnCssClass = 'primary';
                result.btnCancel = true;
                //if (!isEmpty(Options.onCancel)) {
                //    result.isCancel = true;
                //}
                if (isEmpty(Options.textOk)) {
                   result.textOk = 'OK';
                }
                if (isEmpty(Options.textCancel)) {
                   result.textCancel = 'Cancel';
                }
                if (!isEmpty(Options.title)) {
                    result.isTitle = true;
                }
                return result;
            }
        },
        SaveMaster: function () {
            let PromiseList = [];
            let MasterList = {};
            const MaterDataList = $scope.masterData;
            try {
                //List_MtDepartment: {
                //    Department: '',
                //        Status: 1,
                //            BU: ''
                //}
                const selector = $('[save-master]');
               
                selector.each(function (_index, value) {
                    const NgElement = angular.element(this).scope();
                    const Table = NgElement.qryTable;
                    const Key = NgElement.rendValue;
                    const Value = NgElement.ngModel;
                    const MasterData = NgElement.qryMasterdata;
                    const FilterBy = NgElement.filterBy;
                    const QryWhere = NgElement.qryWhere;

                    if (!isEmpty(Table) && !isEmpty(Key) && !isEmpty(Value) && !isEmpty(MasterData)) {
                        const Master = CreateMaster(NgElement.qryTable);
                        const IsDuplicateList = DuplicateList(Master, Key, Value);
                        const IsDuplicateMasterData = DuplicateMasterData(MasterData, Key, Value);
                        if (!IsDuplicateList && !IsDuplicateMasterData) {
                            console.log(`Table [${Table}]`);
                            let Data = CreateData(Key, Value, FilterBy, QryWhere);
                            
                            AddPromise(Master, Data);
                        }
                    }

                });

                // Final
                 Save(PromiseList);
            } catch (error) {
                console.log(error);
            }


            // ##################################################################
            // Validate
            function AddPromise(master, _data) {
                let data = _data;
              
                let params = {
                    id: master
                };

                let promise = KdaHttp.Post('MasterData', 'Insert', JSON.stringify(data), null, params);

                PromiseList.push(promise);
                MasterList[master].push(data);
            }

            function CreateMaster(table) {
                let result = '';
                if (!isEmpty(table)) {
                    if (!MasterList[table]) {
                        MasterList[table] = [];
                        result = table;
                    }
                }
                return result;
            }
            function CreateData(key, value, filterBy, qryWhere) {
                let data = {};
                data[key] = value;
                console.log(`Data ${key} = ${value}`);
                if(!isEmpty(filterBy)){
                    for (var filter in filterBy) {
                        if (filterBy.hasOwnProperty(filter)) {
                            console.log(`Filter ${filter} = ${filterBy[filter]}`);
                            data[filter] = filterBy[filter];
                        }
                    }
                }
                if(!isEmpty(qryWhere)){
                    qryWhere.forEach(function(element, index, array){
                        console.log(`Where ${element.Key} = ${element.Value}`);
                        data[element.Key] = element.Value;
                    });
                }

                return data;
            }
            function DuplicateList(master, key, value) {
                console.log('DuplicateList', MasterList[master]);
                console.log('DuplicateList', value);
                return MasterList[master].filter(function (element) {
                    return element[key] == value;
                }).length > 0;
            }

            function DuplicateMasterData(masterdata, key, value) {
                console.log('DuplicateMasterData', MaterDataList[masterdata]);
                console.log('DuplicateMasterData', key);
                console.log('DuplicateMasterData', value);
                return MaterDataList[masterdata].filter(function (element) {
                    return element[key] == value;
                }).length > 0;
            }
            // Call Api
            function Save(promise) {
                $q.all(promise).then(function (data) {
                    console.log(data);
                }, function (reason) {
                    console.error(reason);
                });
            }

        },
        OpenDialogSuccess: function (text, onSuccess) {
            if(isEmpty(text)) text = 'Seve Successfuly.'
            Alert(text, onSuccess, 'success', 'check');
        },
        OpenDialogError: function (text, onSuccess) {
            Alert(text, onSuccess, 'danger', 'exclamation');
        },
    };

    function Alert(text, onSuccess, type, icon) {
        let options = {
            backdrop: false,
            templateUrl: GetTemplate('dialog-alert'),
            windowTemplateUrl: GetTemplate('dialog-alert-window'),
            controller: function ($scope, $uibModalInstance) {
                $scope.type = type;
                $scope.icon = icon;
                $scope.text = text;
                $scope.onSuccess = onSuccess;

                $scope.fn_OnSuccess = function () {
                    if (!isEmpty($scope.onSuccess)) {
                        $scope.onSuccess();
                    }
                    $uibModalInstance.close();
                };
            }
        };

        $uibModal.open(options);
    }

    function GetTemplate(FileName) {
        return GLOBAL_VARIABLE.WebUrl + '/Scripts_ngapp/_factory/template/' + FileName + '.html';
    }


});

app.directive('kdaGist', function ($compile) {
    return {
        replace: true,
        scope: {
            gistPath: '='
        },
        link: function (scope, elm, attrs) {
            const url = "http://gist-it.appspot.com/https://github.com/baramesh/ieot-shared-components/blob/master/" + scope.gistPath;
            var iframe = document.createElement('iframe');
            iframe.setAttribute('width', '100%');
            iframe.setAttribute('frameborder', '0');
            iframe.id = "gist-" + scope.gistPath;
            elm[0].appendChild(iframe);

            var iframeHtml = '<html><head><base target="_parent"><style>table{font-size:12px;}</style></head><body onload="parent.document.getElementById(\'' + iframe.id + '\').style.height=document.body.scrollHeight + \'px\'"><scr' + 'ipt type="text/javascript" src="' + url + '"></sc' + 'ript></body></html>';

            var doc = iframe.document;
            if (iframe.contentDocument) doc = iframe.contentDocument;
            else if (iframe.contentWindow) doc = iframe.contentWindow.document;

            doc.open();
            doc.writeln(iframeHtml);
            doc.close();
        }
    };
});

app.directive('loading', ['$http', function ($http) {
    return {
        restrict: 'A',
        template: '<div class="loading-spiner"><img src="http://www.nasa.gov/multimedia/videogallery/ajax-loader.gif" /> </div>',
        link: function (scope, elm, attrs) {
            scope.isLoading = function () {
                return $http.pendingRequests.length > 0;
            };

            scope.$watch(scope.isLoading, function (v) {
                if (v) {
                    elm.show();
                } else {
                    elm.hide();
                }
            });
        }
    };
}])

app.directive("kdaExcelFileImport", function () {
    return {
        scope: {
            targetList: '=',
            fieldIndex: '=',
            onSuccess: '&?',
            startRow: '=?',
        },
        link: function ($scope, $elm) {
            $elm.on('change', function (changeEvent) {
                var reader = new FileReader();

                reader.onload = function (e) {
                    $scope.$apply(function () {
                        /* read workbook */
                        var bstr = e.target.result;
                        var workbook = XLSX.read(bstr, {
                            type: 'binary'
                        });

                        var sheet = workbook.Sheets[workbook.SheetNames[0]];
                        var options = {
                            header: 1,
                            defval: '',
                            blankrows: true
                        };
                        var data = XLSX.utils.sheet_to_json(sheet, options);
                        if (!isEmpty($scope.startRow)) {
                            var length = data.length - 1;
                            var start = $scope.startRow - 1;
                            data = data.splice(start, length);
                        }
                        $scope.targetList = [];
                        if (data.length) {
                            data.forEach(function (item, index) {
                                var obj = {};
                                for (key in $scope.fieldIndex) {
                                    var _jsonKey = $scope.fieldIndex[key];
                                    obj[_jsonKey] = item[key];
                                }
                                $scope.targetList.push(obj);
                            });
                        }

                        $elm.val(null);
                        if (!isEmpty($scope.onSuccess)) {

                            OnSuccess($scope.targetList);

                        };
                    });
                };

                reader.readAsBinaryString(changeEvent.target.files[0]);

                function OnSuccess(data) {
                    console.log('call onSuccess', data);

                    this.data = data;
                    $scope.$parent.targetList = data;
                    $scope.onSuccess.call(this, data);
                }
            });
        }
    };
});

app.filter('kdaDateDisplay', function () {
    return function (input,) {
        input = input || '';
        var out = '';
        if (input != '')
            out = moment(input).format('DD/MM/YYYY');

        return out;
    };
})