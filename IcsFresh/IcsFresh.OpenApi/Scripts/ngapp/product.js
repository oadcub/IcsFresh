angular.module('productApp', ['ngTable', 'ngMaterial'])
    .controller('productController', function ($scope, $http, NgTableParams, $q, $filter) {
        // todo get base url from webconfig
        // todo get username from login
        $scope.product = {};
        $scope.FilterSearch = {};
        $scope.FilterSearch.EtdTo = new Date();
        $scope.FilterSearch.EtdFrom = new Date();
        $scope.FilterSearch.EtdFrom.setMonth(new Date().getMonth() - 3);

        $http.get(JSHELPER.getWepApiUrl('Categories', 'Fetch')).then(
            function successCallback(response) {
                if (response.data.ErrorView.IsError) {
                    alert(response.data.ErrorView.Message);
                    console.log(response.data.ErrorView);
                } else {
                    $scope.categories = response.data.Datas.Data1;
                }
            },
            function errorCallback(response) {
                alert(response.data.Message);
                console.log(response);
            });
        $http.get(JSHELPER.getWepApiUrl('Suppliers', 'Fetch')).then(
            function successCallback(response) {
                if (response.data.ErrorView.IsError) {
                    alert(response.data.ErrorView.Message);
                    console.log(response.data.ErrorView);
                } else {
                    $scope.suppliers = response.data.Datas.Data1;
                }
            },
            function errorCallback(response) {
                alert(response.data.Message);
                console.log(response);
            });
        $scope.fetch = function () {
            $http.get(JSHELPER.getWepApiUrl('Products', 'Fetch')).then(
                function successCallback(response) {
                    if (response.data.ErrorView.IsError) {
                        alert(response.data.ErrorView.Message);
                        console.log(response.data.ErrorView);
                    } else {
                        $scope.CheckAll = false;
                        $scope.searchResult = response.data.Datas.Data1;
                        console.log($scope.searchResult.length);
                        $scope.queryResult = { $: "" };
                        $scope.searchResultTable = new NgTableParams({
                            page: 1,
                            count: 10,
                            filter: $scope.queryResult
                        }, {
                                total: $scope.searchResult.length,
                                getData: function (params) {
                                    deferred = $q.defer();
                                    $scope.finalSearchResult = params.sorting() ? $filter('orderBy')($scope.searchResult, params.orderBy()) : $scope.searchResult;
                                    $scope.finalSearchResult = params.filter() ? $filter('filter')($scope.finalSearchResult, params.filter()) : $scope.finalSearchResult;
                                    params.total($scope.finalSearchResult.length);
                                    $scope.finalSearchResult = $scope.finalSearchResult.slice((params.page() - 1) * params.count(), params.page() * params.count());
                                    //deferred.resolve($scope.finalSearchResult.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                                    console.log($scope.finalSearchResult);
                                    return $scope.finalSearchResult;
                                }
                            });
                        //$scope.$apply();
                    }
                },
                function errorCallback(response) {
                    alert(response.data.Message);
                    console.log(response);
                });
        };

        $scope.insert = function () {
            $http.post(JSHELPER.getWepApiUrl('Products', 'Insert'), JSON.stringify($scope.product)).then(
                function successCallback(response) {
                    if (response.data.ErrorView.IsError) {
                        alert(response.data.ErrorView.Message);
                        console.log(response.data.ErrorView);
                    } else {
                        $scope.product = {};
                        $scope.fetch();
                    }
                },
                function errorCallback(response) {
                    alert(response.data.Message);
                    console.log(response);
                });
        };

        $scope.update = function (item, propName) {
            item.saveingColumn = propName;
            var viewModel = {};
            viewModel.Id = item.Code;
            viewModel.Name = propName;
            viewModel.Value = item[propName];

            $http.put(JSHELPER.getWepApiUrl('Products', 'UpdateProperty'), JSON.stringify(viewModel)).then(
                function successCallback(response) {
                    item.saveingColumn = propName + '_updated';
                },
                function errorCallback(response) {
                    alert(response.data.Message);
                    console.log(response);
                });
        };

        $scope.delete = function (item) {
            $http.delete(JSHELPER.getWepApiUrl('Products', 'Delete') + '/' + item.Code).then(
                function successCallback(response) {
                    if (response.data.ErrorView.IsError) {
                        alert(response.data.ErrorView.Message);
                        console.log(response.data.ErrorView);
                    } else {
                        $scope.fetch();
                    }
                },
                function errorCallback(response) {
                    alert(response.data.Message);
                    console.log(response);
                });
        };

        $scope.getCss = function (item, propName) {
            var css = {
                'updateStatus': item.saveingColumn === propName,
                'updatedStatus': item.saveingColumn === propName + '_updated'
            };
            return css;
        };
        $scope.fetch();
    });