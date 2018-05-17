import 'COMMON_PAGE/common.js';
import 'element-ui/lib/theme-chalk/index.css';
import './btc-guess.scss';

import Vue from 'vue';
import ElementUI from 'element-ui';

Vue.use(ElementUI);

import page from './btc-guess.vue';

/* eslint-disable no-new */
new Vue({
    el: '#page',
    components: {
        page,
    }
});