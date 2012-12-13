describe('scope reconnect', function () {
    var rootScope, childScope, counter;
    beforeEach(function () {
        rootScope = angular.injector(["ng"]).get("$rootScope");
        childScope = rootScope.$new();
        childScope.$watch(function () {
            counter++;
        });
        counter = 0;
    });
    describe("$disconnect", function () {
        it("should not call watches if the child scope is disconnected", function () {
            childScope.$disconnect();
            rootScope.$digest();
            expect(counter).toBe(0);
        });
        it("should remove the child form the $childHead/$childTail of the parent if it is the only child", function () {
            childScope.$disconnect();
            expect(rootScope.$$childHead).toBe(null);
            expect(rootScope.$$childTail).toBe(null);
        });
        it("should clear $$nextSibling and $$prevSibling", function () {
            var child2 = rootScope.$new();
            rootScope.$new();
            child2.$disconnect();
            expect(child2.$$nextSibling).toBe(null);
            expect(child2.$$prevSibling).toBe(null);
        });
        it("should remove the child form the $childHead/$childTail of the parent if it is the first child", function () {
            var child2 = rootScope.$new();
            childScope.$disconnect();
            expect(rootScope.$$childHead).toBe(child2);
            expect(rootScope.$$childTail).toBe(child2);
        });
        it("should remove the child form the $childHead/$childTail of the parent if it is the last child", function () {
            var child2 = rootScope.$new();
            child2.$disconnect();
            expect(rootScope.$$childHead).toBe(childScope);
            expect(rootScope.$$childTail).toBe(childScope);
        });

    });

    it("should call watches of child scopes if not disconnected", function () {
        rootScope.$digest();
        expect(counter).toBe(2);
    });
    it("should work for the root scope", function () {
        rootScope.$disconnect();
        rootScope.$reconnect();
        rootScope.$digest();
        expect(counter).toBe(2);
    });
    it("should do nothing if the scope is still connected", function () {
        childScope.$reconnect();
        rootScope.$digest();
        expect(counter).toBe(2);
    });
    it("should call watches of reconnected child scopes", function () {
        childScope.$disconnect();
        childScope.$reconnect();
        rootScope.$digest();
        expect(counter).toBe(2);
    });
    it("should be added into the $childHead/$childTail list of the parent", function () {
        childScope.$disconnect();
        childScope.$reconnect();
        expect(rootScope.$$childHead).toBe(childScope);
        expect(rootScope.$$childTail).toBe(childScope);
    });
    it("should work for child of childs", function () {
        var childOfChild = childScope.$new();
        childOfChild.$disconnect();
        var counter2 = 0;
        childOfChild.$watch(function () {
            counter2++;
        });
        childOfChild.$disconnect();
        rootScope.$digest();
        expect(counter2).toBe(0);
        childOfChild.$reconnect();
        rootScope.$digest();
        expect(counter2).toBe(2);
    });
});
