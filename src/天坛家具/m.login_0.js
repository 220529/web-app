<script setup lang="ts">
import AppProvider from '@/components/AppProvider/index.vue';
import { reactive, ref } from 'vue';
import { onReady } from '@dcloudio/uni-app';
import { useAuthStore } from '@/state/modules/auth';
import { Toast, ToastError } from '@/utils/uniapi/prompt';
import { isQyWx, isWx, getEnvValue } from '@/utils/env';
import { encryptByMd5 } from '@/utils/cipher';
import { omit } from 'lodash-es';
import UniForm from '@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue';
import UniFormItem from '@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue';
import UniDataCheckbox from '@/uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.vue';
import UniEasyinput from '@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue';
import UniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue';
import UniPopupMessage from '@/uni_modules/uni-popup/components/uni-popup-message/uni-popup-message.vue';
import UniToast from '@/uni_modules/uv-toast/components/uv-toast/uv-toast.vue';
import { useUtils } from '@/hooks/useUtils';
const { getQyWxUrl, getWxUrl } = useUtils();

const isWeixin = ref(isWx());
const isQw = ref(isQyWx());
const VITE_PROJECT_PATH = getEnvValue<string>('VITE_PROJECT_PATH');

const pageQuery = ref<Record<string, any> | undefined>(undefined);
onLoad((query) => {
  pageQuery.value = query;
});

const authStore = useAuthStore();
const router = useRouter();
const msgType = ref('warn');
const messageText = ref('');
const valiForm: any = ref(null);
// const customerValiForm: any = ref(null);
const messageTip: any = ref(null);
// const loginType = ref(2);
const autoLogin = ref([] as any);
const loading = ref(false);
const inputStyle = {
  borderColor: 'transparent',
};
const rules = {
  username: {
    rules: [
      {
        required: true,
        errorMessage: '请输入账号',
      },
      {
        minLength: 6,
        errorMessage: '账号最少为6个字符',
      },
    ],
  },
  password: {
    rules: [
      {
        required: true,
        errorMessage: '请输入密码',
      },
      {
        minLength: 6,
        errorMessage: '密码最少为6个字符',
      },
    ],
  },
};
const valiFormData = reactive({
  username: '',
  password: '',
});
// const customerValiFormData = reactive({
//   username: '',
//   orderNumber: '',
// });

const login = () => {
  if (loading.value) return;
  valiForm.value
    .validate()
    .then(async (res: any) => {
      if (!isQw.value && !isWeixin.value) {
        return ToastError(toastRef.value, '请在企业微信或者微信环境中打开页面');
      }

      // if (wxReady.value === true) {
      uni.showLoading({
        title: '正在登录...',
        mask: true,
      });
      loading.value = true;

      authStore
        .login({
          username: res.username,
          password: encryptByMd5(res.password),
          loginType: 2,
          autoLogin: autoLogin.value.includes(1) ? 1 : 0,
          mPath: VITE_PROJECT_PATH,
        })
        .then((res) => {
          uni.hideLoading();
          loading.value = false;
          if (res.needCheckLoginByWxOrQw) {
            let url = '';
            if (isQw.value) {
              url = getQyWxUrl('/pages/login/mobileWxLogin', {
                scope: 'snsapi_userinfo',
                state: res.codeId,
              });
            } else {
              url = getWxUrl('/pages/login/mobileWxLogin', {
                scope: 'snsapi_userinfo',
                state: res.codeId,
              });
            }
            uni.setStorageSync('__WX_AUTH_BACKPATH__', '/pages/login/login');
            window.location.replace(url);
            return;
          }

          Toast('登录成功', { duration: 1500 });
          if (unref(pageQuery)?.redirect) {
            // 如果有存在redirect(重定向)参数，登录成功后直接跳转
            const params = omit(unref(pageQuery), ['redirect', 'tabBar']);
            if (unref(pageQuery)?.tabBar) {
              // 这里replace方法无法跳转tabbar页面故改为replaceAll
              router.replaceAll({ name: unref(pageQuery)?.redirect, params });
            } else {
              router.replace({ name: unref(pageQuery)?.redirect, params });
            }
          } else {
            router.replaceAll('/pages/loading');
          }
        })
        .catch((err: any) => {
          console.log(err);
          loading.value = false;
        });
      // } else if (wxReady.value === false) {
      //   ShowErrorToast('微信功能加载失败！');
      // }
    })
    .catch((err: any) => {
      console.log('err', err);
    });
};

const toHistory = () => {
  router.replaceAll('/pages/login/loginHistory');
};

onReady(() => {
  valiForm.value.setRules(rules);
  uni.setNavigationBarTitle({
    title: '登录',
  });
});

const toastRef = ref<InstanceType<typeof UniToast>>();
</script>

<template>
  <AppProvider>
    <view class="login">
      <view class="loginBg">
        <image class="logo1" src="/static/images/logo1.png" mode="widthFix"></image>
        <!-- 商家登录 -->
        <view class="loginContainer loginContainer1" :class="'active'">
          <view class="loginTitle">登录 LOGIN</view>
          <UniForm ref="valiForm" :modelValue="valiFormData" style="padding-bottom: 0rpx">
            <UniFormItem name="username" class="input">
              <uni-easyinput
                prefixIcon="person"
                :inputBorder="false"
                :styles="inputStyle"
                v-model="valiFormData.username"
                placeholder="请输入账号"
              />
            </UniFormItem>
            <UniFormItem name="password" class="input">
              <uni-easyinput
                type="password"
                prefixIcon="locked"
                :inputBorder="false"
                :styles="inputStyle"
                v-model="valiFormData.password"
                placeholder="请输入密码"
              />
            </UniFormItem>
          </UniForm>
          <uni-data-checkbox
            v-if="isQw"
            multiple
            v-model="autoLogin"
            :localdata="[{ value: 1, text: '企业微信自动登录' }]"
          ></uni-data-checkbox>
          <uni-data-checkbox
            v-else-if="isWeixin"
            multiple
            v-model="autoLogin"
            :localdata="[{ value: 1, text: '微信自动登录' }]"
          ></uni-data-checkbox>
          <view v-else class="_u_wfull _u_h50rpx"></view>
          <button class="loginBtn" :loading="loading" @click="login()">验证登录</button>
          <view class="btnContainer">
            <button class="historyBtn" @click="toHistory">登录历史</button>
          </view>
        </view>
        <image class="logo2" src="/static/images/logo2.png" mode="widthFix"></image>
      </view>
      <UniPopup ref="messageTip" type="message">
        <UniPopupMessage :type="msgType" :message="messageText" :duration="2000"></UniPopupMessage>
      </UniPopup>
    </view>
    <uv-toast ref="toastRef"></uv-toast>
  </AppProvider>
</template>

<style lang="scss" scoped>
$color: lighten(
  $color: $ttcolor,
  $amount: 10,
);
@keyframes scaleBtn {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
.input {
  padding: 0rpx;
  border: 1px solid $color;
  background-color: lighten($color: $color, $amount: 60);
  border-radius: 100rpx;
  box-shadow: 0 2rpx 6rpx lighten($color: $color, $amount: 45);
  padding-left: 8rpx;
  margin-bottom: 40rpx;
}
.loginBtn {
  height: 56rpx;
  line-height: 56rpx;
  background-color: $color;
  color: #fff;
  border-radius: 100rpx;
  font-size: 20rpx;
  // font-weight: bold;
  margin-bottom: 20rpx;
  margin-top: 10rpx;
  &::after {
    border: initial;
  }
  &:active {
    animation: 0.2s scaleBtn;
  }
}
.login {
  width: 100vw;
  height: 100%;
  background-color: #eee;
  overflow: hidden;
  .loginBg {
    width: 100%;
    height: 100%;
    position: relative;
    background-image: linear-gradient(to bottom, #fff 0%, #fff 50%, #377d67 50%, #3a886e 100%);
    .logo1 {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 280rpx;
      margin: 0 auto;
      margin-left: -140rpx;
      margin-top: -560rpx;
    }
    .logo2 {
      position: absolute;
      bottom: 10rpx;
      left: 50%;
      width: 280rpx;
      margin: 0 auto;
      margin-left: -140rpx;
    }
    .loginContainer {
      position: absolute;
      top: 50%;
      left: 15%;
      width: 70%;
      height: 640rpx;
      background: #fff;
      padding: 0 80rpx;
      box-sizing: border-box;
      margin-top: -320rpx;
      border-top: 5rpx solid $color;
      box-shadow: 0 6rpx 10rpx rgba(0, 0, 0, 0.1);
      transition: 0.2s all cubic-bezier(0.215, 0.61, 0.355, 1);
      &.loginContainer1 {
        transform: translateX(-900rpx);
      }
      &.loginContainer2 {
        transform: translateX(900rpx);
      }
      &.active {
        transform: translateX(0);
      }
      .loginTitle {
        font-size: 34rpx;
        color: $color;
        text-align: center;
        line-height: 50rpx;
        margin-top: 80rpx;
        margin-bottom: 40rpx;
      }
      .btnContainer {
        margin-top: 40rpx;
        display: flex;
        justify-content: center;
      }
      .historyBtn {
        width: 200rpx;
        height: 35rpx;
        line-height: 38rpx;
        font-size: 18rpx;
        color: #888;
        border-radius: 50rpx;
        background: #f4f4f4;
        position: absolute;
        // bottom: 40rpx;
        // left: 50%;
        // margin-left: -100rpx;
        // z-index: 9;
        &::after {
          border: none;
        }
        &:active {
          animation: 0.2s scaleBtn;
        }
      }
    }
  }
}
</style>
