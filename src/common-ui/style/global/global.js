/*
 * 用于给业务模块import公共scss，
 * 避免 scss 内部@import 导致 url 路径错误，找不到对应资源文件
 */

import './global.scss';
import '../theme/default/default.scss';