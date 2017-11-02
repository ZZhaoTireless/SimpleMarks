angular

    .module('mainApp')

    .controller("searchBarCtrl", function ($scope,$timeout,bookSearchService) {

        var GBG = chrome.extension.getBackgroundPage();

        var vm = this;

        vm.showSearch = 'false';

        $timeout(function (){
            vm.showSearch = 'true';
        }, 10);

        vm.searchInput = "";

        vm.cleanText = function(){
            $timeout(function (){
                vm.searchInput = "";
            }, 150);
        };

        $scope.$watch('vm.searchInput', function searchOnChange(){
            bookSearchService.prepForBroadcast(vm.searchInput);
        },true);



    })

    .factory('bookSearchService', function ($rootScope) {

        var GBG = chrome.extension.getBackgroundPage();

        var bookSearchData = {};
        bookSearchData.dataModel = "";

        bookSearchData.getModel = function () {
            return bookSearchData.dataModel;
        };

        bookSearchData.broadcastItem = function () {
            $rootScope.$broadcast('SearchBroadcast');
        };

        bookSearchData.prepForBroadcast = function (dataModel) {
            bookSearchData.dataModel = dataModel;
            bookSearchData.broadcastItem();
        };

        return bookSearchData;
    });