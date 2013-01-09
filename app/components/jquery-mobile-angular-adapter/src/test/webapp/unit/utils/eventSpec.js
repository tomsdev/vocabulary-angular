describe('events', function () {
    describe("event shortcuts", function () {
        it("should eval the expression when the event is fired and provide the even via $event injection", function () {
            var jqmEvents = ['tap', 'taphold', 'swipe', 'swiperight', 'swipeleft', 'vmouseover',
                'vmouseout',
                'vmousedown',
                'vmousemove',
                'vmouseup',
                'vclick',
                'vmousecancel',
                'orientationchange',
                'scrollstart',
                'scrollend',
                'pagebeforeshow',
                'pagebeforehide',
                'pageshow',
                'pagehide'
            ];
            var i,event;
            for (i=0; i<jqmEvents.length; i++) {
                event = jqmEvents[i];
                var d = testutils.compileInPage('<span ngm-' + event + '="check($event)"></span>');
                var element = d.element;
                var scope = element.scope();
                scope.check = jasmine.createSpy('checkEvent');
                var eventObj = $.Event(event);
                element.trigger(eventObj);
                expect(scope.check).toHaveBeenCalledWith(eventObj);
            }
        });

        it("should work together with ng-model", function () {
            var d = testutils.compileInPage('<input ngm-vclick="executed=true" type="text" ng-model="data">');
            var element = d.element;
            var scope = element.scope();
            element.trigger('vclick');
            expect(scope.executed).toEqual(true);
            element.val('test');
            testutils.triggerInputEvent(element);
            expect(scope.data).toBe('test');
        });



    });

});
