
/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('events', {
                              title: 'じだらくスケジューラ'
                            , userName: req.user.Name
                            , userId: req.user.id
                         });
};

exports.login = function(req, res){
  res.render('login', { title: 'じだらくスケジューラ login' })
};

exports.sample = function(req, res){
    // req.userにユーザーの情報が入っている
    // { id: '51691c0a2d9455795f000001', Name: 'Takashi  Miwa' }
    res.render('sample', { title: 'じだらくスケジューラ sample' , user : req.user})
};
