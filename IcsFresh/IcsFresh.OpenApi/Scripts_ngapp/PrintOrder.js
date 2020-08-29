app.controller('printOrderController', function ($scope, $http, NgTableParams, $q, $filter) {
    // todo get base url from webconfig
    // todo get username from login
    $scope.orders = {};
    $scope.templates = [];
    $scope.FilterSearch = {};
    $scope.FilterSearch.DeliveryDate = moment.utc(moment(new Date()).format('DD/MM/YYYY'), 'DDMMYYYY').toDate();
    $scope.FilterSearch.DeliveryDate.setDate(new Date().getDate() + 1);

    $scope.searchOrder = () =>
    {
        var searchObject = {};
        searchObject.DeliveryDate = $scope.FilterSearch.DeliveryDate;
        $http.post(JSHELPER.getWepApiUrl('Orders', 'OrderSummaries'), JSON.stringify(searchObject)).then(
            function successCallback(response) {
                if (response.data.ErrorView.IsError) {
                    alert(response.data.ErrorView.Message);
                    console.log(response.data.ErrorView);
                } else {
                    $scope.orders = response.data.Datas.Data1;
                    $scope.templates = [...new Set($scope.orders.map(item => item.TemplateName))];
                }
            },
            function errorCallback(response) {
                alert(response.data.Message);
                console.log(response);
            });
    }

    $scope.searchOrder();
});