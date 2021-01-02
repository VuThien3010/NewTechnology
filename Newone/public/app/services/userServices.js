angular.module('userServices', [])

    .factory('User', function ($http) {
        var userFactory = {};

        userFactory.create = function (regData) {
            return $http.post('/api/users', regData);
        };
        //User.checkUsername(regData)
        userFactory.checkUsername = function (regData) {
            return $http.post('/api/checkusername', regData);
        };
        //User.checkUseremail(regData)
        userFactory.checkEmail = function (regData) {
            return $http.post('/api/checkemail', regData);
        };
        //User.activateccount(token)
        // userFactory.activateAccount = function (token) {
        //     return $http.put('/api/activate/' + token);
        // }
        userFactory.renewSession = function (username) {
            return $http.get('/api/renewToken' + username);
        };

        userFactory.getPermission = function () {
            return $http.get('/api/permission/');
        };

        // Get all the users from database
        userFactory.getUsers = function () {
            return $http.get('/api/management/');
        };

        userFactory.getUser = function (id) {
            return $http.get('/api/edit/' + id);
        };

        userFactory.deleteUser = function (username) {
            return $http.delete('/api/management/' + username);
        };

        userFactory.editUser = function (id) {
            return $http.put('/api/edit/', id);
        };
        return userFactory;
    });
