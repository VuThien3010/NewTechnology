angular.module('authServices', [])

.factory('Auth', function($http){
    var authFactory = {};

    authFactory.login = function(regData){
        return $http.post('/api/users', regData);
    }
    return userFactory;
});