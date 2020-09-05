
app.controller('mainController',
    function ($scope, $http, $q, $filter, NgTableParams, KdaHttp, KdaUtil) {
        $scope.KdaHttp = KdaHttp;
        $scope.KdaUtil = KdaUtil;
        $scope.mainApiController = 'MasterData';

        $(function () {
            $scope.getFieldInfo();
            $scope.ViewMode = 'LIST';
            $scope.fn_Search();
        });


        $scope.getFieldInfo = function () {
            KdaHttp.Get(
                $scope.mainApiController, 'GetFieldInfo?id=' + $scope.entityName,
                function (data) {
                    $scope.entity = {
                        name: $scope.entityName,
                        fields: data
                    };
                });
        };


        $scope.fn_Search = function () {
            $scope.ViewMode = 'LIST';
            json = JSON.stringify($scope.searchFilter);
            KdaHttp.Post(
                $scope.mainApiController, 'Search?id=' + $scope.entityName
                , json
                , function (data) {
                    generateSearchResult(data);
                }
            );
        };
        $scope.fn_New = function()
        {
            $scope.ViewMode = 'NEW';
            $scope.viewModel = {};
            $scope.entity.fields.filter(
                function(item) {
                    if (item.DefaultValue !== null)
                    {
                        if (item.Type == 'radio' || item.Type == 'checkbox')
                        {
                            $scope.viewModel[item.FieldName] = (item.DefaultValue == 'true');
                        } else if (item.DefaultValue == 'GUID')
                        {
                            $scope.viewModel[item.FieldName] = newGuid();
                        } else
                        {
                            $scope.viewModel[item.FieldName] = item.DefaultValue;
                        }
                    }
                });
        };
        $scope.fn_Edit = function (item) {
            $scope.ViewMode = 'EDIT';
            json = JSON.stringify(item);
            KdaHttp.Post(
                $scope.mainApiController, 'GetByEntity?id=' + $scope.entityName
                , json
                , function (data) {
                    $scope.viewModel = data[0];
                }
            );
        };
        $scope.fn_Save = function (showResult) {
            if ($scope.ViewMode === 'NEW') {
                json = JSON.stringify($scope.viewModel);
                KdaHttp.Post(
                    $scope.mainApiController, 'Insert?id=' + $scope.entityName
                    , json, function (data) {
                         $scope.fn_Search();
                    });
            } else if ($scope.ViewMode === 'EDIT') {
                json = JSON.stringify($scope.viewModel);
                KdaHttp.Put(
                    $scope.mainApiController, 'Update?id=' + $scope.entityName
                    , json
                    , function (response) {
                         $scope.fn_Search();
                    });
            }

        };
        $scope.dialogDelete = function (item) {
            $scope.DeleteTarget = item;
            $scope.KdaUtil.Dialog({ 'type': 'warning', 'title': 'Confirm delete', 'content': 'Do you to delete?', 'onSuccess': $scope.fn_Delete });
        };

        $scope.fn_Delete = function (item) {
            json = JSON.stringify($scope.DeleteTarget);
            $http.delete(
                GLOBAL_VARIABLE.getWepApiUrl($scope.mainApiController, 'Delete?id=' + $scope.entityName)
                ,
                {
                    data: JSON.stringify(json)
                    , headers: { 'Content-Type': 'application/json' }
                }
            ).then(
                function successCallback(response) {
                    console.log(response);
                    $scope.fn_Search();
                },
                function errorCallback(response) {
                    console.log(response);
                });
        };



        $scope.fn_Cancel = function (action) {
            $scope.ViewMode = 'LIST';
        };

        function generateSearchResult(data) {
            $scope.searchResult = data;
            console.log($scope.searchResult.length);
            $scope.queryResult = { $: "" };
            $scope.searchResultTable = new NgTableParams({
                page: 1,
                count: 10,
                filter: $scope.queryResult
            }
                , {
                    total: $scope.searchResult.length,
                    getData: function (params) {
                        deferred = $q.defer();
                        $scope.finalSearchResult = params.sorting() ? $filter('orderBy')($scope.searchResult, params.orderBy()) : $scope.searchResult;
                        $scope.finalSearchResult = params.filter() ? $filter('filter')($scope.finalSearchResult, params.filter()) : $scope.finalSearchResult;
                        params.total($scope.finalSearchResult.length);
                        $scope.finalSearchResult = $scope.finalSearchResult.slice((params.page() - 1) * params.count(), params.page() * params.count());
                        //deferred.resolve($scope.finalSearchResult.slice((params.page() - 1) * params.count(), params.page() * params.count()));

                        return $scope.finalSearchResult;
                    }
                }
            );
        }


        $scope.getItems = function (endpoint) {
            var data = [{ id: "1982", name: "Mr Bob" }, { id: "18273", name: "Mrs Katrine" }];
            return data;
        };


        function newGuid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

    });


//[
//    { type: "text", name: "name", label: "Name", required: true },
//    { type: "text", name: "description", label: "Description", required: true },
//    { type: "select", name: "teacher_id", label: "Teacher", endpoint: "/teachers", required: true }
//]