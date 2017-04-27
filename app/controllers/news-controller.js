const PlanModel = require('../models/plan-model');
const NoticeModel = require('../models/notice-model');
const UserModel = require('../models/user-model');
const ConsultModel = require('../models/consult-model');
const QuestionModel = require('../models/question-model');
const DisasterModel = require('../models/disaster-model');

let currentUser;
const getNews = async (ctx, next) => {
    currentUser = await UserModel.findById(ctx.session.userId);
  let unreadPlans = [];
  try {
    unreadPlans = await PlanModel.find({})
      .or([
        { receiver: ctx.session.userId },
        { receiverDepartment: currentUser.department },
        { receiverType: 3 }
      ])
      .sort({ _id: -1 })
      .populate('handlers.user')
      .where('handlers.username')
      .ne(currentUser.name)
      .lean()
      .exec();
  } catch (e) {}

  let unreadNotices = [];
  try {
    let notices = await NoticeModel.find({})
      .or([
        { receiver: ctx.session.userId },
        { receiverDepartment: currentUser.department },
        { receiverType: 3 }
      ])
      .sort({ _id: -1 })
      .populate('handlers.user')
      .lean()
      .exec();

    unreadNotices = notices.filter(n => {
      return n.handlers.filter(h => {
        return h.user._id + '' === currentUser._id + '';
      }).length === 0;
    });
  } catch (e) {}

  let undealConsults = [];
  try {
    undealConsults = await ConsultModel.find({
      department: currentUser.department,
      status: 0
    })
      .sort({ _id: -1 })
      .limit(10)
      .lean()
      .exec();
  } catch (e) {}

  let undealQuestions = [];
  try {
    undealQuestions = await QuestionModel.find({
      department: currentUser.department,
      status: 0
    })
      .sort({ _id: -1 })
      .limit(10)
      .lean()
      .exec();
  } catch (e) {}

  let undealDiasters = [];
  try {
    undealDiasters = await DisasterModel.find({
      department: currentUser.department,
      status: 0
    })
      .sort({ _id: -1 })
      .limit(10)
      .lean()
      .exec();
  } catch (e) {}

  ctx.body = {
    data: {
      plans: unreadPlans,
      notices: unreadNotices,
      questions: undealQuestions,
      consults: undealConsults,
      disasters: undealDiasters
    }
  };
};

module.exports = { getNews };
