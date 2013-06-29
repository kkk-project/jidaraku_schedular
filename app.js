
/**
 * Module dependencies.
 */

var http = require('http')
  , path = require('path')
  , passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy
  , express = require('express')
  , routes = require('./routes')
  , detail = require('./routes/detail').detail
  , events = require('./routes/events').events
  , database = require('./libs/database.js');

var app = module.exports = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  // passport
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

// passport
var FACEBOOK_APP_ID = '427165787358469',
    FACEBOOK_APP_SECRET = '48cdfc9bdf15b0521ae7d1a64a4ed517',
    JIDARAKU_URL = 'http://www12139ui.sakura.ne.jp:' + app.get('port') + '/auth/facebook/callback';
    passport.use(new FacebookStrategy({
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: JIDARAKU_URL
    },
    function (accessToken, refreshToken, profile, done) {
        // passport.session.accessToken = accessToken; // 認証後返されるaccessTokenをセッションに持たせておく 本当にアプリを作る場合はこのあたりの扱いは注意

        // ユーザー情報の取得。なければ作る
        var account = { FacebookId : profile.id, Name : profile.displayName };
        database.findOrCreateUser(account, function(user) {
            // 文字列にキャスト
            var userId = '' + user._id;
            userInfo = { id : '' + user._id, Name : user.Name };
            return done(null, userInfo);
        });

       // ensureAuthenticatedが返す情報
        process.nextTick(function(){
        });
    }
    ));

// 保存しておく情報。上のuse.passportのdoneの引数が入っている?
passport.serializeUser(function(user, done){
    done(null, user);
});

passport.deserializeUser(function(obj, done){
    done(null, obj);
});

// ログインしてない場合はログイン画面に転送
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

app.configure('development', function(){
  app.use(express.errorHandler());
});

// ensureAuthenticatedを引数に入れることでログインしてない場合はログイン画面に飛ばす
app.get('/',       ensureAuthenticated, routes.index);
app.get('/detail', ensureAuthenticated, detail);
app.get('/events', ensureAuthenticated, events);
// ログイン画面
app.get('/login', routes.login);
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
        passport.authenticate('facebook', { successRedirect: '/',
                              failureRedirect: '/login' }));
        // passport.authenticate('facebook',{failureRedirect: '/fail'}),
        // function(req, res) {
        //     // console.log(req)
        // }
       //);
app.get('/sample', ensureAuthenticated, routes.sample);

var server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// socket.io
var io = require('socket.io').listen(server);

app.set( 'io', io );

// トップページのソケットサーバー
require( './libs/indexSocketServer' );
// 詳細ページのソケットサーバー
require( './libs/detailSocketServer' );
// サンプルページのソケットサーバー
require( './libs/sampleSocketServer' );

io.sockets.on('connection', function (socket) {

    // アイテムの追加・更新・削除
    socket.on('reqUpdateItem', function (item) {
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
        //socket.emitAll( 'resAllEventDetail', eventDetail );
    });


    socket.on('reqEventList', function(){
        var resEventList =
            { "events" : [
                    {
                        "EventId"   : 1,    // ページのurlにも使う、Eventsの中でユニーク
                        "EventName" : "第三回開発作戦会議！！！",
                        "StartDate" : 1111111,    // 開始日の０時０分０秒０ミリ秒のタイムスタンプ
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
