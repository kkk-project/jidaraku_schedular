( function( jQuery, window, undefined ) {

    jQuery( function() {

        // ---------- 変数・定数定義 ---------
    
        var mEventId  = jQuery( '#eventId' ).val(),
            mUserId   = jQuery( '#userId' ).val(),
            mUserName = jQuery( '#userName' ).val(),

            // イベント日のタイムスタンプ格納場所
            mEventDate = 0, 

            socket = io.connect( 'http://www12139ui.sakura.ne.jp:3000/detail' ),
                
        // --------- 関数定義 ---------

            getEventId = function() {
                
                return mEventId;
            },

            getUserId = function() {
                
                return mUserId;
            },

            getUserName = function() {
                
                return mUserName;
            },

            getEventDate = function() {

                return mEventDate;
            },

            setEventDate = function( timestamp ) {

                mEventDate = timestamp;
            }

            /** 参加者リストの作成 */
            // {{{ mkParticipateList = function( userList )
            mkParticipateList = function( userList ) {
                
                var length = userList.length;
                
                for ( var i = 0; i < length; i++ ) {
                
                    var li = jQuery( '<li>' ).html( userList[i].User.Name );
                    
                    jQuery( '#userListview' ).append( li );
                }
            },
            // }}}
            
            /** アイテムリストの作成 */
            // {{{ mkTimeList = function( itemInfoList )
            mkTimeList = function( itemInfoList ) {

                // jQuery( '#timeschedule' ).html( '' );
                jQuery( '#detailContent' ).html( '' );

                var length = itemInfoList.length;

                for ( var i = 0; i < length; i++ ) {

                    setItem( itemInfoList[i] );
                }
            },
            // }}}

            // itemInfoからアイテム一覧を作る
            // {{{ setItem = function( itemInfo )
            setItem = function( itemInfo ) {

                var hour = mkHour( itemInfo.StartTime, itemInfo.EndTime ),

                    timeTitle = jQuery( '<h3>' ).html( hour ),

                    itemArea = jQuery( '<div>' ).html( timeTitle );

                itemArea.attr( 'data-role', 'collapsible' );
                itemArea.attr( 'data-theme', 'a' );
                itemArea.attr( 'data-content-theme', 'b' );
                itemArea.attr( 'data-collapsed', 'false' );

                itemArea.append( jQuery( '<h3>' ).html( itemInfo.ItemName ) );
                itemArea.append( jQuery( '<p>' ).html( itemInfo.Comment ) );

                if ( isVoted( itemInfo.VoteUsers ) === false ) {

                    itemArea.append( mkVoteButton( itemInfo.ItemId ) );

                } else {

                    itemArea.append( mkLeaveButton( itemInfo.ItemId ) );
                }

                itemArea.append( mkVoteUserList( itemInfo.VoteUsers ) );

                jQuery( '#detailContent' ).append( itemArea ).trigger( 'create' );
            },
            // }}}

            isVoted = function( voteUsers ) {

                var length  = voteUsers.length;

                for ( var i = 0; i < length; i++ ) {

                    if ( voteUsers[i].User.Id == getUserId() ) {

                        return true;
                    }
                }

                return false;
            },

            // 参加ボタンの作成
            mkVoteButton = function( itemId ) {

                var button = jQuery( '<a>' ).html( '参加する' );

                button.attr( 'data-role', 'button' );
                button.attr( 'data-theme', 'd' );
                button.attr( 'data-icon', 'star' );
                button.attr( 'data-inline', 'true' );

                var sendData = {
                        Method : 'add',
                        EventId: getEventId(),
                        ItemId : itemId,
                        User   : {
                            Id: getUserId(),
                            Name: getUserName()
                        }
                    };

                button.bind( 'tap', function() {

                    //socket.emit( 'reqVote', sendData );
                } );

                return button;
            },

            // 参加をやめるボタンの作成
            mkLeaveButton = function( itemId ) {

                var button = jQuery( '<a>' ).html( '参加をやめる' );

                button.attr( 'data-role', 'button' );
                button.attr( 'data-theme', 'd' );
                button.attr( 'data-icon', 'star' );
                button.attr( 'data-inline', 'true' );

                var sendData = {
                        Method: 'delete',
                        EventId: getEventId(),
                        ItemId: itemId,
                        User   : {
                            Id  : getUserId(),
                            Name: getUserName()
                        }
                    };

                button.bind( 'tap', function() {

                    //socket.emit( 'reqVote', sendData );
                } );

                return button;
            },

            // アイテムの時間の生成
            // {{{ mkHour = function( startTimestamp, endTimestamp )
            mkHour = function( startTimestamp, endTimestamp ) {

                var startDate = new Date( startTimestamp - ( 1000 * 60 * 60 * 9 ) ),
                    endDate = new Date( endTimestamp - ( 1000 * 60 * 60 * 9 ) );

                var startHour = startDate.getHours(),
                    startMin  = startDate.getMinutes(),
                    endHour   = endDate.getHours(),
                    endMin    = endDate.getMinutes();

                if ( startHour < 10 ) { startHour = '0' + startHour; }
                if ( startMin < 10 )  { startMin = '0' + startMin; }
                if ( endHour < 10 )   { endHour = '0' + endHour; }
                if ( endMin < 10 )    { endMin = '0' + endMin; }

                return ( startHour + ':' + startMin + ' 〜 ' + endHour + ':' + endMin );
            },
            // }}}

            // アイテムの参加者一覧者を表示する
            // {{{ mkVoteUserList = function( voteUsers )
            mkVoteUserList = function( voteUsers ) {

                var length = voteUsers.length,

                    voteUserList = jQuery( '<div>' ).html( '<h3>参加者一覧</h5>' );

                voteUserList.attr( 'data-role', 'collapsible' );
                voteUserList.attr( 'data-theme', 'e' );
                voteUserList.attr( 'data-content-theme', 'b' );

                for ( var i = 0; i < length; i++ ) {

                    var user = jQuery( '<p>' ).html( voteUsers[i].User.Name );

                    voteUserList.append( user );
                }

                return voteUserList;
            }
            // }}}
            
            // アイテム追加時にサーバーに渡す情報の生成
            // {{{ mkItemInfo = function( title, comment, start, end )
            mkItemInfo = function( title, comment, start, end ) {

                var startTime = start.split( ':' ),
                    startHour = startTime[0] * 60 * 60 * 1000,
                    startMin  = startTime[1] * 60 * 1000,
                    startTimestamp = getEventDate() + startHour + startMin,

                    endTime = end.split( ':' ),
                    endHour = Number( endTime[0] * 60 * 60 * 1000 ),
                    endMin  = Number( endTime[1] * 60 * 1000 ),
                    endTimestamp = getEventDate() + endHour + endMin,

                    itemInfo = {
                        EventId: getEventId(),
                        User: {
                            Id  : getUserId(),
                            Name: getUserName()
                        },
                        ItemName: title,
                        Comment: comment,
                        StartTime: startTimestamp,
                        EndTime: endTimestamp
                    };

                return itemInfo;
            },
            // }}}

            // 文字列のエスケープ
            // {{{ htmlEscape = function( string ) 
            htmlEscape = function( string ) {

                string = String( string ).replace( /&(?!\w+;)/g, '&amp;' );
                string = String( string ).replace( /</g, '&lt;' );
                string = String( string ).replace( />/g, '&gt;' );
                string = String( string ).replace( /"/g, '&quot;' );

                return string;
            };
            // }}}

        // --------- イベントリスナ(SOCKET) ---------

        socket.on( 'connect', function() {

            console.log( 'connect!!!' );
        
            // 接続したらeventIdを投げる
        
            socket.emit( 'reqEventDetail', getEventId() );
        } );
        
        socket.on( 'resEventDetail', function( eventDetail ) {
        
            // eventの詳細受け取る

            console.log( eventDetail );

            jQuery( '#headTitle' ).html( eventDetail.Event.EventName );
            
            // mkParticipateList( eventDetail.Participates );
            
            mkTimeList( eventDetail.Items );

            setEventDate( Number( eventDetail.Event.StartDate ) );
        } );

        socket.on( 'resNewItems', function( items ) {

            console.log( items );

            mkTimeList( items );

            jQuery( '#timeschedule' ).listview( 'refresh' );
        } );

        // --------- イベントリスナ ---------

        jQuery( '#addItemButton' ).bind( 'tap', function() {

            var title   = htmlEscape( jQuery( '#itemTitle' ).val() ),
                comment = htmlEscape( jQuery( '#itemComment' ).val() ),
                start   = htmlEscape( jQuery( '#itemStart' ).val() ),
                end     = htmlEscape( jQuery( '#itemEnd' ).val() );

            if ( title == '' || comment == '' || start == '' || end == '' ) {

                alert( '入力に不備があります' );

            } else {

                var itemInfo = mkItemInfo( title, comment, start, end );

                socket.emit( 'reqCreateItem', itemInfo );

                jQuery( '#addItem' ).dialog( 'close' );
            }
        } );
    } );

} )( jQuery, window );
