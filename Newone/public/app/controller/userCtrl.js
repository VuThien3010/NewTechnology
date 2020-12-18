
angular.module('userControllers', ['userServices'])
    .controller('regCtrl', function ($http, $location, $timeout, User) {

        var app = this;

        this.regUser = function (regData) {
            app.loading = true;
            app.errorMsg = false;

            User.create(app.regData).then(function (data) {
                console.log(data.data.success);
                console.log(data.data.message);
                if (data.data.success) {
                    app.loading = false;
                    //create success message
                    app.successMsg = data.data.message + ' Redirecting.....';
                    //redirect to homepage
                    $timeout(function () {
                        $location.path('/');
                    }, 2000);
                } else {
                    app.loading = false;
                    //create fail message;
                    app.errorMsg = data.data.message;
                }
            });
        };
    })
    .controller('facebookCtrl', function ($routeParams, Auth, $location, $window) {
        //AuthfacebookToken
        var app = this;

        if ($window.location.pathname == '/facebookerror') {
            app.errorMsg = 'Facebook email not found in database';
        } else {
            Auth.facebook($routeParams.token);
            $location.path('/');
        }

    })

    .controller('googleCtrl', function ($routeParams, Auth, $location, $window) {
        //AuthfacebookToken
        var app = this;

        if ($window.location.pathname == '/googleerror') {
            app.errorMsg = 'Google email not found in database';
        } else {
            Auth.facebook($routeParams.token);
            $location.path('/');
        }

    });

