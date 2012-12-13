describe("selectmenu", function () {
    it('should save the ui value into the model when using non native menus and popups', function () {
        var scope, dialogOpen;
        loadHtml('/jqmng/ui/test-fixture.html', function (frame) {
            var page = frame.$('#start');
            page.append(
                '<div data-role="content" ng-init="mysel=\'v1\'">' +
                    '<select ng-model="mysel" id="mysel" data-native-menu="false"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>' +
                    '</div>');
        });
        runs(function () {
            var $ = testframe().$;
            var page = $("#start");
            var select = page.find("#mysel");
            expect(select[0].value).toEqual("v1");
            scope = select.scope();
            expect(scope.mysel).toEqual("v1");
            dialogOpen = function () {
                return select.data('selectmenu').isOpen;
            };
            expect(dialogOpen()).toBeFalsy();
            // find the menu and click on the second entry
            var oldHeight = testframe().$.fn.height;
            testframe().$.fn.height = function () {
                if (this[0].window == testframe()) {
                    return 10;
                }
                return oldHeight.apply(this, arguments);
            };
            select.selectmenu('open');
        });
        waitsFor(function () {
            return dialogOpen();
        });
        runs(function () {
            var $ = testframe().$;
            var dialog = $(".ui-dialog");
            $(dialog.find('li a')[1]).trigger('click')
            expect(scope.mysel).toEqual("v2");
        });
        waitsFor(function () {
            return !dialogOpen();
        });
    });

});
