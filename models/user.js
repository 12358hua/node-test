/**
 * Created by 华 on 2020/4/18.
 */
var mongoose = require('mongoose');
var usersSchema = require('../schemas/users');
module.exports = mongoose.model('User',usersSchema);