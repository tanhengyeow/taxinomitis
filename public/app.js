(function () {

    angular
        .module('app', ['ngMaterial', 'ngAnimate', 'ngMessages', 'auth0.lock', 'angular-jwt', 'ui.router'])
        .config(config);

    config.$inject = [
        '$stateProvider',
        '$locationProvider',
        'lockProvider',
        '$urlRouterProvider',
        'jwtOptionsProvider',
        '$httpProvider',
    ];

    function config($stateProvider, $locationProvider, lockProvider, $urlRouterProvider, jwtOptionsProvider, $httpProvider) {

        $stateProvider
            .state('welcome', {
                url: '/welcome',
                templateUrl: 'static/components-<%= VERSION %>/welcome/welcome.html'
            })
            .state('login', {
                url: '/login',
                controller: 'LoginController',
                templateUrl: 'static/components-<%= VERSION %>/login/login.html',
                controllerAs: 'vm',
                params: {
                    VERSION : <%= VERSION %>
                }
            })
            .state('about', {
                url: '/about',
                templateUrl: 'static/components-<%= VERSION %>/about/about.html'
            })
            .state('news', {
                url: '/news',
                templateUrl: 'static/components-<%= VERSION %>/news/news.html'
            })
            .state('help', {
                url: '/help',
                templateUrl: 'static/components-<%= VERSION %>/help/help.html'
            })
            .state('worksheets', {
                url: '/worksheets',
                templateUrl: 'static/components-<%= VERSION %>/worksheets/worksheets.html'
            })
            .state('teacher', {
                url: '/teacher',
                controller: 'TeacherController',
                templateUrl: 'static/components-<%= VERSION %>/teacher/teacher.html',
                controllerAs: 'vm',
                params: {
                    VERSION : <%= VERSION %>
                }
                // },
                // onEnter: checkAuthentication
            })
            .state('projects', {
                url: '/projects',
                controller: 'ProjectsController',
                templateUrl: 'static/components-<%= VERSION %>/projects/projects.html',
                controllerAs: 'vm',
                params: {
                    VERSION : <%= VERSION %>
                }
                // ,
                // onEnter: checkAuthentication
            })
            .state('mlproject', {
                url: '/mlproject/:projectId',
                controller: 'ProjectController',
                templateUrl: 'static/components-<%= VERSION %>/mlproject/mlproject.html',
                controllerAs: 'vm'
                // ,
                // onEnter: checkAuthentication
            })
            .state('mlproject_training', {
                url: '/mlproject/:projectId/training',
                controller: 'TrainingController',
                templateUrl: 'static/components-<%= VERSION %>/training/training.html',
                controllerAs: 'vm',
                params: {
                    VERSION : <%= VERSION %>
                }
                // ,
                // onEnter: checkAuthentication
            })
            .state('mlproject_models', {
                url: '/mlproject/:projectId/models',
                controller: 'ModelsController',
                templateUrl: 'static/components-<%= VERSION %>/models/models.html',
                controllerAs: 'vm'
                // ,
                // onEnter: checkAuthentication
            })
            .state('mlproject_scratch', {
                url: '/mlproject/:projectId/scratch',
                controller: 'ScratchController',
                templateUrl: 'static/components-<%= VERSION %>/scratch/scratch.html',
                controllerAs: 'vm'
                // ,
                // onEnter: checkAuthentication
            });


        // angularAuth0Provider.init({
        //     clientID: AUTH0_CLIENT_ID,
        //     domain: AUTH0_DOMAIN,
        //     responseType: 'token id_token',
        //     audience: AUTH0_AUDIENCE,
        //     redirectUri: AUTH0_CALLBACK_URL,
        //     scope: REQUESTED_SCOPES
        // });

        // $locationProvider.hashPrefix('');

        lockProvider.init({
            clientID : AUTH0_CLIENT_ID,
            domain : AUTH0_DOMAIN,
            options : {
                oidcConformant : true,
                autoclose : true,
                auth : {
                    responseType: 'token id_token',
                    audience: AUTH0_AUDIENCE, // 'https://' + AUTH0_DOMAIN + '/userinfo',
                    redirectUrl: AUTH0_CALLBACK_URL,
                    params: {
                        scope: 'openid email app_metadata'
                    }
                },

                // assuming school computers are shared so doing this would be bad
                rememberLastLogin: false,

                // don't ask for email address as identifier, as we're assuming
                //  kids won't have email addresses so we don't want to confuse
                //  matters by asking for it now
                usernameStyle: 'username',

                // password-reset is for teachers only, so we'll have a separate
                //  way to get to this, and disable it on the default login popup
                allowForgotPassword : false,

                // we don't want people creating their own accounts
                allowSignUp : false
            }
        });



        $urlRouterProvider.otherwise('/welcome');

        jwtOptionsProvider.config({
            tokenGetter: ['options', function (options) {
                if (options && options.url.substr(options.url.length - 5) == '.html') {
                    return null;
                }
                return localStorage.getItem('id_token');
            }],
            whiteListedDomains: ['localhost'],
            unauthenticatedRedirectPath: '/login'
        });

        $httpProvider.interceptors.push('jwtInterceptor');
    }
})();
