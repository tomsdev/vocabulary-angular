describe("regression", function () {
    describe("lists", function () {
        it("should refresh lists with ng-repeat", function () {
            var scope, dialog, dialogOpen;
            loadHtml('/jqmng/ui/test-fixture.html', function (frame) {
                var page = frame.$('#start');
                page.attr('ng-controller', 'PageController');
                page.append(
                    '<div data-role="content">' +
                        '<button ng-click="fill()" id="fill">Fill</button><ul data-role="listview" id="list"><li ng-repeat="item in items"></li></ul>' +
                        '</div>');
                frame.PageController = function ($scope) {
                    $scope.fill = function () {
                        $scope.items = [1, 2];
                    }
                }
            });
            var list, fillBtn;
            runs(function () {
                var $ = testframe().$;
                var page = $("#start");
                list = page.find("#list");
                fillBtn = page.find("#fill");
                fillBtn.click();
            });
            waitsForAsync();
            runs(function () {
                var lis = list.find('li');
                expect(lis.length).toBe(2);
                expect(lis.eq(0).hasClass('ui-li')).toBe(true);
                expect(lis.eq(1).hasClass('ui-li')).toBe(true);
            });
        });

        it("should refresh non visible children as long as the listview itself is not visible", function () {
            loadHtml('/jqmng/ui/test-fixture.html', function (frame) {
                var page = frame.$('#start');
                page.append(
                    '<div data-role="content">' +
                        '<ul data-role="listview" ng-init="list = [1,2]" id="list1" data-inset="true">' +
                        '<li ng-repeat="l in list"><a href="">{{l}}</a></li></ul>' +
                        '</div>');
            });
            runs(function () {
                var $ = testframe().$;
                var btns = $("#list1 li");
                expect(btns.eq(0).hasClass("ui-corner-top")).toBe(true);
                expect(btns.eq(0).hasClass("ui-corner-bottom")).toBe(false);
                expect(btns.eq(1).hasClass("ui-corner-top")).toBe(false);
                expect(btns.eq(1).hasClass("ui-corner-bottom")).toBe(true);

            });
        });

    });

    describe("controlgroup", function () {
        it("should update the corners of children during creation", function () {
            loadHtml('/jqmng/ui/test-fixture.html', function (frame) {
                var page = frame.$('#start');
                page.append(
                    '<div data-role="content">' +
                        '<div data-role="controlgroup" id="group1">' +
                        '<a href="" data-role="button">1</a><a href="" data-role="button">2</a>' +
                        '</div>' +
                        '</div>');
            });
            runs(function () {
                var $ = testframe().$;
                var btns = $("#group1").children("div").children("a");
                expect(btns.eq(0).hasClass("ui-corner-top")).toBe(true);
                expect(btns.eq(0).hasClass("ui-corner-bottom")).toBe(false);
                expect(btns.eq(1).hasClass("ui-corner-top")).toBe(false);
                expect(btns.eq(1).hasClass("ui-corner-bottom")).toBe(true);

            });
        });

        it("should refresh non visible children as long as the controlgroup itself is not visible", function () {
            loadHtml('/jqmng/ui/test-fixture.html', function (frame) {
                var page = frame.$('#start');
                page.append(
                    '<div data-role="content">' +
                        '<div data-role="controlgroup" ng-init="list = [1,2]" id="group1">' +
                        '<a href="" data-role="button" ng-repeat="l in list">{{l}}</a></div>' +
                        '</div>');
            });
            runs(function () {
                var $ = testframe().$;
                var btns = $("#group1").children("div").children("a");
                expect(btns.eq(0).hasClass("ui-corner-top")).toBe(true);
                expect(btns.eq(0).hasClass("ui-corner-bottom")).toBe(false);
                expect(btns.eq(1).hasClass("ui-corner-top")).toBe(false);
                expect(btns.eq(1).hasClass("ui-corner-bottom")).toBe(true);

            });
        });
    });

    describe('namespace', function() {
        it("should allow to use a different jquery mobile namespace", function() {
            loadHtml('/jqmng/ui/empty-fixture.html', function (frame) {
                var $ = frame.$;
                $.mobile.ns = "jqm-";
                $("body").append('<div data-jqm-role="page" id="page"><div data-jqm-role="header"><h1>hello</h1></div></div>');
            });
            runs(function () {
                var page = testframe().$("#page");
                expect(page.hasClass("ui-page")).toBe(true);
                expect(page.children("div").hasClass("ui-header")).toBe(true);
            });

        });

    });

  describe('navigation', function() {
      // Note: This test is the reason for the deferAngularBootstrap handling!
      it("should navigate correctly when angular is loaded before jqm", function() {
          var $, win;
          loadHtml('/jqmng/ui/test-fixture-deferredBootstrap.html#/jqmng/ui/page1.html');
          runs(function () {
              win = testframe();
              $ = win.$;
              $.mobile.changePage("page2.html");
          });
          runs(function() {
              win.history.back();
          });
          waits(1000);
          runs(function() {
              expect($.mobile.activePage.attr("id")).toBe("page1");
          });
      });


      it('should be able to start at a subpage in jqmCompatMode when using the $location service in a main controller', function() {
          var $, win;
          loadHtml('/jqmng/ui/test-fixture.html#page2', function(win) {
              win.$("body").attr("ng-controller", "MainController");
              win.MainController = function($location) {

              };
          });
          runs(function () {
              win = testframe();
              $ = win.$;
              expect($.mobile.activePage.attr("id")).toBe("page2");
          });
      });

  });

});
