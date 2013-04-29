(function(){
    var socket = io.connect('http://www12139ui.sakura.ne.jp');
    var userId = $('#userId').val();
    var userName = $('#userName').val();

    //////////////////////////////////////
    // emit
    //////////////////////////////////////

    // init eventList取得
    $(document).ready(function(){
        var obj = {
                userId: userId,
                userName: userName
            }
        socket.emit('reqEventList', obj);
    });

    // イベント作成送信
    var sendEventData = function(eventName, startDate, userId){
        var obj = {
                eventName: eventName,
                startDate: startDate,
                userId: userId,
                userName: userName
            }
        socket.emit('reqCreateEvent', obj);
    };

    // イベント削除
    var reqDeleteEvent = function(eventId){
        var obj = {
                userId: userId,
                userName: userName,
                eventId: eventId
            }
        socket.emit('reqDeleteEvent', obj);
    }


    //////////////////////////////////////
    // socket.on
    //////////////////////////////////////

    // EventListを取得して描画関数に渡す
    socket.on('resEventList', function(eventList){
        showEventList(eventList.events);
    });

    // イベント受信時 
    socket.on('resCreateEvent', function(eventList){
        showEventList(eventList.events);
    });


    // イベント受信時 
    socket.on('resDeleteEvent', function(eventId, bool){
        if ( bool ) {
            alert('失敗しちゃった');
        } else {
            $('#' + eventId).remove();
        }
    });


    //////////////////////////////////////
    // てきとうな関数群
    //////////////////////////////////////

    // eventListの描画
    var showEventList = function(eventList){
        for (var i = 0; i < eventList.length; i++) {
            addEventList(eventList[i].EventName
                       , eventList[i].StartDate
                       , eventList[i].EventId);
        }
    };

    // htmlエスケープ
    var htmlEscape = function(html){
        return String(html).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };

    // イベントリストのフォーマット
    var addEventList = function(eventName, date, id) {
        console.log(eventName);
        var ahref = '<li id="' + id + '"><div class="ui-grid-a">'
                        + '<div class="ui-block-a" style="width: 90%;">'
                        +   '<a href="detail/?id=' + id + '">' + htmlEscape(eventName) + '</a><br />'
                        +   '<small>' + date + '</small>'
                        + '</div>'
                        + '<div class="ui-block-b" style="width: 10%; text-align: right;">'
                        +   '<a class="delete" data-role="button" data-inline="true"'
                        +   ' data-icon="delete" data-iconpos="notext" ></a>'
                        + '</div>'
                    + '</div></li>';
        $('#eventList').prepend(ahref).trigger('create');
        $('#eventList').listview('refresh');
    }

    // イベント削除ボタン
    $('a.delete').live("click", function(){
        if ( confirm('削除しますか？') ) {
            reqDeleteEvent($(this).parents('li').attr('id'));
//todo
            $('#' + $(this).parents('li').attr('id')).remove();
        }
    });


    //////////////////////////////////////
    // knockoutjsのバインド用関数
    //////////////////////////////////////
    function AppViewModel() {
        this.eventName = ko.observable("");
        this.date = ko.observable("");

        this.inputCheck = ko.computed(function() {
            return (this.eventName() != "" && this.date() != "");
        }, this);

        // イベント作成処理
        this.createEvent = function() {
            var escapedName = htmlEscape(this.eventName());
            var date = htmlEscape(this.date());

            sendEventData(escapedName, date, userId);
//todo
            addEventList(escapedName, date);
        };
    }
    // Activates knockout.js
    ko.applyBindings(new AppViewModel());

})();
