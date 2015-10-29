'use strict';

var interceptor = {
    setup: function setup (config) {
        window.__webdriverajax = {
            config: config || {},
            expectations: [],
            requests: []
        };
        var _XHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function () {
            var xhr = new _XHR();
            var originalOpen = xhr.open;
            var lastMethod;
            xhr.open = function () {
                lastMethod = arguments[0];
                originalOpen.apply(xhr, arguments);
            };
            xhr.addEventListener('load', function () {
                window.__webdriverajax.requests.push({
                    requestedMethod: lastMethod.toUpperCase(),
                    requestedURL: this.responseURL,
                    requestedStatus: this.status,
                    response: this.response
                });
            });
            return xhr;
        };
    },
    expectRequest: function expectRequest (expectedMethod, expectedURL, expectedStatus) {
        window.__webdriverajax.expectations.push({
            expectedMethod: expectedMethod.toUpperCase(),
            expectedURL: expectedURL,
            expectedStatus: expectedStatus
        });
    },
    getResponse: function (idx) {
        return window.__webdriverajax.requests[idx] && window.__webdriverajax.requests[idx].response;
    },
    assertAllRequests: function assertAllRequests () {
        window.__webdriverajax.expectations.forEach(function (ex, idx) {
            var request = window.__webdriverajax.requests[idx];
            if (window.__webdriverajax.expectations.length !== window.__webdriverajax.requests.length) {
                throw new Error(
                    'Expected ' +
                    window.__webdriverajax.expectations.length +
                    ' requests but was ' +
                    window.__webdriverajax.requests.length
                );
            }
            if (request.requestedMethod !== ex.expectedMethod) {
                throw new Error(
                    'Expected request to URL ' +
                    request.requestedURL +
                    ' to have method ' +
                    ex.expectedMethod +
                    ' but was ' + request.requestedMethod
                );
            }
            if (ex.expectedURL.regex) {
                var regex = new RegExp(ex.expectedURL.regex);
                if (request.requestedURL && !request.requestedURL.match(regex)) {
                    throw new Error(
                        'Expected request ' +
                        idx +
                        ' to match '
                        + ex.expectedURL.regex +
                        ' but was ' +
                        request.requestedURL
                    );
                }
            } else if (request.requestedURL !== ex.expectedURL) {
                throw new Error(
                    'Expected request ' +
                    idx +
                    ' to have URL '
                    + ex.expectedURL +
                    ' but was ' +
                    request.requestedURL
                );
            }
            if (request.requestedStatus !== ex.expectedStatus) {
                throw new Error(
                    'Expected request to URL ' +
                    request.requestedURL +
                    ' to have status ' +
                    ex.expectedStatus +
                    ' but was ' +
                    request.requestedStatus
                );
            }
        });
    }
};

module.exports = interceptor;