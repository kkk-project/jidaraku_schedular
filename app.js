
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , model = require('./model/model')
  , detail = require('./routes/detail').detail
  , events = require('./routes/events').events;

var app = module.exports = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3011);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
//app.get('/form', routes.form);
//app.post('/create', routes.create);
app.get('/users', user.list);
app.get('/detail', detail);
app.get('/events', events);

var server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// socket.io
var io = require('socket.io').listen(server);

app.set( 'io', io );

// 詳細ページのソケットサーバー
require( './libs/detailSocketServer' );

io.sockets.on('connection', function (socket) {
    // 認証データの取得
    socket.on('account', function (account) {
        if (typeof account.FacebookId !== 'undefined') {
            var accountId = { FacebookId : account.FacebookId };
        }

        // user._idの取得
        var User = model.User;
        User.findOne(accountId, function(err, user){
            if (err) {
                console.log(err);
            } else {
                // ユーザ情報がないときは新規作成
                // if ( user === null ) {
                if (true) {
                    var newUser = new User(account);
                    newUser.save(function(err, user){
                        if (err) {
                            console.log(err);
                        } else {
                            // user._idからそのユーザーが属するイベントの取得
                        }
                    });
                } else {
                    // user._idからそのユーザーが属するイベントの取得
                }
            }
        });
    });
    // ユーザーデータの送信

    // アイテムの追加
    socket.on('addItem', function (item) {
        // mongoへ保存。理想はメモリーに持って定期的にDBに保存
        console.log(item);
        var newEvent = new model.Event(item);
        newEvent.save(function(err, event) {
            if (err) {
                console.log(err);
            } else {
                console.log(event);
            }
        });
        // broadcastでアイテムの追加情報の送信
    });


    socket.on('reqEventList', function(){
        var resEventList =
            { "events" : [
                    {
                        "EventId"   : 1,    // ページのurlにも使う、Eventsの中でユニーク
                        "EventName" : "第三回開発作戦会議！！！",
                        "CreateUser": "nireisan",
                        "StartDate" : 1111111,    // 開始日の０時０分０秒０ミリ秒のタイムスタンプ
                        "EndDate"   : 1112222,    // 終了日の０時０分０秒０ミリ秒のタイムスタンプ
                        "Created"   : 1010101,    // 作成日時のタイムスタンプ（ミリ秒まで）
                        "Updated"   : 1010102     // 更新日時のタイムスタンプ（ミリ秒まで）
                    },
                    {
                        "EventId"   : 2,    // ページのurlにも使う、Eventsの中でユニーク
                        "EventName" : "たまりば",
                        "CreateUser": "nireisan",
                        "StartDate" : 1111111,    // 開始日の０時０分０秒０ミリ秒のタイムスタンプ
                        "EndDate"   : 1112222,    // 終了日の０時０分０秒０ミリ秒のタイムスタンプ
                        "Created"   : 1010101,    // 作成日時のタイムスタンプ（ミリ秒まで）
                        "Updated"   : 1010102     // 更新日時のタイムスタンプ（ミリ秒まで）
                    }
                ]
            };
        socket.emit('resEventList', resEventList);
    });
});
