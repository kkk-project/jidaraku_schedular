var model = require('../model'),
    User  = model.User,
    Event = model.Event;

// findOrCreateUser {{{
/**
 * OAuthのIDを元にユーザーのIDなどの情報を返す。
 * ない場合は作成する
 * @param account 例:{ FacebookId : '51691c0a2d9455795f000001', Name: 'Takashi  Miwa' }
 */
exports.findOrCreateUser = function (account, callback) {
    if (typeof account.FacebookId !== 'undefined') {
        var accountId = { FacebookId : account.FacebookId };
    }
    else if (typeof account.TwitterId !== 'undefined') {
        var accountId = { TwitterId : account.TwitterId };
    } else {
        callback(false);
    }

    User.findOne(accountId, function(err, user){
        if (err) {
            console.log(err);
        } else {
            if ( user !== null ) {
                callback(user);
            } else {
                // ユーザ情報がないときは新規作成
                var newUser = new User(account);
                newUser.save(function(err, user){
                    if (err) {
                        console.log(err);
                    } else {
                        callback(user);
                    }
                });
            }
        }
    });
};
// }}}

// getEventList {{{
/**
 * @function getEventList ユーザーが参加しているイベント一覧を返す
 * @param userId ユーザーID
 * @param conditon 絞り込みやソート（未実装）
 * @param callback コールバック関数
 */
exports.getEventList = function (userId, condition, callback) {
    Event.find({ "Participates.UserId" : userId}, { _id : 1, Event : 1}, function(err, eventListDB){
            if (err) {
                console.log(err);
                callback(false);
            } else {
                var eventList = [];
                eventListDB.forEach(function (val, idx, arr){
                    // _idをstring型に変更する
                    eventList[idx] = {
                        EventId: ''+val._id,
                        EventName: val.Event.EventName,
                        StartDate: val.Event.StartDate
                    };
                });
                callback(eventList);
            }
        }
    );
};
// }}}

// createEvent {{{
/**
 * @function createEvent イベントの概要を作る
 * @param user ユーザー情報(例){ id: '51691c0a2d9455795f000001', Name: 'Takashi  Miwa' }
 * @param callback コールバック関数
 */
exports.createEvent = function (data , callback) {
    console.log(data);
    var eventInfo = {
        Event : {
            EventName : data.eventName,
            StartDate : data.startDate
        },
        Items : [],
        Participates : [
            {
                User : data.User
            }
        ]
    };
    var newEvent = new Event(eventInfo);

    newEvent.save(function (err, val) {
        if (err) {
            console.log(err);
        } else {
            var eventInfo = [{
                EventId : ''+val._id,
                EventName: val.Event.EventName,
                StartDate: val.Event.StartDate
            }];
            callback(eventInfo);
        }

    });
};
// }}}

// deleteEvent {{{
exports.deleteEvent = function (eventId, callback) {
    var Event = model.Event;
    Event.remove({ _id : eventId }, function(err, eventDetail){
        if (err) {
            console.log(err);
            callback({id:eventId, isSuccess: false});
        } else {
            callback({id:eventId, isSuccess: true});
        }
    });
};
// }}}

// getEventDetail {{{
exports.getEventDetail = function (eventId, callback) {
    var Event = model.Event;
    Event.find({ _id : eventId }, function(err, eventDetail){
        if (err) {
            console.log(err);
            callback(false);
        } else {
            callback(eventDetail);
        }
    });
};
// }}}

// createItem {{{
exports.createItem = function (data, callback) {
    var EventId = data.EventId;
    var item = {
        ItemId    : data.ItemId,
        ItemName  : data.ItemName,
        StartTime : data.StartTime,
        EndTime   : data.EndTime,
        Comment   : data.Comment,
        VoteCount : 1,
        VoteUsers : [
            {
                User: data.User
            }
        ]
    };
    var Event = model.Event;
    // イベントにアイテムを追加
    Event.update({ _id : EventId }, { $push: { Items : item }}, function(err){
        if (err) {
            console.log(err);
            callback(false);
        } else {
            // イベントのアイテム一覧を返す
            Event.find({ _id : EventId }, { Items: 1}, function(err, eventItemList){
                if (err) {
                    console.log(err);
                    callback(false);
                } else {
                    callback(eventItemList);
                }
            });
        }
    });
};
// }}}

// deleteItem {{{
//exports.deleteItem = function ( data, callback) {
//    Event.remove({Items.ItemId: data.ItemId}, function(
//    )

// addUserEvent {{{
exports.addParticipates = function (data, callback) {
    var EventId = data.EventId;

    var Event = model.Event;
    Event.update({ _id : EventId }, { $push: { Participates : data.User }}, function(err){
        if (err) {
            console.log(err);
            callback({EventId: EventId, isSuccess: false});
        } else {
            callback({EventId: EventId, isSuccess: true});
        }
    });
};
// }}}
    






