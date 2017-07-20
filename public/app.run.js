(function () {

    angular
        .module('app')
        .run(run);

    run.$inject = [
        '$rootScope',
        'authService', 'authManager'
    ];

    function run($rootScope, authService, authManager) {
        // Put the authService on $rootScope so its methods
        // can be accessed from the nav bar
        $rootScope.authService = authService;

        // register auth listener
        authService.setupAuth();

        // check auth when they load the page
        authManager.checkAuthOnRefresh();

        // send them back to the login screen if they get an HTTP 401
        //  from an API call
        authManager.redirectWhenUnauthenticated();
    }
})();
