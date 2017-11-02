angular

    .module('mainApp')

    .controller("bookMarksCtrl", function ($scope, $timeout, bookDataService, bookSearchService) {

        var GBG = chrome.extension.getBackgroundPage();

        var vm = this;


        vm.folderTree = [];
        vm.folderArr = [];
        vm.searchArr = [];
        vm.currentFolder = {};
        vm.firstNodeBackUp = {};
        vm.curSelected = '1'; //Need to dynamic
        vm.showScrollDown = 0;
        vm.searchFolder = false;


        vm.folderOderLevel = 0;
        var showFolderNum = 0;


        vm.scrollUp = function () {

            var windowCust = $("#bookMarkCont");

            windowCust.animate({
                scrollTop: 0
            }, 200);

        };

        vm.scrollDown = function () {

            var windowCust = $("#bookMarkCont");

            windowCust.animate({
                scrollTop: windowCust.prop("scrollHeight")
            }, 200);
        };

        vm.scrollReset = function () {

            for (var i = 0; i < vm.folderArr.length; i++) {

                if (vm.folderArr[i].show === "true") showFolderNum--;

                vm.folderArr[i].status = "close";

                if (vm.folderArr[i].parentId === '0') {

                    vm.folderArr[i].show = "true";
                    showFolderNum++;
                }
                else vm.folderArr[i].show = "false";
            }

            bookDataService.prepForBroadcast(vm.firstNodeBackUp);

            vm.curSelected = '1';

            vm.showScrollDown = 0;

        };

        function expendFolderTree(folderTree) {

            for (var i = 0; i < folderTree.length; i++) {

                folderTree[i].status = "close";
                folderTree[i].orderlevel = 0;

                //Todo make it dynamic
                if (folderTree[i].id === '1') {
                    bookDataService.prepForBroadcast(folderTree[i]);
                    vm.currentFolder = folderTree[i];
                    vm.firstNodeBackUp = folderTree[i];
                }

                if (folderTree[i].parentId === '0') {

                    folderTree[i].show = "true";
                    showFolderNum++;
                }
                else folderTree[i].show = "false";

                if (folderTree[i].subFolder.length === 0) {
                    folderTree[i].folderPos = "bot";
                } else {
                    folderTree[i].folderPos = "notBot";
                }


                vm.folderArr.push(folderTree[i]);

                expendFolderTree(folderTree[i].subFolder);

            }
        }

        function showFolderOder(folderTree) {

            for (var i = 0; i < folderTree.length; i++) {

                if (folderTree[i].show === 'true') {
                    folderTree[i].orderlevel = vm.folderOderLevel;
                    vm.folderOderLevel++
                }
            }
        }

        function searchMarks(folderTree, key) {

            var strSearch = new RegExp(key, "gi");

            for (var i = 0; i < folderTree.length; i++) {

                for (var j = 0; j < folderTree[i].bookmarkGroup.length; j++) {

                    var titleMatch = folderTree[i].bookmarkGroup[j].title.match(strSearch);
                    var urlMatch = folderTree[i].bookmarkGroup[j].url.match(strSearch);

                    if (titleMatch != null || urlMatch != null)
                        vm.searchArr.push(folderTree[i].bookmarkGroup[j]);
                }

                searchMarks(folderTree[i].subFolder, key);
            }
        }

        function closeStatus(folder) {

            for (var i = 0; i < folder.subFolder.length; i++) {

                if (folder.subFolder[i].show !== "false") showFolderNum--;

                folder.subFolder[i].show = "false";

                closeStatus(folder.subFolder[i]);
            }

        }

        function reverseStatus(folder) {

            for (var i = 0; i < folder.subFolder.length; i++) {

                folder.subFolder[i].show = "true";
                showFolderNum++;

                if (folder.subFolder[i].status === "open")

                    reverseStatus(folder.subFolder[i]);

            }
        }

        function processBookmark(bookmarks, level, childrenArr, parentNode) {

            if (angular.isUndefined(childrenArr)) {
                childrenArr = vm.folderTree;
            }

            for (var i = 0; i < bookmarks.length; i++) {

                var bookmark = bookmarks[i];

                if (bookmark.url) {
                    if (!angular.isUndefined(parentNode)) parentNode.bookmarkGroup.push(bookmark);
                }

                if (bookmark.children) {

                    if (bookmark.title !== "") {

                        if (!level) level = 0;

                        bookmark.subFolder = [];
                        bookmark.levelNum = level;
                        bookmark.bookmarkGroup = [];
                        bookmark.startPadding = level * 14 + 'px';
                        childrenArr.push(bookmark);
                    }


                    processBookmark(bookmark.children, level + 1, bookmark.subFolder, bookmark);
                }

                if (!angular.isUndefined(bookmark.children)) bookmark.children = "Finish Classification";
            }

        }

        function checkOverflow() {

            if (showFolderNum > 13) {

                vm.showScrollDown = 1;
            }
            else {
                vm.showScrollDown = 0;
            }

        }

        vm.openFolder = function (folder) {

            if (folder.subFolder.length !== 0) {

                if (folder.status === "open") {

                    folder.status = "close";

                    closeStatus(folder);

                } else if (folder.status === "close") {

                    folder.status = "open";

                    reverseStatus(folder);

                }
            } else {

                //TODO Something Here

            }

            checkOverflow();

        };

        vm.folderCtrl = function (folder) {


            bookDataService.prepForBroadcast(folder);

            vm.currentFolder = folder;

            vm.curSelected = folder.id;

            vm.folderOderLevel = 0;

            showFolderOder(vm.folderArr);

            vm.folderOderLevel = 0;

            var horPos = folder.levelNum * 14;
            var vertPos = folder.orderlevel * 24 - 80;

            if (showFolderNum <= 13) vertPos = 0;

            $("#bookMarkCont").animate({
                scrollLeft: horPos,
                scrollTop: vertPos
            }, 50);

            checkOverflow();
        };

        function bookmarkLoad(bookmarks) {

            $timeout(function () {

                processBookmark(bookmarks);

                expendFolderTree(vm.folderTree);

                checkOverflow();

            }, 50);

        }

        chrome.bookmarks.getTree(bookmarkLoad);


        $scope.$on('SearchBroadcast', function () {
            vm.searchInputData = bookSearchService.getModel();
            searchMarks(vm.folderTree, vm.searchInputData);
            vm.searchArr = vm.searchArr.slice(0, 100);
            var searchFolder = {
                bookmarkGroup:vm.searchArr
            };
            if (vm.searchInputData != "") {
                vm.searchFolder = true;
                bookDataService.prepForBroadcast(searchFolder);
            } else {
                vm.searchFolder = false;
                bookDataService.prepForBroadcast(vm.currentFolder);
            }
            vm.searchArr = [];
        });


    })

    .factory('bookDataService', function ($rootScope) {

        var GBG = chrome.extension.getBackgroundPage();

        var bookMarksData = {};
        bookMarksData.data = [];

        bookMarksData.getFolder = function () {
            return bookMarksData.folderTrans;
        };

        bookMarksData.broadcastItem = function () {
            $rootScope.$broadcast('handleBroadcast');
        };

        bookMarksData.prepForBroadcast = function (slectedFolder) {
            bookMarksData.folderTrans = slectedFolder;
            bookMarksData.broadcastItem();
        };

        return bookMarksData;
    });