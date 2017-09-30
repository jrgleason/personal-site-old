
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};
exports.java = function(req, res){
  res.render('java', { title: 'Express' });
};
exports.android = function(req, res){
  res.render('android', { title: 'Express' });
};
exports.responsive = function(req, res){
  res.render('responsive', { title: 'Express' });
};
exports.viz = function(req, res){
  res.render('viz', { title: 'Express' });
};
