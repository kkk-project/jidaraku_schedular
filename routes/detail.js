/*
 * GET home page.
 */

exports.detail = function( req, res ) {

    // --------- 関数定義 ---------

    var mkDate = function( timestamp ) {

            var date = new Date( timestamp );

            var year  = date.getYear(),
                month = date.getMonth() + 1,
                day   = date.getDate();

            if ( year < 2000 ) { year += 1900; }
            if ( month < 10 ) { month = "0" + month; }
            if ( day < 10 ) { day = "0" + day; }

            return ( year + '/' + month + '/' + day );
        },

        setEventInfo = function( userId, userName, eventId ) {

            // 本来はコールバック内で実行する
        };

    // --------- 処理 ---------
    
    ( function() {

        if ( req.query.id === undefined ) {
            
            // IDが指定されていなかったらトップへ

            res.redirect( '/events' );

        } else {
        
            // setEventInfo( req.user.id, req.user.Name, req.query.id );
            res.render( 'detail', {
                id      : req.query.id,
                userId  : req.user.id,
                userName: req.user.Name
            } );
        }
        
    } )();
};
