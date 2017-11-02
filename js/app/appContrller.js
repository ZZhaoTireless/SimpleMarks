angular

    .module('mainApp', ['ngMaterial'])

    .config([
        '$compileProvider',
        function ($compileProvider) {
            $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|chrome):|data:image\//);
        }
    ])

    .controller("PageCtrl", function () {

        var GBG = chrome.extension.getBackgroundPage();

    });




