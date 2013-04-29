var app = module.parent.exports,
    io = app.get( 'io' ),
    database = require('./database');

io.of( '/sample' ).on( 'connection', function ( socket ) {

    console.log( 'connect sample!!!' );

    socket.on( 'reqEventList', function( userId ) {
        database.getEventList(userId, null, function(eventList) {
            socket.emit( 'resEventList', eventList);
        });
    });

    /**
     * data = {
     *      eventName: ***,
     *      startDate : *** ,
     *      user : {
     *          id : ***,
     *          Name : ***
     *      }
     * }
     */
    socket.on( 'reqCreateEvent', function( data ) {
        database.createEvent(data, function(eventInfo) {
            socket.emit( 'resCreateEvent', eventInfo);
        });
    });

    socket.on( 'reqDeleteEvent', function( eventId ) {
        database.deleteEvent(eventId, function(res) {
            socket.emit( 'resDeleteEvent', res);
        });
    });

   /*
        {
            EventId: 5,
            UserId: "hkitamur",
            ItemName: "new item だにぃ",
            Comment: "新しく作ったよー！",
            StartTime :  1234567890, // タイムスタンプ(ミリ秒)
            EndTIme : 1234567890 // タイムスタンプ(ミリ秒)
        }
    */
    socket.on( 'reqCreateItem', function( data ) {
        database.createItem(data, function(itemList) {
            socket.emit( 'resCreateItem', itemList);
        });
    });
});
