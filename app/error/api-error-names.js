/**
 * API错误名称
 */
var ApiErrorNames = {};

ApiErrorNames.UNKNOW_ERROR = "unknowError";
ApiErrorNames.USER_NOT_EXIST = "userNotExist";
ApiErrorNames.USER_ALREADY_EXIST = "userAlreadyExist";
ApiErrorNames.USER_NOT_LOGIN = "userNotLogin";
ApiErrorNames.USER_NOT_REALNAME = "userNotRealname";
ApiErrorNames.PASSWORD_INCORRECT = "passwordIncorrect";
ApiErrorNames.ARTICLE_NOT_EXIST = "articleNotExist";
ApiErrorNames.DEPARTMENT_NOT_EXIST = "departmentNotExist";
ApiErrorNames.PAGE_NOT_EXIST = "pageNotExist";
ApiErrorNames.CONSULT_NOT_EXIST = "consultNotExist";
ApiErrorNames.PARAM_ILLEGAL = "paramIllegal";
ApiErrorNames.ACCESS_DENIED = "accessDenied";
ApiErrorNames.RECORD_UNSET = "recordUnset";
ApiErrorNames.SIGNIN_ALREADY = "signinAlready";
ApiErrorNames.SIGNOUT_ALREADY = "signoutAlready";

/**
 * API错误名称对应的错误信息
 */
const error_map = new Map();

error_map.set(ApiErrorNames.UNKNOW_ERROR, { code: -1, message: '未知错误' });
error_map.set(ApiErrorNames.USER_NOT_EXIST, { code: 101, message: '用户不存在' });
error_map.set(ApiErrorNames.USER_ALREADY_EXIST, { code: 102, message: '该手机已被注册' });
error_map.set(ApiErrorNames.USER_NOT_LOGIN, { code: 103, message: '用户未登陆' });
error_map.set(ApiErrorNames.USER_NOT_REALNAME, { code: 104, message: '用户未实名认证' });
error_map.set(ApiErrorNames.PASSWORD_INCORRECT, { code: 105, message: '密码不正确' });
error_map.set(ApiErrorNames.ARTICLE_NOT_EXIST, { code: 101, message: '文章不存在' });
error_map.set(ApiErrorNames.DEPARTMENT_NOT_EXIST, { code: 101, message: '部门不存在' });
error_map.set(ApiErrorNames.PAGE_NOT_EXIST, { code: 101, message: '页面不存在' });
error_map.set(ApiErrorNames.CONSULT_NOT_EXIST, { code: 101, message: '信访不存在' });
error_map.set(ApiErrorNames.PARAM_ILLEGAL, { code: 109, message: '参数不正确' });
error_map.set(ApiErrorNames.ACCESS_DENIED, { code: 401, message: '无权限访问' });
error_map.set(ApiErrorNames.RECORD_UNSET, { code: 101, message: '未设置考勤' });
error_map.set(ApiErrorNames.SIGNIN_ALREADY, { code: 102, message: '今日已签到' });
error_map.set(ApiErrorNames.SIGNOUT_ALREADY, { code: 102, message: '今日已签退' });

//根据错误名称获取错误信息
ApiErrorNames.getErrorInfo = (error_name) => {

    var error_info;

    if (error_name) {
        error_info = error_map.get(error_name);
    }

    //如果没有对应的错误信息，默认'未知错误'
    if (!error_info) {
        error_name = UNKNOW_ERROR;
        error_info = error_map.get(error_name);
    }

    return error_info;
}

module.exports = ApiErrorNames;