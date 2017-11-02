angular

    .module('mainApp')

    .controller("bookDetailCtrl", function ($scope, bookDataService) {

        var GBG = chrome.extension.getBackgroundPage();

        var vm = this;

        vm.parallMode = 'true';
        vm.searchFolder = false;

        $scope.$on('handleBroadcast', function () {

            vm.selectFolder = bookDataService.getFolder();
            vm.bookMarkArr = [];
            var singleDiv = [];

            if (vm.selectFolder.bookmarkGroup.length < 17) vm.parallMode = 'false';
            else vm.parallMode = 'true';
            for (var i = 0; i < vm.selectFolder.bookmarkGroup.length; i++) {
                vm.selectFolder.bookmarkGroup[i].favUrl = "chrome://favicon/" +
                    htmlSpecialChars(vm.selectFolder.bookmarkGroup[i].url);
                singleDiv.push(vm.selectFolder.bookmarkGroup[i]);
                if ((i + 1) % 16 === 0) {
                    vm.bookMarkArr.push(singleDiv);
                    singleDiv = [];
                }
            }
            if (singleDiv.length !== 0) vm.bookMarkArr.push(singleDiv);

        });

        function htmlSpecialChars(url) {
            return url.replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
        }

        vm.openPage = function (urlPara) {
            chrome.tabs.create({url: urlPara});
        };

        $(document).ready(function () {
            $('#bookDetails').mousewheel(function (e, delta) {
                this.scrollLeft -= (delta * 50);
                e.preventDefault();
            });
        });


    });