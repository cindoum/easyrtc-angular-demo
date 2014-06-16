angular.module('cam', ['ngRoute', 'ngSanitize'])
    .config(['$routeProvider', function ($routeProvider) {
         $routeProvider
            .when('/simplemessaging', {
                templateUrl: 'js/pages/simplemessaging/simplemessaging.html',
                controller: 'simpleMessagingCtrl'
            })
            .when('/channelmessaging', {
                templateUrl: 'js/pages/channelmessaging/channelmessaging.html',
                controller: 'channelMessagingCtrl'
            })
    }])
    .run(function ($rootScope, $location) { //Insert in the function definition the dependencies you need.
    $rootScope.$on("$locationChangeStart",function(event, next, current){
        if (easyrtc.webSocket) {
            easyrtc.disconnect();
        }
    });
});