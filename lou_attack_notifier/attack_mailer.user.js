// ==UserScript==
// @name           LoU Attack Notifier
// @description    notifies people about attack on you
// @author         Tomek Rej <atomikrej@gmail.com>
// @namespace      attack_notifier
// @include        http://*.lordofultima.com/*/index.aspx
// @version        0.0.0
// @license        GPL v3
// @run-at         document-end
// ==/UserScript==

(function() {
    var attack_notifier = function() {
        function convert_city(city_id) {
            var x = city_id % 65536;
            var y = Math.ceil((city_id - 65536) / 65536)
            return x + ':' + y.toString();
        }

        function calculate_from_timestamp(timestamp) {
            timestamp += (1364917057 - 6570769);
            var d = new Date(timestamp * 1000);
            return d.toISOString();
        }

        function formulate_mail(city, data) {
            message = ''
            if (data == null)
                return '';
            for (var i = 0; i < data.length; i++) {
                message += 'My city ' + convert_city(city) + ' is under attack';
                message += ' The attacker is ' + data[i].pn + '. The enemy city is ' + data[i].cn + '.';
                message += ' The attack will arrive at ' + calculate_from_timestamp(data[i].es) + '\n'
            }
            return message;
        } 

        function set_cookie(c_name,value,exdays) {
            var exdate=new Date();
            exdate.setDate(exdate.getDate() + exdays);
            var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
            document.cookie=c_name + "=" + c_value;
        }

        function get_cookie(c_name) {
            var i,x,y,ARRcookies=document.cookie.split(";");
            for (i=0;i<ARRcookies.length;i++) {
                x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
                y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
                x=x.replace(/^\s+|\s+$/g,"");
                if (x==c_name) {
                    return unescape(y);
                }
            }
        }

        function main() {
            //Add city ids here. To convert coordinates to an id:
            //y * 65536 + x
            //poll_incoming('28836282');
            //poll_incoming('28901822');
            poll_incoming('22675894'); //438:346
            poll_incoming('23134653'); //445:353
            poll_incoming('22938044'); //444:350
        }

        function poll_incoming(city_id) {
            try {
                console.log('polling incoming')
                /**
                 * Some variables. You can customise who to send the mail to. 
                 */
                var to = new Array('lordscroggin', 'notanoob69', 'jakhar', 'suzuki85', 'spartad', 'vicioussquid');
                var subject = 'Help me!!!'
                var url = 'http://prodgame28.lordofultima.com/233/Presentation/Service.svc/ajaxEndpoint/Poll';

                var updateManager = webfrontend.net.UpdateManager.getInstance();
                var req = new qx.io.remote.Request(url, 'POST', 'application/json');
                var data = {
                    session: updateManager.getInstanceGuid(),
                    requestid: updateManager.requestCounter++,
                    requests: 'FE:\fPLAYER:\fCITY:' + city_id + '\f'
                };
                req.setProhibitCaching('false');
                req.setRequestHeader('Content-Type', 'application/json');
                req.setData(qx.lang.Json.stringify(data))
                req.addListener('completed', function(e) {
                    try {
                        var raw = e.getContent();
                        console.log(raw)
                        for (var i = 0; i < raw.length; i++) {
                            message = formulate_mail(city_id, raw[i].D.iuo);
                            
                            if (message != '') {
                                if (get_cookie('LOU' + city_id) != message) {
                                    set_cookie('LOU' + city_id, message, 1)
                                    send_mail(updateManager, message, to, subject)
                                }
                            }
                        }
                    }
                    catch (e) {} //Sometimes there's a script error. Usually happens the first time the script is run.
                });
                req.send()
            } catch (e) {}
        }

        function send_mail(updateManager, msg, to, sub) {
            for (var i = 0; i < to.length; i++) {
                mailbox = webfrontend.net.CommandManager.getInstance();
                mailbox.sendCommand("IGMSendMsg", {
                    session:updateManager.getInstanceGuid(), target:to[i], subject:sub, body:msg
                });s
            }
        }

        setInterval(main,300000); //Refresh every 5 minutes (number is in millis)

    }

    function inject() {
        var s = document.createElement('script');
        s.innerHTML = "(" + attack_notifier.toString() + ")();";
        s.type = "text/javascript";
        s.id = "attack_notifier";
        document.getElementsByTagName("head")[0].appendChild(s)
    }

    if (/lordofultima\.com/i.test(document.domain)) {
        inject();
    }
    
}());
