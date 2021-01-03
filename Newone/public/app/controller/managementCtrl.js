angular
    .module('managementController', [])
    .controller('managementCtrl', function (User, $scope) {
        var app = this;
        app.loading = true;
        app.accessDenied = true;
        app.errorMsg = false;
        app.editAccess = false;
        app.deleteAccess = false;
        app.limit = 5;
        app.searchLimit = 0;

        // Function: get all the users from database
        function getUsers() {
            // Runs function to get all the users from database
            User.getUsers().then(function (data) {
                // Check if able to get data from database
                if (data.data.success) {
                    // Check which permissions the logged in user has
                    if (
                        data.data.permission === 'admin' ||
                        data.data.permission === 'moderator'
                    ) {
                        app.users = data.data.users; // Assign users from database to variable
                        app.loading = false; // Stop loading icon
                        app.accessDenied = false; // Show table
                        // Check if logged in user is an admin or moderator
                        if (data.data.permission === 'admin') {
                            app.editAccess = true; // Show edit button
                            app.deleteAccess = true; // Show delete button
                        } else if (data.data.permission === 'moderator') {
                            app.editAccess = true; // Show edit button
                        }
                    } else {
                        app.errorMsg = 'Insufficient Permissions'; // Reject edit and delete options
                        app.loading = false; // Stop loading icon
                    }
                } else {
                    app.errorMsg = data.data.message; // Set error message
                    app.loading = false; // Stop loading icon
                }
            });
        }

        getUsers();

        app.showMore = function (number) {
            app.showMoreError = false;
            if (number > 0) {
                app.limit = number;
            } else {
                app.showMoreError = 'Please enter a valid number';
            }
        };

        app.showAll = function () {
            app.limit = undefined;
            app.showMoreError = false;
        };

        app.deleteUser = function (username) {
            User.deleteUser(username).then(function (data) {
                if (data.data.success) {
                    getUsers();
                } else {
                    app.showMoreError = data.data.message;
                }
            });
        };

        app.search = function (searchKeyword, number) {
            if (searchKeyword) {
                if (searchKeyword.length > 0) {
                    app.limit = 0;
                    $scope.searchFilter = searchKeyword;
                    app.limit = number;
                } else {
                    $scope.searchFilter = undefined;
                    app.limit = 0;
                }
            } else {
                $scope.searchFilter = undefined;
                app.limit = 0;
            }
        };

        app.clear = function () {
            $scope.number = 'Clear';
            app.limit = 0;
            $scope.searchKeyword;
            $scope.searchFilter;
            app.showMoreError = false;
        };

        // Function: Perform an advanced, criteria-based search
        app.advancedSearch = function (searchByUsername, searchByEmail, searchByName) {
            if (searchByUsername || searchByEmail || searchByName) {
                $scope.advancedSearchFilter = {};
                if (searchByUsername) {
                    $scope.advancedSearchFilter.username = searchByUsername;
                }
                if (searchByEmail) {
                    $scope.advancedSearchFilter.email = searchByEmail;
                }
                if (searchByName) {
                    $scope.advancedSearchFilter.name = searchByName;
                }
                app.searchLimit = undefined;
            }
        };

        app.sortOrder = function(order) {
            app.sort = order;
        };
    })

    .controller('editCtrl', function ($scope, $routeParams, User, $timeout) {
        var app = this;
        $scope.nameTab = 'active'; // Set the 'name' tab to the default active tab
        app.phase1 = true; //

        // Function: get the user that needs to be edited
        User.getUser($routeParams.id).then(function (data) {
            // Check if the user's _id was found in database
            if (data.data.success) {
                $scope.newName = data.data.user.name; // Display user's name in scope
                $scope.newEmail = data.data.user.email; // Display user's e-mail in scope
                $scope.newUsername = data.data.user.username; // Display user's username in scope
                $scope.newPermission = data.data.user.permission; // Display user's permission in scope
                app.currentUser = data.data.user._id; // Get user's _id for update functions
            } else {
                app.errorMsg = data.data.message; // Set error message
                $scope.alert = 'alert alert-danger'; // Set class for message
            }
        });

        app.namePhase = function () {
            $scope.nameTab = 'active';
            $scope.usernameTab = 'default';
            $scope.emailTab = 'default';
            $scope.permissionTab = 'default';
            app.phase1 = true;
            app.phase2 = false;
            app.phase3 = false;
            app.phase4 = false;
            app.errorMsg = false;
        };

        app.emailPhase = function () {
            $scope.nameTab = 'default';
            $scope.usernameTab = 'default';
            $scope.emailTab = 'active';
            $scope.permissionTab = 'default';
            app.phase1 = false;
            app.phase2 = false;
            app.phase3 = true;
            app.phase4 = false;
            app.errorMsg = false;
        };

        app.usernamePhase = function () {
            $scope.nameTab = 'default';
            $scope.usernameTab = 'active';
            $scope.emailTab = 'default';
            $scope.permissionTab = 'default';
            app.phase1 = false;
            app.phase2 = true;
            app.phase3 = false;
            app.phase4 = false;
            app.errorMsg = false;
        };

        app.permissionPhase = function () {
            $scope.nameTab = 'default';
            $scope.usernameTab = 'default';
            $scope.emailTab = 'default';
            $scope.permissionTab = 'active';
            app.phase1 = false;
            app.phase2 = false;
            app.phase3 = false;
            app.phase4 = true;
            app.disableUser = false;
            app.disableModerator = false;
            app.disableAdmin = false;
            app.errorMsg = false;

            if ($scope.newPermission === 'user') {
                app.disableUser = true;
            } else if ($scope.newPermission === 'moderator') {
                app.disableModerator = true;
            } else if ($scope.newPermission === 'admin') {
                app.disableAdmin = true;
            }
        };

        app.updatedName = function (newName, valid) {
            app.errorMsg = false;
            app.disable = true;
            if (valid) {
                var userObject = {};
                userObject._id = app.currentUser;
                userObject.name = $scope.newName;
                User.editUser(userObject).then(function (data) {
                    if (data.data.success) {
                        $scope.alert = 'alert alert-success'; // Set class for message
                        app.successMsg = data.data.message;
                        $timeout(function () {
                            app.nameForm.name.$setPristine();
                            app.nameForm.name.$setUntouched();
                            app.successMsg = false;
                            app.disable = false;
                        }, 2000);
                    } else {
                        $scope.alert = 'alert alert-danger'; // Set class for message
                        app.errorMsg = data.data.message;
                        app.disable = false;
                    }
                });
            } else {
                $scope.alert = 'alert alert-danger'; // Set class for message
                app.errorMsg = 'Please ensure form is filled out properly';
                app.disable = false;
            }
        };

        app.updatedEmail = function (newEmail, valid) {
            app.errorMsg = false;
            app.disable = true;
            if (valid) {
                var userObject = {}; // Create the user object to pass in function
                userObject._id = app.currentUser; // Get the user's _id in order to edit
                userObject.email = $scope.newEmail;
                User.editUser(userObject).then(function (data) {
                    if (data.data.success) {
                        $scope.alert = 'alert alert-success'; // Set class for message
                        app.successMsg = data.data.message; // Set success message
                        // Function: After two seconds, clear and re-enable
                        $timeout(function () {
                            app.emailForm.email.$setPristine(); // Reset e-mail form
                            app.emailForm.email.$setUntouched(); // Reset e-mail form
                            app.successMsg = false; // Clear success message
                            app.disabled = false; // Enable form for editing
                        }, 2000);
                    } else {
                        $scope.alert = 'alert alert-danger'; // Set class for message
                        app.errorMsg = data.data.message;
                        app.disable = false;
                    }
                });
            } else {
                $scope.alert = 'alert alert-danger'; // Set class for message
                app.errorMsg = 'Please ensure form is filled out properly';
                app.disable = false;
            }
        };

        app.updateUsername = function (newUsername, valid) {
            app.errorMsg = false;
            app.disable = true;
            if (valid) {
                var userObject = {};
                userObject._id = app.currentUser;
                userObject.username = $scope.newUsername;
                User.editUser(userObject).then(function (data) {
                    if (data.data.success) {
                        $scope.alert = 'alert alert-success'; // Set class for message
                        app.successMsg = data.data.message;
                        $timeout(function () {
                            app.usernameForm.username.$setPristine();
                            app.usernameForm.username.$setUntouched();
                            app.successMsg = false;
                            app.disable = false;
                        }, 2000);
                    } else {
                        $scope.alert = 'alert alert-danger'; // Set class for message
                        app.errorMsg = data.data.message;
                        app.disable = false;
                    }
                });
            } else {
                $scope.alert = 'alert alert-danger'; // Set class for message
                app.errorMsg = 'Please ensure form is filled out properly';
                app.disable = false;
            }
        };

        app.updatePermissions = function (newPermission) {
            app.errorMsg = false; // Clear any error messages
            app.disableUser = true; // Disable button while processing
            app.disableModerator = true; // Disable button while processing
            app.disableAdmin = true; // Disable button while processing
            var userObject = {}; // Create the user object to pass to function
            userObject._id = app.currentUser; // Get the user _id in order to edit
            userObject.permission = newPermission; // Set the new permission to the user
            // Runs function to udate the user's permission
            User.editUser(userObject).then(function (data) {
                // Check if was able to edit user
                if (data.data.success) {
                    $scope.alert = 'alert alert-success'; // Set class for message
                    app.successMsg = data.data.message; // Set success message
                    // Function: After two seconds, clear and re-enable
                    $timeout(function () {
                        app.successMsg = false; // Set success message
                        $scope.newPermission = newPermission; // Set the current permission variable
                        // Check which permission was assigned to the user
                        if (newPermission === 'user') {
                            app.disableUser = true; // Lock the 'user' button
                            app.disableModerator = false; // Unlock the 'moderator' button
                            app.disableAdmin = false; // Unlock the 'admin' button
                        } else if (newPermission === 'moderator') {
                            app.disableModerator = true; // Lock the 'moderator' button
                            app.disableUser = false; // Unlock the 'user' button
                            app.disableAdmin = false; // Unlock the 'admin' button
                        } else if (newPermission === 'admin') {
                            app.disableAdmin = true; // Lock the 'admin' buton
                            app.disableModerator = false; // Unlock the 'moderator' button
                            app.disableUser = false; // unlock the 'user' button
                        }
                    }, 2000);
                } else {
                    $scope.alert = 'alert alert-danger'; // Set class for message
                    app.errorMsg = data.data.message; // Set error message
                    app.disabled = false; // Enable form for editing
                }
            });
        };


    });
