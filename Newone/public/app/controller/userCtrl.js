angular.module('userControllers', ['userServices'])
    .controller('regCtrl', function ($http, $location, $timeout, User) {

        var app = this;

        this.regUser = function () {
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
                    $timeout(function(){
                        $location.path('/');
                    },2000);
                } else {
                    app.loading = false;
                    //create fail message;
                    app.errorMsg = data.data.message;
                }
            });
        };
    });
