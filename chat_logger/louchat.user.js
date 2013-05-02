// ==UserScript==
// @name           LoU Chat
// @description    Intercepts chat and puts it into a hipchat chatroom
// @author         Tomek Rej <atomikrej@gmail.com>
// @namespace      louchat
// @include        http://*.lordofultima.com/*/index.aspx*
// @version        0.0.0
// @license        GPL v3
// @run-at         document-end
// ==/UserScript==
(function () {
    
    var LoUBBCode, main = function () {
        window.message_buffer = []
        window.users = []

        window.token = '' //Better not publish this live
        window.room_id = '' //Ditto
        window.user = '' //Only if you're logged in as this user will it work.

        function send_request(url) {
            var xmlHttp = null;
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET", url)
            xmlHttp.send(null);
            return xmlHttp.responseText;
        }
          

        function update_chat() {
            var game_user = webfrontend.data.Player.getInstance().$$user_name
            if (game_user != window.user) {
                return
            }
            for (var i = 0; i < window.message_buffer.length; i++) {
                var url_prefix = 'https://api.hipchat.com/v1/rooms/message?auth_token='
                var url = url_prefix + window.token + '&from=' + window.users[i] + '&room_id=' + window.room_id + '&message=' + window.message_buffer[i];
                response = send_request(url);
            }
            window.message_buffer = []
            window.users = []
        }
      
        var createTweak = function () {
            chat = webfrontend.data.Chat.getInstance();
            chat.addListener('newMessage', function (e) {
                var eu = e.getData();
                if (eu.c == '@A' || eu.c == '_a') {
                    window.message_buffer.push('[Alliance]: ' + eu.m)
                    window.users.push(eu.s)
                }
            });
        }
        var startup = function () {
            createTweak();
        }
        window.setTimeout(startup, 20000);
        setInterval(update_chat, 60000)
    }
    


    /* inject this script into the website */
    function inject() {
        var script = document.createElement("script"),
        txt = main.toString();
        if (typeof window.opera !== 'undefined') {
            txt = txt.replace(/</g, "<");
        }
        script.innerHTML = "(" + txt + ")();";
        script.type = "text/javascript";
        document.getElementsByTagName("head")[0].appendChild(script);
    }
    if (/lordofultima\.com/i.test(document.domain)) {
        inject();
    }
}());
