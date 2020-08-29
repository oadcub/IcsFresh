app.controller('makeOrderController', function ($scope, $http, NgTableParams, $q, $filter) {
    // todo get base url from webconfig
    // todo get username from login
    $scope.product = {};
    $scope.FilterSearch = {};
    $scope.FilterSearch.DeliveryDate = moment.utc(moment(new Date()).format('DD/MM/YYYY'), 'DDMMYYYY').toDate();
    $scope.FilterSearch.DeliveryDate.setDate(new Date().getDate() + 1);


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

    $scope.searchOrder = () =>
    {
        if ($scope.FilterSearch.CustomerOrderTemplateCode == undefined)
        {
            return;
        }
        if ($scope.masterData.List_OrderTemplateDetail_Origin == undefined)
        {
            $scope.masterData.List_OrderTemplateDetail_Origin = JSON.parse(JSON.stringify($scope.masterData.List_OrderTemplateDetail));
        } else
        {
            $scope.masterData.List_OrderTemplateDetail = JSON.parse(JSON.stringify($scope.masterData.List_OrderTemplateDetail_Origin));
        }

        var order = {};
        order.DeliveryDate = $scope.FilterSearch.DeliveryDate;
        order.TemplateCode = $scope.FilterSearch.CustomerOrderTemplateCode;
        order.CustomerCode = '';
        $http.post(JSHELPER.getWepApiUrl('Orders', 'Search'), JSON.stringify(order)).then(
            function successCallback(response) {
                if (response.data.ErrorView.IsError) {
                    alert(response.data.ErrorView.Message);
                    console.log(response.data.ErrorView);
                } else {
                    $scope.order = response.data.Datas.Data1;
                    if ($scope.order)
                    {
                        $scope.searchOrderDetail();
                    }
                }
            },
            function errorCallback(response) {
                alert(response.data.Message);
                console.log(response);
            });
    }

    $scope.searchOrderDetail = () =>
    {
        $http.get(JSHELPER.getWepApiUrl('Orders', 'SearchDetail')+ '?orderId='+$scope.order.Id).then(
            function successCallback(response) {
                if (response.data.ErrorView.IsError) {
                    alert(response.data.ErrorView.Message);
                    console.log(response.data.ErrorView);
                } else {
                    $scope.order.OrderDetails = response.data.Datas.Data1;
                    $scope.mappingOrderToTemplate();
                }
            },
            function errorCallback(response) {
                alert(response.data.Message);
                console.log(response);
            });
    }

    $scope.mappingOrderToTemplate = () =>
    {
        var productToAdd = $scope.order.OrderDetails.filter((d) =>
        {
            var isFound = false;
            $scope.masterData.List_OrderTemplateDetail.filter((t) =>
            {
                if (d.ProductCode == t.ProductCode && $scope.order.TemplateCode == t.TemplateCode)
                {
                    t.Quantity = +d.Quantity;
                    t.UnitMeter = d.UnitMeter;
                    t.UnitPrice = d.UnitPrice;
                    isFound = true;
                }
            });
            return !isFound;
        });
        productToAdd.filter((d) =>
        {
            var t = {};
            t.TemplateCode = $scope.order.TemplateCode;
            t.ProductCode = d.ProductCode;
            t.Quantity = +d.Quantity;
            t.UnitMeter = d.UnitMeter;
            t.UnitPrice = d.UnitPrice;
            $scope.masterData.List_OrderTemplateDetail.push(t);
        });
    }

    $scope.saveOrder = ()=>
    {
        var order = {};
        order.DeliveryDate = $scope.FilterSearch.DeliveryDate;
        order.TemplateCode = $scope.FilterSearch.CustomerOrderTemplateCode;
        order.CustomerCode = '';
        order.OrderDetails = $scope.masterData.List_OrderTemplateDetail.filter((x) => {
            return x.Quantity > 0 && x.TemplateCode == order.TemplateCode;
        });

        $http.post(JSHELPER.getWepApiUrl('Orders', 'Save'), JSON.stringify(order)).then(
            function successCallback(response) {
                alert('saved');
            },
            function errorCallback(response) {
                alert(response.data.Message);
                console.log(response);
            });
    }


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

    $scope.addProductToTemplate = function (item) {
        let t = {};
        t.TemplateCode = $scope.FilterSearch.CustomerOrderTemplateCode;
        t.ProductCode = item.Code;
        t.UnitMeter = 'KG';
        $scope.masterData.List_OrderTemplateDetail.push(t);
    }

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