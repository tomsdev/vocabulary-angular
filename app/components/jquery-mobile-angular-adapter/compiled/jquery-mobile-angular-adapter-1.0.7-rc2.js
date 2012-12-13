/**
* jQuery Mobile angularJS adaper v1.0.7-rc2
* http://github.com/tigbro/jquery-mobile-angular-adapter
*
* Copyright 2011, Tobias Bosch (OPITZ CONSULTING GmbH)
* Licensed under the MIT license.
*/
(function($) {
    function patch(obj, fnName, callback) {
        var _old = obj[fnName];
        obj[fnName] = function() {
            return callback(_old, this, arguments);
        }
    }

    // selectmenu may create parent elements and extra pages
    patch($.mobile.selectmenu.prototype, 'destroy', function(old, self, args) {
        old.apply(self, args);
        var menuPage = self.menuPage;
        var screen = self.screen;
        var listbox = self.listbox;
        menuPage && menuPage.remove();
        screen && screen.remove();
        listbox && listbox.remove();
    });

    // Listview may create subpages that need to be removed when the widget is destroyed.
    patch($.mobile.listview.prototype, "destroy", function(old, self, args) {
        // Destroy the widget instance first to prevent
        // a stack overflow.
        // Note: If there are more than 1 listview on the page, childPages will return
        // the child pages of all listviews.
        var id = self.element.attr('id');
        var childPageRegex = new RegExp($.mobile.subPageUrlKey + "=" +id+"-");
        var childPages = self.childPages();
        old.apply(self, args);
        for (var i=0; i<childPages.length; i++) {
            var childPage = $(childPages[i]);
            var dataUrl = childPage.attr('data-url');
            if (dataUrl.match(childPageRegex)) {
                childPage.remove();
            }
        }
    });

    // Copy of the initialization code from jquery mobile for controlgroup.
    // Needed in jqm 1.1, as we want to do a manual initialization.
    // See the open task in jqm 1.1 for controlgroup.
    if ( $.fn.controlgroup ) {
        $( document ).bind( "pagecreate create", function( e ){
            $( ":jqmData(role='controlgroup')", e.target )
                .jqmEnhanceable()
                .controlgroup({ excludeInvisible: false });
        });
    }

    // controlgroup should not exclude invisible children
    // as long as it is not visible itself!
    patch($.fn, "controlgroup", function(old, self, args) {
        if (self.filter(":visible").length===0) {
            var options = args[0] || {};
            options.excludeInvisible = false;
            return old.call(self, options);
        }
        return old.apply(self, args);
    });

})(window.jQuery);
(function (angular) {

    var ng = angular.module('ng');
    ng.config(['$provide', function($provide) {
        $provide.decorator('$rootScope', ['$delegate', function($rootScope) {
            $rootScope.$disconnect = function() {
                if (this.$root == this) return; // we can't disconnect the root node;
                var parent = this.$parent;
                this.$$disconnected = true;
                // See Scope.$destroy
                if (parent.$$childHead == this) parent.$$childHead = this.$$nextSibling;
                if (parent.$$childTail == this) parent.$$childTail = this.$$prevSibling;
                if (this.$$prevSibling) this.$$prevSibling.$$nextSibling = this.$$nextSibling;
                if (this.$$nextSibling) this.$$nextSibling.$$prevSibling = this.$$prevSibling;
                this.$$nextSibling = this.$$prevSibling = null;
            };
            $rootScope.$reconnect = function() {
                if (this.$root == this) return; // we can't disconnect the root node;
                var child = this;
                if (!child.$$disconnected) {
                    return;
                }
                var parent = child.$parent;
                child.$$disconnected = false;
                // See Scope.$new for this logic...
                child.$$prevSibling = parent.$$childTail;
                if (parent.$$childHead) {
                    parent.$$childTail.$$nextSibling = child;
                    parent.$$childTail = child;
                } else {
                    parent.$$childHead = parent.$$childTail = child;
                }

            };
            return $rootScope;
        }]);
    }]);
})(window.angular);
(function (angular) {
    var ng = angular.module('ng');
    ng.config(['$provide', function ($provide) {
        $provide.decorator('$rootScope', ['$delegate', function ($rootScope) {
            var _apply = $rootScope.$apply;
            $rootScope.$apply = function () {
                if ($rootScope.$$phase) {
                    return $rootScope.$eval.apply(this, arguments);
                }
                return _apply.apply(this, arguments);
            };
            var refreshing = false;
            var _digest = $rootScope.$digest;
            $rootScope.$digest = function () {
                if ($rootScope.$$phase) {
                    return;
                }
                var res = _digest.apply(this, arguments);
            };
            return $rootScope;
        }]);
    }]);
})(window.angular);
(function ($, angular) {
    // Only digest the $.mobile.activePage when rootScope.$digest is called.
    var ng = angular.module('ng');
    $('div').live('pagebeforeshow', function (event, data) {
        var page = $(event.target);
        var currPageScope = page.scope();
        if (currPageScope) {
            currPageScope.$root.$digest();
        }
    });

    ng.config(['$provide', function ($provide) {
        $provide.decorator('$rootScope', ['$delegate', function ($rootScope) {
            var _$digest = $rootScope.$digest;
            var lastActiveScope;
            $rootScope.$digest = function () {
                if (this === $rootScope) {
                    var p = $.mobile.activePage;
                    var activeScope = p && p.scope();
                    if (lastActiveScope && lastActiveScope !== activeScope) {
                        lastActiveScope.$disconnect();
                    }
                    lastActiveScope = activeScope;
                    if (activeScope) {
                        activeScope.$reconnect();
                    }
                }
                var res = _$digest.apply(this, arguments);
                if (this === $rootScope) {
                    var hasPages = lastCreatedPages.length;
                    while (lastCreatedPages.length) {
                        var pageScope = lastCreatedPages.shift();
                        // Detach the scope of the created pages from the normal $digest cycle.
                        // Needed so that only $.mobile.activePage gets digested when rootScope.$digest
                        // is called.
                        // However, allow one digest to process every page
                        // so that we can use ng-repeat also for jqm pages!
                        pageScope.$disconnect();
                    }
                    if (hasPages && !jqmInitialized) {
                        jqmInitialized = true;
                        $.mobile.initializePage();
                    }
                }

                return res;
            };
            return $rootScope;
        }]);
    }]);

    var _execFlags = {};

    function execWithFlag(flag, fn) {
        if (!fn) {
            return _execFlags[flag];
        }
        var old = _execFlags[flag];
        _execFlags[flag] = true;
        var res = fn();
        _execFlags[flag] = old;
        return res;
    }

    function preventJqmWidgetCreation(fn) {
        return execWithFlag('preventJqmWidgetCreation', fn);
    }

    function markJqmWidgetCreation(fn) {
        return execWithFlag('markJqmWidgetCreation', fn);
    }

    function createPagesWithoutPageCreateEvent(pages) {
        preventJqmWidgetCreation(function () {
            var oldPrefix = $.mobile.page.prototype.widgetEventPrefix;
            $.mobile.page.prototype.widgetEventPrefix = 'noop';
            pages.page();
            $.mobile.page.prototype.widgetEventPrefix = oldPrefix;
        });
    }


    $.mobile.autoInitializePage = false;
    var jqmInitialized = false;

    var lastCreatedPages = [];

    /**
     * This directive will preprocess the dom during compile.
     * For this, the directive needs to have the highest priority possible,
     * so that it is used even before ng-repeat.
     */
    var preProcessDirective = {
        restrict:'EA',
        priority:100000,
        compile:function (tElement, tAttrs) {
            // Note: We cannot use tAttrs here, as this is also copied when
            // angular uses a directive with the template-property and replace-mode.
            if (tElement[0].preProcessDirective) {
                return;
            }
            tElement[0].preProcessDirective = true;

            // For page elements:
            var roleAttr = tAttrs.role;
            var isPage = roleAttr == 'page' || roleAttr == 'dialog';

            // enhance non-widgets markup.
            markJqmWidgetCreation(function () {
                preventJqmWidgetCreation(function () {

                    if (isPage) {
                        // element contains pages.
                        // create temporary pages for the non widget markup, that we destroy afterwards.
                        // This is ok as non widget markup does not hold state, i.e. no permanent reference to the page.
                        tElement.page();
                    } else {
                        if (!tElement[0].jqmEnhanced) {
                            tElement.parent().trigger("create");
                        }
                    }
                    // Note: The page plugin also enhances child elements,
                    // so we tag the child elements also in that case.
                    // Note: We cannot use $.fn.data here, as this is also copied when
                    // angular uses a directive with the template-property.
                    var children = tElement[0].getElementsByTagName("*");
                    for (var i = 0; i < children.length; i++) {
                        children.item(i).jqmEnhanced = true;
                    }
                    tElement[0].jqmEnhanced = true;

                });
            });

            // Destroy the temporary pages again
            if (isPage) {
                tElement.page("destroy");
            }
        }
    };


    /**
     * This directive creates the jqm widgets.
     */
    var widgetDirective = {
        restrict:'EA',
        // after the normal angular widgets like input, ngModel, ...
        priority:0,
        // This will be changed by the setWidgetScopeDirective...
        scope:false,
        require:['?ngModel'],
        compile:function (tElement, tAttrs) {
            // Note: We cannot use tAttrs here, as this is also copied when
            // angular uses a directive with the template-property and replace-mode.
            if (tElement[0].widgetDirective) {
                return;
            }
            tElement[0].widgetDirective = true;

            // For page elements:
            var roleAttr = tAttrs["role"];
            var isPage = roleAttr == 'page' || roleAttr == 'dialog';
            var widgets = tElement.data("jqm-widgets");
            var linkers = tElement.data("jqm-linkers");
            return {
                pre:function (scope, iElement, iAttrs) {
                    if (isPage) {
                        // Create the page widget without the pagecreate-Event.
                        // This does no dom transformation, so it's safe to call this in the prelink function.
                        createPagesWithoutPageCreateEvent(iElement);
                        lastCreatedPages.push(scope);
                    }
                },
                post:function (scope, iElement, iAttrs, ctrls) {
                    if (widgets && widgets.length) {
                        var widget;
                        for (var i = 0; i < widgets.length; i++) {
                            widget = widgets[i];
                            widget.create.apply(iElement, widget.args);
                        }
                    }
                    if (linkers) {
                        for (var i=0; i<linkers.length; i++) {
                            linkers[i].apply(this, arguments);
                        }
                    }
                }
            };
        }
    };

    /**
     * This widget sets or resets the properties of the actual widgetDirective.
     * This is especially required for the scope property.
     * We need this as angular does not (yet) allow us to create a widget for e.g. data-role="page",
     * but not for data-role="content".
     */
    var setWidgetScopeDirective = {
        restrict:widgetDirective.restrict,
        priority:widgetDirective.priority + 1,
        compile:function (tElement, tAttrs) {
            widgetDirective.scope = (tAttrs.role == 'page' || tAttrs.role == 'dialog');
        }
    };

    /**
     * Register our directives for all possible elements with jqm markup.
     * Note: We cannot just create a widget for the jqm-widget attribute, that we create,
     * as this would not work for the jqm widgets on the root element of the compile
     * (angular calculates the directives to apply before calling the compile function of
     * any of those directives).
     * @param tagList
     */
    function registerDirective(tagList) {
        for (var i = 0; i < tagList.length; i++) {
            ng.directive(tagList[i], function () {
                return preProcessDirective;
            });
            ng.directive(tagList[i], function () {
                return setWidgetScopeDirective;
            });
            ng.directive(tagList[i], function () {
                return widgetDirective;
            });
        }
    }

    registerDirective(['div', 'role', 'input', 'select', 'button', 'textarea', 'fieldset']);

    $.fn.orig = {};

    function patchJq(fnName, callback) {
        $.fn.orig[fnName] = $.fn.orig[fnName] || $.fn[fnName];
        $.fn[fnName] = callback;
    }

    // If jqm loads a page from an external source, angular needs to compile it too!
    ng.run(['$rootScope', '$compile', function ($rootScope, $compile) {
        patchJq('page', function () {
            if (!preventJqmWidgetCreation() && !this.data("page")) {
                if (this.attr("data-" + $.mobile.ns + "external-page")) {
                    $compile(this)($rootScope);
                }
            }
            return $.fn.orig.page.apply(this, arguments);
        });
    }]);

    function patchJqmWidget(widgetName) {
        patchJq(widgetName, function () {
            if (markJqmWidgetCreation()) {
                for (var k = 0; k < this.length; k++) {
                    var element = this.eq(k);
                    var widgetElement = element;
                    var linkElement = element;
                    var createData = {
                        widgetElement:widgetElement,
                        linkElement:linkElement,
                        create:$.fn.orig[widgetName]
                    };
                    if (jqmNgWidgets[widgetName].precompile) {
                        jqmNgWidgets[widgetName].precompile(createData);
                        // allow the precompile to change the element to which
                        // we add the data.
                        widgetElement = createData.widgetElement;
                        linkElement = createData.linkElement;
                    }
                    var jqmWidgets = widgetElement.data("jqm-widgets");
                    if (!jqmWidgets) {
                        jqmWidgets = [];
                        widgetElement.data("jqm-widgets", jqmWidgets);
                    }
                    var linkers = linkElement.data("jqm-linkers");
                    if (!linkers) {
                        linkers = [];
                        linkElement.data("jqm-linkers", linkers);
                    }

                    var widgetExists = false;
                    for (var i = 0; i < jqmWidgets.length; i++) {
                        if (jqmWidgets[i].name == widgetName) {
                            widgetExists = true;
                            break;
                        }
                    }
                    if (!widgetExists) {
                        jqmWidgets.push({name:widgetName, args:Array.prototype.slice.call(arguments), create:createData.create});
                        linkers.push(jqmNgWidgets[widgetName].link);
                    }
                }
            }
            if (preventJqmWidgetCreation()) {
                return false;
            }
            return $.fn.orig[widgetName].apply(this, arguments);
        });
    }

    var jqmNgWidgets = {};

    $.mobile.registerJqmNgWidget = function (widgetName, precompileFn, linkFn) {
        jqmNgWidgets[widgetName] = {
            precompile: precompileFn,
            link:linkFn
        };
        patchJqmWidget(widgetName);
    }
})(window.jQuery, window.angular);
(function (angular, $) {
    var widgetConfig = {
        button:{
            handlers:[disabledHandler],
            precompile:buttonPrecompile
        },
        collapsible:{
            handlers:[disabledHandler]
        },
        textinput:{
            handlers:[disabledHandler],
            precompile:textinputPrecompile
        },
        checkboxradio:{
            handlers:[disabledHandler, refreshAfterNgModelRender],
            precompile:checkboxRadioPrecompile
        },
        slider:{
            handlers:[disabledHandler, refreshAfterNgModelRender],
            precompile:sliderPrecompile
        },
        listview:{
            handlers:[refreshOnChildrenChange]
        },
        collapsibleset:{
            handlers:[refreshOnChildrenChange]
        },
        selectmenu:{
            handlers:[disabledHandler, refreshAfterNgModelRender, refreshOnChildrenChange],
            precompile:selectmenuPrecompile
        },
        controlgroup:{
            handlers:[refreshControlgroupOnChildrenChange]
        },
        navbar:{
            handlers:[]
        },
        dialog:{
            handlers:[]
        },
        fixedtoolbar:{
            handlers:[]
        }
    };

    function mergeHandlers(widgetName, list) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(widgetName);
            for (var i = 0; i < list.length; i++) {
                list[i].apply(this, args);
            }
        }
    }

    var config;
    for (var widgetName in widgetConfig) {
        config = widgetConfig[widgetName];
        $.mobile.registerJqmNgWidget(widgetName, config.precompile, mergeHandlers(widgetName, config.handlers));
    }

    // -------------------
    // precompile functions

    // Checkboxradio wraps the input and label into a new element.
    // The angular compiler does not like this, as it changes elements that are not
    // in the subtree of the input element that is currently linked.
    function checkboxRadioPrecompile(createData) {
        var origElement = createData.widgetElement;
        // Selectors: See the checkboxradio-Plugin in jqm.
        var parentLabel = $(origElement).closest("label");
        var label = parentLabel.length ? parentLabel : $(origElement).closest("form,fieldset,:jqmData(role='page'),:jqmData(role='dialog')").find("label").filter("[for='" + origElement[0].id + "']");
        var wrapper = $("<div></div>").insertBefore(origElement).append(origElement).append(label);
        createData.widgetElement = origElement.parent();
        moveCloningDirectives(origElement, createData.widgetElement);

        createData.create = function () {
            var _wrapAll = $.fn.wrapAll;
            var input = this.children("input");
            var wrapper = this;
            $.fn.wrapAll = function(container) {
                if (this[0] === input[0]) {
                    $.fn.wrapAll = _wrapAll;
                    var tempContainer = $(container);
                    wrapper[0].className = tempContainer[0].className;
                    return origElement;
                }
                return _wrapAll.apply(this, arguments);
            };

            var res = $.fn.orig.checkboxradio.apply(input, arguments);
            $.fn.wrapAll = _wrapAll;
            return res;
        }
    }


    // Slider appends a new element after the input/select element for which it was created.
    // The angular compiler does not like this, so we wrap the two elements into a new parent node.
    function sliderPrecompile(createData) {
        var origElement = createData.widgetElement;
        origElement.wrapAll("<div></div>");
        var wrapper = createData.widgetElement = createData.widgetElement.parent();
        moveCloningDirectives(origElement, wrapper);

        createData.create = function () {
            return $.fn.orig.slider.apply(this.children().eq(0), arguments);
        };
    }

    // Button wraps itself into a new element.
    // Angular does not like this, so we do it in advance.
    function buttonPrecompile(createData) {
        var origElement = createData.widgetElement;
        var wrapper = $( "<div></div>" )
            .text( origElement.text() || origElement.val() )
            .insertBefore(origElement)
            .append(origElement);
        moveCloningDirectives(origElement, wrapper);
        createData.widgetElement = wrapper;
        createData.create = function () {
            var wrapper = this;
            var button = this.children().eq(0);

            var _text = $.fn.text;
            $.fn.text = function () {
                if (arguments.length>0) {
                    // Only catch the first setter call
                    $.fn.text = _text;
                    return wrapper;
                }
                return _text.apply(this, arguments);
            };

            var _insertBefore = $.fn.insertBefore;
            $.fn.insertBefore = function (element) {
                if (this[0] === wrapper[0] && element[0] === button[0]) {
                    return wrapper;
                }
                return _insertBefore.apply(this, arguments);
            };

            var res = $.fn.orig.button.apply(button, arguments);

            $.fn.text = _text;
            $.fn.insertBefore = _insertBefore;
            return res;
        };

    }

    // selectmenu wraps itself into a new element.
    // Angular does not like this, so we do it in advance.
    function selectmenuPrecompile(createData) {
        var origElement = createData.widgetElement;
        var wrapper = $("<div></div>").insertBefore(origElement).append(origElement);
        moveCloningDirectives(origElement, wrapper);
        createData.widgetElement = wrapper;
        createData.create = function () {
            var wrapper = this;
            var select = this.children().eq(0);

            var _wrap = $.fn.wrap;
            $.fn.wrap = function(container) {
                if (this[0] === select[0]) {
                    $.fn.wrap = _wrap;
                    var tempContainer = $(container);
                    wrapper[0].className = tempContainer[0].className;

                    return select;
                }
                return _wrap.apply(this, arguments);
            };

            var res = $.fn.orig.selectmenu.apply(select, arguments);

            $.fn.wrap = _wrap;
            return res;
        };

    }

    // textinput for input-type "search" wraps itself into a new element
    function textinputPrecompile(createData) {
        var origElement = createData.widgetElement;
        if ( !origElement.is( "[type='search'],:jqmData(type='search')" ) ) {
            return;
        }
        var wrapper = $("<div></div>").insertBefore(origElement).append(origElement);
        moveCloningDirectives(origElement, wrapper);
        createData.widgetElement = wrapper;
        createData.create = function () {
            var wrapper = this;
            var select = this.children().eq(0);

            var _wrap = $.fn.wrap;
            $.fn.wrap = function(container) {
                if (this[0] === select[0]) {
                    $.fn.wrap = _wrap;
                    var tempContainer = $(container);
                    wrapper[0].className = tempContainer[0].className;

                    return select;
                }
                return _wrap.apply(this, arguments);
            };

            var res = $.fn.orig.textinput.apply(select, arguments);

            $.fn.wrap = _wrap;
            return res;
        };
    }

    var CLONING_DIRECTIVE_REGEXP = /(^|[\W])(repeat|switch-when|if)($|[\W])/;

    function moveCloningDirectives(source, target) {
        // iterate over the attributes
        var cloningAttrNames = [];
        var node = source[0];
        var targetNode = target[0];
        var nAttrs = node.attributes;
        var attrCount = nAttrs && nAttrs.length;
        if (attrCount) {
            for (var attr, name,
                     j = attrCount - 1; j >= 0; j--) {
                attr = nAttrs[j];
                name = attr.name;
                if (CLONING_DIRECTIVE_REGEXP.test(name)) {
                    node.removeAttributeNode(attr);
                    targetNode.setAttributeNode(attr);
                }
            }
        }

        // iterate over the class names.
        var targetClassName = '';
        var className = node.className;
        var match;
        if (className) {
            className = className.replace(/[^;]+;?/, function (match) {
                if (CLONING_DIRECTIVE_REGEXP.test(match)) {
                    targetClassName += match;
                    return '';
                }
                return match;
            });
        }
        if (targetClassName) {
            targetNode.className = targetClassName;
            node.className = className;
        }
    }

    // Expose for tests.
    $.mobile.moveCloningDirectives = moveCloningDirectives;


    // -------------------
    // link handlers
    function disabledHandler(widgetName, scope, iElement, iAttrs, ctrls) {
        iAttrs.$observe("disabled", function (value) {
            if (value) {
                iElement[widgetName]("disable");
            } else {
                iElement[widgetName]("enable");
            }
        });
    }

    function addCtrlFunctionListener(ctrl, ctrlFnName, fn) {
        var listenersName = "_listeners" + ctrlFnName;
        if (!ctrl[listenersName]) {
            ctrl[listenersName] = [];
            var oldFn = ctrl[ctrlFnName];
            ctrl[ctrlFnName] = function () {
                var res = oldFn.apply(this, arguments);
                for (var i = 0; i < ctrl[listenersName].length; i++) {
                    ctrl[listenersName][i]();
                }
                return res;
            };
        }
        ctrl[listenersName].push(fn);
    }

    function refreshAfterNgModelRender(widgetName, scope, iElement, iAttrs, ctrls) {
        var ngModelCtrl = ctrls[0];
        if (ngModelCtrl) {
            addCtrlFunctionListener(ngModelCtrl, "$render", function () {
                triggerAsyncRefresh(widgetName, scope, iElement, "refresh");
            });
        }
    }

    function refreshControlgroupOnChildrenChange(widgetName, scope, iElement, iAttrs, ctrls) {
        iElement.bind("$childrenChanged", function () {
            triggerAsyncRefresh(widgetName, scope, iElement, {});
        });
    }


    function refreshOnChildrenChange(widgetName, scope, iElement, iAttrs, ctrls) {
        iElement.bind("$childrenChanged", function () {
            triggerAsyncRefresh(widgetName, scope, iElement, "refresh");
        });
    }

    function triggerAsyncRefresh(widgetName, scope, iElement, options) {
        var prop = "_refresh" + widgetName;
        scope[prop] = scope[prop] + 1 || 1;
        scope.$evalAsync(function () {
            scope[prop]--;
            if (scope[prop] === 0) {
                iElement[widgetName](options);
            }
        });
    }


})(window.angular, window.jQuery);
(function (angular, $) {
    /**
     * Deactivate the url changing capabilities
     * of angular, so we do not get into trouble with
     * jquery mobile: angular saves the current url before a $digest
     * and updates the url after the $digest.
     * <p>
     * This also replaces the hashListen implementation
     * of angular by the jquery mobile impementation,
     * so we do not have two polling functions, ...
     * <p>
     * Attention: By this, urls can no more be changed via angular's $location service!
     */

    var ng = angular.module("ng");

    function deactivateAngularLocationService($browser) {
        $browser.onHashChange = function (handler) {
            $(window).bind('hashchange', handler);
            return handler;
        };
        var lastUrl = location.href;
        $browser.url = function (url) {
            if (url) {
                lastUrl = url;
            }
            return lastUrl;
        };
    }

    deactivateAngularLocationService.$inject = ['$browser'];
    ng.run(deactivateAngularLocationService);
})(window.angular, window.jQuery);
(function ($, angular) {
    // Patch for ng-repeat to fire an event whenever the children change.
    // Only watching Scope create/destroy is not enough here, as ng-repeat
    // caches the scopes during reordering.

    function shallowEquals(collection1, collection2) {
        if (!!collection1 ^ !!collection2) {
            return false;
        }
        for (var x in collection1) {
            if (collection2[x] !== collection1[x]) {
                return false;
            }
        }
        for (var x in collection2) {
            if (collection2[x] !== collection1[x]) {
                return false;
            }
        }
        return true;
    }

    function shallowClone(collection) {
        if (!collection) {
            return collection;
        }
        var res;
        if (collection.length) {
            res = [];
        } else {
            res = {};
        }
        for (var x in collection) {
            res[x] = collection[x];
        }
        return res;
    }

    var mod = angular.module('ng');
    mod.directive('ngRepeat', function () {
        return {
            priority:1000, // same as original repeat
            compile:function (element, attr, linker) {
                return {
                    pre:function (scope, iterStartElement, attr) {
                        var expression = attr.ngRepeat;
                        var match = expression.match(/^.+in\s+(.*)\s*$/);
                        if (!match) {
                            throw Error("Expected ngRepeat in form of '_item_ in _collection_' but got '" +
                                expression + "'.");
                        }
                        var collectionExpr = match[1];
                        var lastCollection;
                        var changeCounter = 0;
                        scope.$watch(function () {
                            var collection = scope.$eval(collectionExpr);
                            if (!shallowEquals(collection, lastCollection)) {
                                lastCollection = shallowClone(collection);
                                changeCounter++;
                            }
                            return changeCounter;
                        }, function () {
                            // Note: need to be parent() as jquery cannot trigger events on comments
                            // (angular creates a comment node when using transclusion, as ng-repeat does).
                            iterStartElement.parent().trigger("$childrenChanged");
                        });
                    }
                };
            }
        };
    });
})(window.jQuery, window.angular);
(function ($, angular) {
    // This is a copy of parts of angular's ngOptions directive to detect changes in the values
    // of ngOptions (emits the $childrenChanged event on the scope).
    // This is needed as ngOptions does not provide a way to listen to changes.

    function sortedKeys(obj) {
        var keys = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys.sort();
    }

    var NG_OPTIONS_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w\d]*)|(?:\(\s*([\$\w][\$\w\d]*)\s*,\s*([\$\w][\$\w\d]*)\s*\)))\s+in\s+(.*)$/;
    var mod = angular.module('ng');
    mod.directive('ngOptions', ['$parse', function ($parse) {
        return {
            require: ['select', '?ngModel'],
            link:function (scope, element, attr, ctrls) {
                // if ngModel is not defined, we don't need to do anything
                if (!ctrls[1]) return;

                var match;
                var optionsExp = attr.ngOptions;

                if (! (match = optionsExp.match(NG_OPTIONS_REGEXP))) {
                    throw Error(
                        "Expected ngOptions in form of '_select_ (as _label_)? for (_key_,)?_value_ in _collection_'" +
                            " but got '" + optionsExp + "'.");
                }

                var displayFn = $parse(match[2] || match[1]),
                    valueName = match[4] || match[6],
                    keyName = match[5],
                    groupByFn = $parse(match[3] || ''),
                    valueFn = $parse(match[2] ? match[1] : valueName),
                    valuesFn = $parse(match[7]);

                scope.$watch(optionsModel, function() {
                    element.trigger("$childrenChanged");
                }, true);

                function optionsModel() {
                    var optionGroups = [], // Temporary location for the option groups before we render them
                        optionGroupName,
                        values = valuesFn(scope) || [],
                        keys = keyName ? sortedKeys(values) : values,
                        length,
                        index,
                        locals = {};

                    // We now build up the list of options we need (we merge later)
                    for (index = 0; length = keys.length, index < length; index++) {
                        var value = values[index];
                        locals[valueName] = values[keyName ? locals[keyName]=keys[index]:index];
                        optionGroupName = groupByFn(scope, locals);
                        optionGroups.push({
                            id: keyName ? keys[index] : index,   // either the index into array or key from object
                            label: displayFn(scope, locals), // what will be seen by the user
                            optionGroup: optionGroupName
                        });
                    }
                    return optionGroups;
                }
            }
        };
    }]);


})(window.jQuery, window.angular);
(function (angular) {
    var ng = angular.module("ng");
    ng.directive('option', ['$interpolate', function ($interpolate) {
        return {
            restrict:'E',
            compile:function (tElement, tAttrs) {
                var textInterpolateFn = $interpolate(tElement.text(), true);
                var valueInterpolateFn = $interpolate(tElement.attr('value'), true);
                return function (scope, iElement, iAttrs) {
                    scope.$watch(textInterpolateFn, function () {
                        iElement.trigger("$childrenChanged");
                    });
                    scope.$watch(valueInterpolateFn, function () {
                        iElement.trigger("$childrenChanged");
                    });
                }
            }
        };
    }]);
})(window.angular);
(function (angular) {
    var ng = angular.module("ng");
    ng.directive('li', function() {
        return {
            restrict:'E',
            compile:function (tElement, tAttrs) {
                return function (scope, iElement, iAttrs) {
                    iElement.bind("$childrenChanged", function () {
                        iElement.removeClass("ui-li");
                        var buttonElements = iElement.data("buttonElements");
                        if (buttonElements) {
                            var text = buttonElements.text;
                            while (text.firstChild) {
                                iElement[0].appendChild(text.firstChild);
                            }
                            $(buttonElements.inner).remove();
                        }
                        iElement.removeData("buttonElements");
                    });
                }
            }
        };
    });
})(window.angular);
(function (angular) {
    // Patch for ng-switch to fire an event whenever the children change.

    var ng = angular.module("ng");
    ng.directive("ngSwitch",
        function () {
            return {
                restrict:'EA',
                compile:function (element, attr) {
                    var watchExpr = attr.ngSwitch || attr.on;
                    return function (scope, element) {
                        scope.$watch(watchExpr, function (value) {
                            element.trigger("$childrenChanged");
                        });
                    }
                }
            }
        });
})(window.angular);
(function (angular) {
    // Patch for ng-include to fire an event whenever the children change.

    var ng = angular.module("ng");
    ng.directive("ngInclude",
        function () {
            return {
                restrict:'ECA',
                compile:function (element, attr) {
                    var srcExp = attr.ngInclude || attr.src;
                    return function (scope, element) {
                        scope.$watch(srcExp, function (src) {
                            element.trigger("$childrenChanged");
                        });
                        scope.$on("$includeContentLoaded", function() {
                            element.trigger("$childrenChanged");
                        });
                    }
                }
            }
        });
})(window.angular);
(function ($, angular) {
    var mod = angular.module('ng');
    mod.directive("input", function () {
        return {
            restrict:'E',
            require:'?ngModel',
            compile:function (tElement, tAttrs) {
                var type = tElement.attr('type');
                return {
                    pre:function (scope, iElement, iAttrs, ctrl) {
                        if (!ctrl) {
                            return;
                        }
                        var listenToEvents = [];
                        if (type === 'date') {
                            // Angular binds to the input or keydown+change event.
                            // However, date inputs on IOS5 do not fire any of those (only the blur event).
                            // See ios5 bug TODO
                            listenToEvents.push("blur");
                        }
                        // always bind to the change event, if angular would only listen to the "input" event.
                        // Needed as jqm often fires change events when the input widgets change...
                        listenToEvents.push("change");

                        var _bind = iElement.bind;
                        iElement.bind = function (events, callback) {
                            if (events.indexOf('input') != -1 || events.indexOf('change') != -1) {
                                for (var i=0; i<listenToEvents.length; i++) {
                                    var event = listenToEvents[i];
                                    if (events.indexOf(event)===-1) {
                                        events+=" "+event;
                                    }
                                }
                            }
                            return _bind.call(this, events, callback);
                        };
                    }
                }
            }
        };

    });
})(window.jQuery, window.angular);


(function (angular) {
    /*
     * Defines the ng:if tag. This is useful if jquery mobile does not allow
     * an ng-switch element in the dom, e.g. between ul and li.
     */
    var ngIfDirective = {
        transclude:'element',
        priority:1000,
        terminal:true,
        compile:function (element, attr, linker) {
            return function (scope, iterStartElement, attr) {
                iterStartElement[0].doNotMove = true;
                var expression = attr.ngmIf;
                var lastElement;
                var lastScope;
                scope.$watch(expression, function (newValue) {
                    if (newValue) {
                        lastScope = scope.$new();
                        linker(lastScope, function (clone) {
                            lastElement = clone;
                            iterStartElement.after(clone);
                        });
                    } else {
                        if (lastElement) {
                            lastElement.remove();
                            lastElement = null;
                        }
                        lastScope && lastScope.$destroy();
                    }
                    // Note: need to be parent() as jquery cannot trigger events on comments
                    // (angular creates a comment node when using transclusion, as ng-repeat does).
                    iterStartElement.parent().trigger("$childrenChanged");
                });
            };
        }
    };
    var ng = angular.module('ng');
    ng.directive('ngmIf', function () {
        return ngIfDirective;
    });
})(window.angular);

(function (angular) {
    var mod = angular.module('ng');

    /**
     * A widget to bind general events like touches, ....
     */
    mod.directive("ngmEvent", function () {
        return {
            compile:function (element, attrs) {
                var eventHandlers = angular.fromJson(attrs.ngmEvent);
                return function (scope, element, attrs) {
                    for (var eventType in eventHandlers) {
                        registerEventHandler(scope, element, eventType, eventHandlers[eventType]);
                    }
                }
            }
        }
    });

    function registerEventHandler(scope, element, eventType, handler) {
        element.bind(eventType, function (event) {
            var res = scope.$apply(handler, element);
            if (eventType.charAt(0) == 'v') {
                // This is required to prevent a second
                // click event, see
                // https://github.com/jquery/jquery-mobile/issues/1787
                event.preventDefault();
            }
        });
    }

    function createEventDirective(directive, eventType) {
        mod.directive(directive, function () {
            return function (scope, element,attrs) {
                var eventHandler = attrs[directive];
                registerEventHandler(scope, element, eventType, eventHandler);
            };
        });
    }

    var eventDirectives = {ngmTaphold:'taphold', ngmSwipe:'swipe', ngmSwiperight:'swiperight',
        ngmSwipeleft:'swipeleft',
        ngmPagebeforeshow:'pagebeforeshow',
        ngmPagebeforehide:'pagebeforehide',
        ngmPageshow:'pageshow',
        ngmPagehide:'pagehide',
        ngmClick:'vclick'
    };
    for (var directive in eventDirectives) {
        createEventDirective(directive, eventDirectives[directive])
    }

})(window.angular);
(function($, angular) {
    function splitAtFirstColon(value) {
        var pos = value.indexOf(':');
        if (pos===-1) {
            return [value];
        }
        return [
            value.substring(0, pos),
            value.substring(pos+1)
        ];
    }

    function instrumentUrlHistoryToSavePageId() {
        var lastToPage;
        $(document).on("pagebeforechange", function(event, data) {
            if (typeof data.toPage === "object") {
                lastToPage = data.toPage;
            }
        });
        var urlHistory = $.mobile.urlHistory;
        var _addNew = urlHistory.addNew;
        urlHistory.addNew = function() {
            var res = _addNew.apply(this, arguments);
            var lastEntry = urlHistory.stack[urlHistory.stack.length-1];
            lastEntry.pageId = lastToPage.attr("id");
            return res;
        }
    }
    instrumentUrlHistoryToSavePageId();

    function getNavigateIndexInHistory(pageId) {
        var urlHistory = $.mobile.urlHistory;
        var activeIndex = urlHistory.activeIndex;
        var stack = $.mobile.urlHistory.stack;
        for (var i = stack.length - 1; i >= 0; i--) {
            if (i!==activeIndex && stack[i].pageId === pageId) {
                return i - activeIndex;
            }
        }
        return undefined;
    }

    function callActivateFnOnPageChange(fnName, params) {
        if (fnName) {
            $(document).one("pagebeforechange", function(event, data) {
                var toPageUrl = $.mobile.path.parseUrl( data.toPage );
                var page = $("#"+toPageUrl.hash.substring(1));
                function executeCall() {
                    var scope = page.scope();
                    scope[fnName].apply(scope, params);
                }
                if (!page.data("page")) {
                    page.one("pagecreate", executeCall);
                    return;
                }
                executeCall();
            });
        }
    }

    /*
     * Service for page navigation.
     * @param target has the syntax: [<transition>:]pageId
     * @param activateFunctionName Function to call in the target scope.
     * @param further params Parameters for the function that should be called in the target scope.
     */
    function navigate(target, activateFunctionName) {
        var activateParams = Array.prototype.slice.call(arguments, 2);
        callActivateFnOnPageChange(activateFunctionName, activateParams);
        var navigateOptions;
        if (typeof target === 'object') {
            navigateOptions = target;
            target = navigateOptions.target;
        }
        var parts = splitAtFirstColon(target);
        var isBack = false;
        if (parts.length === 2 && parts[0] === 'back') {
            isBack = true;
            target = parts[1];
        } else if (parts.length === 2) {
            navigateOptions = { transition: parts[0] };
            target = parts[1];
        }
        if (target === 'back') {
            window.history.go(-1);
            return;
        }
        if (isBack) {
            // The page may be removed from the DOM by the cache handling
            // of jquery mobile.
            $.mobile.loadPage(target, {showLoadMsg: true}).then(function(_,_,page) {
                var relativeIndex = getNavigateIndexInHistory(page.attr("id"));
                if (relativeIndex!==undefined) {
                    window.history.go(relativeIndex);
                } else {
                    jqmChangePage(target, {reverse: true});
                }
            });
        } else {
            jqmChangePage(target, navigateOptions);
        }
    }

    function jqmChangePage(target, navigateOptions) {
        if (navigateOptions) {
            $.mobile.changePage(target, navigateOptions);
        } else {
            $.mobile.changePage(target);
        }
    }


    var mod = angular.module('ng');
    mod.factory('$navigate', function() {
        return navigate;
    });



    return navigate;

})(window.jQuery, window.angular);
(function(angular) {
    var storageName = '$$sharedControllers';

    function storage(rootScope) {
        return rootScope[storageName] = rootScope[storageName] || {};
    }

    function sharedCtrl(rootScope, controllerName, $controller, usedInPage) {
        var store = storage(rootScope);
        var scopeInstance = store[controllerName];
        if (!scopeInstance) {
            scopeInstance = rootScope.$new();
            $controller(controllerName, {$scope: scopeInstance});
            store[controllerName] = scopeInstance;
            scopeInstance.$$referenceCount = 0;
        }
        scopeInstance.$$referenceCount++;
        usedInPage.bind("$destroy", function() {
            scopeInstance.$$referenceCount--;
            if (scopeInstance.$$referenceCount===0) {
                scopeInstance.$destroy();
                delete store[controllerName];
            }
        });
        return scopeInstance;
    }

    function parseSharedControllersExpression(expression) {
        var pattern = /([^\s,:]+)\s*:\s*([^\s,:]+)/g;
        var match;
        var hasData = false;
        var controllers = {};
        while (match = pattern.exec(expression)) {
            hasData = true;
            controllers[match[1]] = match[2];
        }
        if (!hasData) {
            throw "Expression " + expression + " needs to have the syntax <name>:<controller>,...";
        }
        return controllers;
    }

    var mod = angular.module('ng');
    mod.directive('ngmSharedController', ['$controller', function($controller) {
        return {
            scope: true,
            compile: function(element, attrs) {
                var expression = attrs.ngmSharedController;
                var controllers = parseSharedControllersExpression(expression);
                var preLink = function(scope) {
                    for (var name in controllers) {
                        scope[name] = sharedCtrl(scope.$root, controllers[name], $controller, element);
                    }
                };
                return {
                    pre: preLink
                }
            }
        };
    }]);
})(window.angular);
(function($, angular) {
    var showCalls = [];

    function onClick(event) {
        var lastCall = showCalls[showCalls.length - 1];
        if (lastCall.callback) {
            rootScope.$apply(function() {
                lastCall.callback.apply(this, arguments);
            });
        }
        // This is required to prevent a second
        // click event, see
        // https://github.com/jquery/jquery-mobile/issues/1787
        event.preventDefault();
    }

    var loadDialog;

    function initIfNeeded() {
        if (!loadDialog || loadDialog.length == 0) {
            loadDialog = $(".ui-loader");
            loadDialog.bind('vclick', onClick);
        }
    }

    if (!$.mobile.loadingMessageWithCancel) {
        $.mobile.loadingMessageWithCancel = 'Loading. Click to cancel.';
    }

    function updateUi() {
        initIfNeeded();
        if (showCalls.length > 0) {
            var lastCall = showCalls[showCalls.length - 1];
            var msg = lastCall.msg;
            var oldMessage = $.mobile.loadingMessage;
            var oldTextVisible = $.mobile.loadingMessageTextVisible;
            if (msg) {
                $.mobile.loadingMessage = msg;
                $.mobile.loadingMessageTextVisible = true;
            }
            $.mobile.showPageLoadingMsg();
            $.mobile.loadingMessageTextVisible = oldTextVisible;
            $.mobile.loadingMessage = oldMessage;
        } else {
            $.mobile.hidePageLoadingMsg();
        }
    }

    /**
     * jquery mobile hides the wait dialog when pages are transitioned.
     * This immediately closes wait dialogs that are opened in the pagebeforeshow event.
     */
    $('div').live('pageshow', function(event, ui) {
        updateUi();
    });

    /**
     *
     * @param msg (optional)
     * @param tapCallback (optional)
     */
    function show() {
        var msg, tapCallback;
        if (typeof arguments[0] == 'string') {
            msg = arguments[0];
        }
        if (typeof arguments[0] == 'function') {
            tapCallback = arguments[0];
        }
        if (typeof arguments[1] == 'function') {
            tapCallback = arguments[1];
        }

        showCalls.push({msg: msg, callback: tapCallback});
        updateUi();
    }

    function hide() {
        showCalls.pop();
        updateUi();
    }

    function always(promise, callback) {
        promise.then(callback, callback);
    }

    /**
     *
     * @param promise
     * @param msg (optional)
     */
    function waitFor(promise, msg) {
        show(msg);
        always(promise, function() {
            hide();
        });
    }

    /**
     *
     * @param deferred
     * @param cancelData
     * @param msg (optional)
     */
    function waitForWithCancel(deferred, cancelData, msg) {
        if (!msg) {
            msg = $.mobile.loadingMessageWithCancel;
        }
        show(msg, function() {
            deferred.reject(cancelData);
        });
        always(deferred.promise, function() {
            hide();
        });
    }

    var res = {
        show: show,
        hide: hide,
        waitFor: waitFor,
        waitForWithCancel:waitForWithCancel
    };

    var mod = angular.module('ng');
    var rootScope;
    mod.factory('$waitDialog', ['$rootScope', function($rootScope) {
        rootScope = $rootScope;
        return res;
    }]);

    return res;
})(window.jQuery, window.angular);
(function ($, angular) {

    function pagedListFilterFactory(defaultListPageSize, filterFilter, orderByFilter) {

        function createPagedList(list) {
            var enhanceFunctions = {
                refreshIfNeeded:refreshIfNeeded,
                setFilter:setFilter,
                setOrderBy:setOrderBy,
                setPageSize:setPageSize,
                loadNextPage:loadNextPage,
                hasMorePages:hasMorePages,
                reset:reset,
                refreshCount:0
            };

            var pagedList = [];
            var pageSize, originalList, originalListClone, refreshNeeded, filter, orderBy, loadedCount, availableCount;

            for (var fnName in enhanceFunctions) {
                pagedList[fnName] = enhanceFunctions[fnName];
            }
            init(list);
            var oldHasOwnProperty = pagedList.hasOwnProperty;
            pagedList.hasOwnProperty = function (propName) {
                if (propName in enhanceFunctions) {
                    return false;
                }
                return oldHasOwnProperty.apply(this, arguments);
            };
            return pagedList;

            function init(list) {
                setPageSize(-1);
                originalList = list;
                originalListClone = [];
                refreshNeeded = true;
                reset();
            }

            function refresh() {
                var list = originalList;
                originalListClone = [].concat(list);
                if (filter) {
                    list = filterFilter(list, filter);
                }
                if (orderBy) {
                    list = orderByFilter(list, orderBy);
                }
                if (loadedCount < pageSize) {
                    loadedCount = pageSize;
                }
                if (loadedCount > list.length) {
                    loadedCount = list.length;
                }
                availableCount = list.length;
                var newData = list.slice(0, loadedCount);
                var spliceArgs = [0, pagedList.length].concat(newData);
                pagedList.splice.apply(pagedList, spliceArgs);
                pagedList.refreshCount++;
            }

            function refreshIfNeeded() {
                if (originalList.length != originalListClone.length) {
                    refreshNeeded = true;
                } else {
                    for (var i = 0; i < originalList.length; i++) {
                        if (originalList[i] !== originalListClone[i]) {
                            refreshNeeded = true;
                            break;
                        }
                    }
                }
                if (refreshNeeded) {
                    refresh();
                    refreshNeeded = false;
                }
                return pagedList;
            }

            function setPageSize(newPageSize) {
                if (!newPageSize || newPageSize < 0) {
                    newPageSize = defaultListPageSize;
                }
                if (newPageSize !== pageSize) {
                    pageSize = newPageSize;
                    refreshNeeded = true;
                }
            }

            function setFilter(newFilter) {
                if (!angular.equals(filter, newFilter)) {
                    filter = newFilter;
                    refreshNeeded = true;
                }
            }

            function setOrderBy(newOrderBy) {
                if (!angular.equals(orderBy, newOrderBy)) {
                    orderBy = newOrderBy;
                    refreshNeeded = true;
                }
            }

            function loadNextPage() {
                loadedCount = loadedCount + pageSize;
                refreshNeeded = true;
            }

            function hasMorePages() {
                refreshIfNeeded();
                return loadedCount < availableCount;
            }

            function reset() {
                loadedCount = 0;
                refreshNeeded = true;
            }
        }

        return function (list, param) {
            if (!list) {
                return list;
            }
            var pagedList = list.pagedList;
            if (typeof param === 'string') {
                if (!pagedList) {
                    return;
                }
                // commands do not create a new paged list nor do they change the attributes of the list.
                if (param === 'loadMore') {
                    pagedList.loadNextPage();
                } else if (param === 'hasMore') {
                    return pagedList.hasMorePages();
                }
                return;
            }
            if (!pagedList) {
                pagedList = createPagedList(list);
                list.pagedList = pagedList;
            }
            if (param) {
                pagedList.setPageSize(param.pageSize);
                pagedList.setFilter(param.filter);
                pagedList.setOrderBy(param.orderBy);
            }
            pagedList.refreshIfNeeded();
            return pagedList;
        };
    }

    pagedListFilterFactory.$inject = ['defaultListPageSize', 'filterFilter', 'orderByFilter'];
    var mod = angular.module(['ng']);
    mod.constant('defaultListPageSize', 10);
    mod.filter('paged', pagedListFilterFactory);
})(window.jQuery, window.angular);
