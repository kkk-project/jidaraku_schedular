var fs  = require( 'fs' ),
    app = module.parent.exports,
    io  = app.get( 'io' ),

    database = require( './database' ),

    eventList = {},

    setEvent = function( eventId, eventDetail ) {

        if ( eventList[eventId] === undefined ) {

            eventList[eventId] = {};
        }

        eventList[eventId] = eventDetail;
    },

    setNewItems = function( eventId, newItems ) {

        if ( eventList[eventId] === undefined ) {

            return false;
        }

        eventList[eventId].Items = newItems;
    },

    getItemsByVote = function( voteInfo ) {

        if ( eventList[voteInfo.EventId] === undefined ) {

            return { IsSuccess: false };
        }

        if ( voteInfo.Method == 'add' ) {

            isSuccess = setUserToItem( voteInfo.EventId, voteInfo.ItemId, voteInfo.User );

        } else {

            isSuccess = delUserToItem( voteInfo.EventId, voteInfo.ItemId, voteInfo.User );
        }

        if ( isSuccess == true ) {

            var items = {
                    IsSuccess: true,
                    Data     : eventList[voteInfo.EventId].Items
                };

            return items;

        } else {

            return { IsSuccess: false };
        }
    },

    setUserToItem = function( eventId, itemId, user ) {

        var itemsLen = eventList[eventId].Items.length;

        for ( var i = 0; i < itemsLen; i++ ) {

            if ( eventList[eventId].Items[i].ItemId == itemId ) {

                eventList[eventId].Items[i].VoteCount++;
                eventList[eventId].Items[i].VoteUsers.push( { User: user } );

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

io.of( '/detail' ).on( 'connection', function ( socket ) {

    console.log( 'connect detail!!!' );

    socket.on( 'reqEventDetail', function( eventId ) {

        // monngoに格納されているイベント情報を取得する

        database.getEventDetail( eventId, function( eventDetail ) {

            socket.emit( 'resEventDetail', eventDetail[0] );

            setEvent( eventId, eventDetail[0] );
        } );
    } );

    socket.on( 'reqCreateItem', function( newItemInfo ) {

        database.createItem( newItemInfo, function( itemList ) {

            if ( itemList === false ) {

                // エラーを返す

            } else {

                socket.emit( 'resNewItems', itemList[0].Items );
                socket.broadcast.emit( 'resNewItems', itemList[0].Items );

                setNewItems( newItemInfo.EventId, itemList[0].Items );
            }
        } );
    } );

    socket.on( 'reqVote', function( voteInfo ) {

        var newItems = getItemsByVote( voteInfo );

        socket.emit( 'resNewItems', newItems.Data );
        socket.broadcast.emit( 'resNewItems', newItems.Data );
    } );
} );
