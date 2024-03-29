(function () {
    var Message;
    Message = function (arg) {
        this.text = arg.text, this.message_side = arg.message_side;
        this.draw = function (_this) {
            return function () {
                var $message;
                $message = $($('.message_template').clone().html());
                $message.addClass(_this.message_side).find('.text').html(_this.text);
                $('.messages').append($message);
                return setTimeout(function () {
                    return $message.addClass('appeared');
                }, 0);
            };
        }(this);
        return this;
    };
    $(function () {
        var getMessageText, sendMessage,sendRequest,getCookie,setCookie;
        getMessageText = function () {
            var $message_input;
            $message_input = $('.message_input');
            return $message_input.val();
        };
        sendMessage = function (text,message_side) {
            var $messages, message;
            if (text.trim() === '') {
                return;
            }
            $('.message_input').val('');
            $messages = $('.messages');
            message = new Message({
                text: text,
                message_side: message_side
            });
            message.draw();

            $('[data-toggle="popover"]').popover({
                //Установление направления отображения popover
                placement : 'right'
            });
            return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
        };
        setCookie = function (name, value, options) {
          options = options || {};

          var expires = options.expires;

          if (typeof expires == "number" && expires) {
            var d = new Date();
            d.setTime(d.getTime() + expires * 1000);
            expires = options.expires = d;
          }
          if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
          }

          value = encodeURIComponent(value);

          var updatedCookie = name + "=" + value;

          for (var propName in options) {
            updatedCookie += "; " + propName;
            var propValue = options[propName];
            if (propValue !== true) {
              updatedCookie += "=" + propValue;
            }
          }

          document.cookie = updatedCookie;
        }
        
        
        getCookie = function (name) {
          var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
          ));
          return matches ? decodeURIComponent(matches[1]) : undefined;
        };
        sendRequest = function (text) {
		$('html, body').animate({
		    scrollTop: $("#sendBtn").offset().top
		  }, 2000);

            var sessionId = getCookie("s_id");
            var eMail = getCookie("email");

            var lng = getCookie("lang");
            if (!lng)
            {
                lng = 'ru';
            }
            var timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
            $.get("https://polyclinica-core-dev.herokuapp.com/health/check-symptoms", {s_id: sessionId, email: eMail, msg: text, lang: lng, time_zone: timeZoneName}).done(function(data) {

                resp = JSON.parse(data);
                if (eMail) {
                    oneMinute = new Date(new Date().getTime() + 10*60 * 1000);
                    setCookie('email',eMail,{expires: oneMinute});
                }
                if (!sessionId && !eMail){
	                oneMinute = new Date(new Date().getTime() + 5*60 * 1000);
                    setCookie('s_id',resp['s_id'],{expires: oneMinute});
                }
                sendMessage(resp['response_text'],'left');

		if (resp['doctor']){
			oneMinute = new Date(new Date().getTime() + 5*60 * 1000); 
            setCookie('doctor',resp['doctor'],{expires: oneMinute});
            setCookie('userCity',ymaps.geolocation.city,{expires: oneMinute});

		}
                if (resp['message_type'] == 'YESNO'){
			if($('div .bw_yesno').is(":hidden"))
			{
		        	$('div .bw_yesno').slideToggle();
		    		$('div .bw_chat').toggle();
			}

                } 
                else if (resp['message_type'] == 'WRITING') {
                	if($('div .bw_yesno').is(":visible"))
			{
		        	$('div .bw_yesno').slideToggle();
		    		$('div .bw_chat').slideToggle();
			}
                }
                else if (resp['message_type'] == 'FINISH') {
			if($('div .bw_yesno').is(":visible"))
			{
				$('div .bw_yesno').slideToggle();
		        	$('div .bw_booking').slideToggle();
	            		$('div .bw_chat').toggle();
			}
                }

            });
        };

        $('.send_message').click(function (e) {
            var rawText = getMessageText();
            sendMessage(rawText,'right');
            sendRequest(rawText);
        });

        $('.yes_message').click(function (e) {
            var rawText = getMessageText();
            var lang = getCookie("lang");
            if (!lang)
            {
                lng = 'ru';
            }
            if (lang == 'ru')
            {
                sendMessage('Да','right');
    		sendRequest('Да');
            }
            else if (lang == 'en')
            {
                sendMessage('Yes','right');
	    	sendRequest('Yes');
            }
            else
            {
                sendMessage('Да','right');
	    	sendRequest('Да');	
            }
            
        });

        $('.no_message').click(function (e) {
            var rawText = getMessageText();
            var lang = getCookie("lang");
            if (!lang)
            {
                lng = 'ru';
            }
            if (lang == 'ru')
            {
                sendMessage('Нет','right');
    		sendRequest('Нет');
            }
            else if (lang == 'en')
            {
                sendMessage('No','right');
	    	sendRequest('No');
            }
            else
            {
                sendMessage('Нет','right');
	    	sendRequest('Нет');
            }
            
        });

	$('.booking_message').click(function (e) {
		$('div .bw_booking').slideToggle();
		if($('div .bw_chat').is(":hidden"))
		{
			$('div .bw_chat').slideToggle();
		}
		window.location = "https://www.polyclinica-dev.herokuapp.com/book";
        });

        $('.message_input').keyup(function (e) {
            if (e.which === 13) {
                var rawText = getMessageText();
                sendMessage(rawText,'right');
                sendRequest(rawText);
            }
        });
        var name = getCookie("name");
        if (name && name.indexOf("\\") < 1)
        {

            var lang = getCookie("lang");
            if (lang == 'ru')
            {
                sendMessage('Привет, ' + name + '. Что тебя беспокоит?','left');
            }
            else if (lang == 'en')
            {
                sendMessage('Hi, ' + name + '. what is bothering you','left');
            }
            else
            {
                sendMessage('Привет, ' + name,'left');
            }
        }
        else
        {
            var lang = getCookie("lang");
            if (lang == 'ru')
            {
                sendMessage('Привет! Что тебя беспокоит?','left');
            }
            else if (lang == 'en')
            {
                sendMessage('Hi, what is bothering you?','left');
            }
            else
            {
                sendMessage('Привет! Что тебя беспокоит?','left');
            }
        }

    });
}.call(this));
