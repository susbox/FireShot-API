/* FireShotAPI v 1.0.2
 **
 ** simple API for FireShot automation (capturing web pages using JavaScript).**
 ** Code licensed under Mozilla Public License                                **
 **     https://addons.mozilla.org/en-US/firefox/versions/license/69512       **
 **                                                                           **
 ** Author: Evgeny Suslikov, https://getfireshot.com                          **
 **                                                                           */

var cFSEdit = 0,
    cFSSave = 1,
    cFSClipboard = 2,
    cFSEMail = 3,
    cFSExternal = 4,
    cFSUpload = 5,
    cFSPrint = 7,
    cBASE64Encode = 8,
    cFSUpgrade = 100;

var FireShotAPI = (function () {
    var callbackId = 0,
        handlers = [];


    // Open troubleshooting page
    function openTroubleshootingPage() {
        window.open("https://getfireshot.com/api-required.php", '_blank');
    }

    // Displays error message
    function errorOnlyChromiumFirefox() {
        alert("Sorry, this plugin works only in Firefox or any Chromium browser.");
    }

    // Checks whether the current browser is Firefox
    function isFirefox() {
        return navigator.userAgent.indexOf("Firefox") != -1;
    }

    // Checks whether the current browser is Chrome or Chromium-based
    function isChromium() {
        return /chrome/.test(navigator.userAgent.toLowerCase());
    }

    function init() {
        document.addEventListener('FireShotCaptureCompleteEvent', function (evt) {
            var cbId = evt.detail.cbId;

            if (cbId in handlers)
                handlers[cbId](evt.detail.data);
        }, false);
    }

    init();

    return {
        // Set this variable to false to switch off the addon auto-installation
        AutoInstall: true,

        // Check silently whether the addon is available at the client's PC, returns *true* if everything is OK. Otherwise returns *false*.
        isAvailable: function () {
            if ((!isFirefox() && !isChromium())) return false;

            var element = document.createElement("FireShotDataElement");
            element.setAttribute("FSAvailable", false);
            element.setAttribute("FSUpgraded", false);

            document.documentElement.appendChild(element);

            var evt = document.createEvent("Events");
            evt.initEvent("checkFSAvailabilityEvt", true, false);

            element.dispatchEvent(evt);

            return element.getAttribute("FSAvailable") == "true";
        },

        // Check whether the addon is available and display the message if required
        checkAvailability: function () {
            // The plugin works only in Chrome, Firefox or any Chromium-based browser. We check it here.
            if (!isFirefox() && !isChromium()) {
                errorOnlyChromiumFirefox();
                return false;
            }

            if (!this.isAvailable()) {
                if (confirm("The library could not connect to the FireShot extension.\r\nWould you like to open the troubleshooting page?"))
                    openTroubleshootingPage();
                return false;
            }

            return true;
        },

        // Capture web page and perform desired action
        capturePage: function (EntirePage, Action, CapturedDivElementId, Data, Callback) {
            if (this.AutoInstall) {
                // The plugin works only in Chrome, Firefox or any Chromium-based browser. We check it here.
                if (!isFirefox() && !isChromium()) {
                    errorOnlyChromiumFirefox();
                    return;
                }

                // The browser is OK. Now we check the availability of the extension.
                if (!this.isAvailable()) {
                    openTroubleshootingPage();
                    return;
                }
            }

            var element = document.createElement("FireShotDataElement");

            element.setAttribute("Entire", EntirePage);
            element.setAttribute("Action", Action);
            element.setAttribute("Data", Data || "");


            if (Callback) {
                var cbId = callbackId++;
                element.setAttribute("CBID", cbId.toString());

                handlers[cbId] = function (data) {
                    delete handlers[cbId];
                    Callback(data);
                };
            }

            !CapturedDivElementId || element.setAttribute("CapturedDivElementId", CapturedDivElementId);

            document.documentElement.appendChild(element);

            var evt = document.createEvent("Events");
            evt.initEvent("capturePageEvt", true, false);

            element.dispatchEvent(evt);
        },

        // Capture web page (Entire = true for capturing the web page entirely) and *edit*
        editPage: function (Entire, CapturedDivElementId, Callback) {
            this.capturePage(Entire, cFSEdit, CapturedDivElementId, undefined, Callback);
        },

        // Capture web page and *save to disk*
        savePage: function (Entire, CapturedDivElementId, Filename, Callback) {
            this.capturePage(Entire, cFSSave, CapturedDivElementId, Filename, Callback);
        },

        // Capture web page and *copy to clipboard*
        copyPage: function (Entire, CapturedDivElementId, Callback) {
            this.capturePage(Entire, cFSClipboard, CapturedDivElementId, undefined, Callback);
        },

        // Capture web page and *EMail*
        emailPage: function (Entire, CapturedDivElementId, Callback) {
            this.capturePage(Entire, cFSEMail, CapturedDivElementId, undefined, Callback);
        },

        // Capture web page and *open it in a third-party editor*
        exportPage: function (Entire, CapturedDivElementId, Callback) {
            this.capturePage(Entire, cFSExternal, CapturedDivElementId, undefined, Callback);
        },

        // Capture web page and *upload to free image hosting*
        uploadPage: function (Entire, CapturedDivElementId, Data, Callback) {
            this.capturePage(Entire, cFSUpload, CapturedDivElementId, Data, Callback);
        },

        // Capture web page and *print*
        printPage: function (Entire, CapturedDivElementId, Callback) {
            this.capturePage(Entire, cFSPrint, CapturedDivElementId, undefined, Callback);
        },

        // Capture web page and *return the BASE64Encoded version*
        // The callback takes one parameter as a base64 content:
        // function callback(base64Data) {console.log(base64Data)}
        base64EncodePage: function (Entire, CapturedDivElementId, Callback) {
            this.capturePage(Entire, cBASE64Encode, CapturedDivElementId, undefined, Callback);
        },

        // Forces FireShot to upgrade to the advanced features, such as Edit/Print/Upload, etc
        upgradePlugin: function () {
            this.capturePage(false, cFSUpgrade);
        }
    }
})();