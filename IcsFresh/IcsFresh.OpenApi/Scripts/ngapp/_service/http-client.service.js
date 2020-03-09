app.service('KdaHttp', function ($http, $q, $uibModal) {
    let root = this;
    var _config = {};
    _config.headers = {};
     
    this.GetAwait = function (url, functionSuccess, params, config) {
        return $http.get(url).then(function (response) {
            return response.data;
        });
    };
    this.Get = function (controller, action, functionSuccess, params, config, isLoading) {
        
        Loading(isLoading);


        let SelfResponse = {};
        _config.headers.UserInfo = 'admin';
        _config.params = params;
        let url = GLOBAL_VARIABLE.getWepApiUrl(controller, action);
        return $http.get(url, _config)
            .then(function (response) {
                SelfResponse = response;
                return ApiSuccess(response.data, functionSuccess);
            }).catch(function (response) {
                SelfResponse = response;
                ApiError(response);
            })
            .finally(function () {
                ApiFinally(url, SelfResponse);
            });
    };
    this.Post = function (controller, action, data, functionSuccess, params, config, isLoading) {
        Loading(isLoading);
        let SelfResponse = {};
        _config.headers.UserInfo = 'admin';
        _config.params = params;
        let url = GLOBAL_VARIABLE.getWepApiUrl(controller, action);
        return $http.post(url, JSON.stringify(data), _config) 
            .then(function (response) {
                SelfResponse = response;
                return ApiSuccess(response.data, functionSuccess);
            }).catch(function (response) {
                SelfResponse = response;
                ApiError(response);
            })
            //.finally(function () {
            //    ApiFinally(url, SelfResponse);
            //});
    };
    this.Put = function (controller, action, data, functionSuccess, params, config, isLoading) {
        Loading(isLoading);
        let SelfResponse = {};
        _config.headers.UserInfo = 'admin';
        _config.params = params;
        let url = GLOBAL_VARIABLE.getWepApiUrl(controller, action);
        return $http.put(url, JSON.stringify(data), _config)
            .then(function (response) {
                SelfResponse = response;
                return ApiSuccess(response.data, functionSuccess);
            }).catch(function (response) {
                SelfResponse = response;
                ApiError(response);
            })
            .finally(function () {
                ApiFinally(url, SelfResponse);
            });
    };
    this.Delete = function (controller, action, functionSuccess, params, config, isLoading) {
        Loading(isLoading);
        let SelfResponse = {};
        let url = GLOBAL_VARIABLE.getWepApiUrl(controller, action);
        _config.headers.UserInfo = 'admin';
        _config.params = params;
        return $http.delete(url, _config)
            .then(function (response) {
                SelfResponse = response;
                return ApiSuccess(response.data, functionSuccess);
            }).catch(function (response) {
                SelfResponse = response;
                ApiError(response);
            })
            .finally(function () {
                ApiFinally(url, SelfResponse);
            });
    };
    // this.Q = function (promise, functionSuccess) {
    //     $q.all(promise).then(function (data) {
    //         try {
    //             if (functionSuccess) {
    //                 functionSuccess(data);
    //             } else {
    //                 return data;
    //             }
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     });
    // };
    function ApiCall(http){

    }
    function Loading(isLoading) {
        if (isEmpty(isLoading) && isLoading !== false) {
            $("#loading").css("display", "block");
        }
    }
    function ApiSuccess(data, functionSuccess) {
        try {
            $('#loading').fadeOut(400, "linear");
            if (functionSuccess) {
                //this.responseData = data;
                functionSuccess.call(this, data);
            } else {
                return data;
            }
        } catch (error) {
            console.error(error);
        }

    }

    function ApiError(response) {
        $('#loading').fadeOut(400, "linear");
        $uibModal.open({
            templateUrl: GLOBAL_VARIABLE.WebUrl + 'Scripts_ngapp/_service/http-client.modal.html?v='+ moment(),
           
            controller: function ($scope,$sce, $uibModalInstance) {
                $scope.highlight = function(text, search) {
                    if (!search) {
                        return $sce.trustAsHtml(text);
                    }
                    return $sce.trustAsHtml(text.replace(new RegExp(search, 'gi'), '<span class="label label-danger">$&</span>'));
                };
                $scope.Content = response;
                $scope.ok = function () {
                    
                    $uibModalInstance.close();
                };
            }
        });
    }

    function ApiFinally(url, response) {
        console.log("api : " + url + " with status " + response.status + " " + response.statusText + " on " + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString());
    }

});