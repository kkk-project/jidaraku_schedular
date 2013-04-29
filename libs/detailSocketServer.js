var fs  = require( 'fs' ),
    app = module.parent.exports,
    io  = app.get( 'io' ),

    events = new Array(),

    init = function() {

        var sampleJson = fs.readFileSync( './sampledata/eventDetail.json' );

        events.push( JSON.parse( sampleJson ) );
    },

    getNewItems = function( addItemInfo ) {

        var length = events.length;

        for ( var i = 0; i < length; i++ ) {

            if ( events[i].Event.EventId == addItemInfo.EventId ) {

                addItem( i, addItemInfo );

                var items = {
                        IsSuccess: true,
                        Data     : events[i].Items
                    };

                return items;
            }
        }

        return { IsSuccess: false };
    },

    addItem = function( idx, itemInfo ) {

        var newItemObj = {
                ItemId   : events[idx].Items.length + 1,
                ItemName : itemInfo.ItemName,
                StartTime: itemInfo.StartTime,
                EndTime  : itemInfo.EndTime,
                Comment  : itemInfo.Comment,
                VoteCount: 1,
                VoteUsers: [
                    {
                        User: {
                            Id  : itemInfo.User.Id,
                            Name: itemInfo.User.Name
                        }
                    }
                ]
            };

        events[idx].Items.push( newItemObj );
    },

    getItemsByVote = function( voteInfo ) {

        var eventsLen = events.length;

        for ( var i = 0; i < eventsLen; i++ ) {

            if ( events[i].Event.EventId == voteInfo.EventId ) {

                var isSuccess = false;

                if ( voteInfo.Method == 'add' ) {

                    isSuccess = setUserToItem( i, voteInfo.ItemId, voteInfo.UserId );

                } else {

                    isSuccess = delUserToItem( i, voteInfo.ItemId, voteInfo.UserId );
                }

                if ( isSuccess == true ) {

                    var items = {
                            IsSuccess: true,
                            Data     : events[i].Items
                        };

                    return items;

                } else {

                    break;
                }
            }
        }

        return { IsSuccess: false };
    },

    setUserToItem = function( idx, itemId, userId ) {

        var itemsLen = events[idx].Items.length;

        for ( var i = 0; i < itemsLen; i++ ) {

            if ( events[idx].Items[i].ItemId == itemId ) {

                events[idx].Items[i].VoteCount++;
                events[idx].Items[i].VoteUsers.push( userId );

                return true;
            }
        }

        return false;
    },

    delUserToItem = function( idx, itemId, userId ) {

        var itemsLen  = events[idx].Items.length,
            isSuccess = false;

        for ( var i = 0; i < itemsLen; i++ ) {

            if ( events[idx].Items[i].ItemId == itemId ) {

                var userLen  = events[idx].Items[i].VoteUsers.length,
                    newUsers = new Array();

                for ( var j = 0; j < userLen; j++ ) {

                    if ( events[idx].Items[i].VoteUsers[j] == userId ) {

                        events[idx].Items[i].VoteCount--;

                        isSuccess = true;

                    } else {

                        newUsers.push( events[idx].Items[i].VoteUsers[j] );
                    }
                }

                if ( isSuccess === true ) {

                    events[idx].Items[i].VoteUsers = newUsers;
                }

                break;
            }
        }

        return isSuccess;
    },

    getEventDetail = function( eventId ) {

        var length = events.length;

        for ( var i = 0; i < length; i++ ) {

            if ( events[i].Event.EventId == eventId ) {

                var detail = events[i];

                detail[ 'IsSuccess' ] = true;

                return detail;
            }
        }

        // イベントIDが存在しなかったのでエラー

        return { IsSuccess: false };
    };

init();

io.of( '/detail' ).on( 'connection', function ( socket ) {

    console.log( 'connect detail!!!' );

    socket.on( 'reqEventDetail', function( eventId ) {

        // eventIdをブラウザから送られてきたとき

        // monngoに格納されているイベント情報を取得する

        // プロトではメモリ上から取得
        socket.emit( 'resEventDetail', getEventDetail( eventId ) );
    } );

    socket.on( 'reqCreateItem', function( itemInfo ) {

        var newItems = getNewItems( itemInfo );

        socket.emit( 'resNewItems', newItems );
        socket.broadcast.emit( 'resNewItems', newItems );
    } );

    socket.on( 'reqVote', function( voteInfo ) {

        var newItems = getItemsByVote( voteInfo );

        socket.emit( 'resNewItems', newItems );
        socket.broadcast.emit( 'resNewItems', newItems );
    } );
} );
