<template>
  <common-layout class="style2">
    <!-- <div class="bigFont">TTDZ</div> -->
    <!-- <div class="circle"></div> -->
    <div class="logo">
      <img src="@/assets/img/pc-Login-logo.png" />
    </div>
    <div class="loginContainer">
      <div class="left">
        <img src="@/assets/img/pc-Login-ph-1.jpg" />
      </div>
      <div class="right">
        <div class="topLogo">
          <img src="@/assets/img/m-Login-icon-1.jpg" />
        </div>
        <div class="login">
          <a-form :form="form">
            <a-tabs @change="changeTab" :tabBarStyle="{ textAlign: 'center' }"
              style="padding: 0 2px" size="large" class="login_change_tabs">
              <a-tab-pane tab="账户密码登录" key="1" style="padding: 25px 40px">
                <div style="position: absolute; top: 16px; left: 0px; z-index: 99"
                  v-if="showChooseUser">
                  <a-button icon="user" size="small" type="primary"
                    @click="openChooseUser"></a-button>
                </div>
                <div style="height: 30px"></div>
                <a-alert type="error" :closable="true" v-show="error" :message="error" showIcon
                  style="margin-bottom: 24px" />
                <a-form-item>
                  <a-input autocomplete="autocomplete" size="large" placeholder="请输入账户名"
                    v-decorator="[
                      'name',
                      {
                        rules: [
                          { required: true, message: '请输入账户名', whitespace: true },
                        ],
                      },
                    ]">
                    <a-icon slot="prefix" type="user" />
                  </a-input>
                </a-form-item>
                <a-form-item>
                  <a-input size="large" placeholder="请输入密码" autocomplete="autocomplete"
                    type="password" v-decorator="[
                      'password',
                      {
                        rules: [
                          { required: true, message: '请输入密码', whitespace: true },
                        ],
                      },
                    ]">
                    <a-icon slot="prefix" type="lock" />
                  </a-input>
                </a-form-item>
                <a-form-item>
                  <div style="width: 100%; margin-top: 24px; display: flex; gap: 20px">
                    <a-button :loading="logging" style="
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                      " size="large" @click="onSubmit($event, 1)" type="primary" ghost>
                      <img style="width: 28px; height: 28px; margin-right: 10px" :src="
                          getProdFileUrl(
                            '/public/upload/file/13/0/2024-10-31-03-10-55-8a7a7ff0-6702-4408-a41c-6b3d6997d37f.png'
                          )
                        " />
                      企微验证登录</a-button>
                    <a-button :loading="logging" v-if="!iss2b2c" style="
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                      " size="large" @click="onSubmit($event, 2)" type="primary" ghost>
                      <img style="width: 24px; height: 24px; margin-right: 10px" :src="
                          getProdFileUrl(
                            '/public/upload/file/13/0/2024-10-31-03-11-00-0c18b13e-c6c3-48f9-bd8c-6e51a22a4dd0.png'
                          )
                        " />微信验证登录</a-button>
                  </div>
                </a-form-item>
              </a-tab-pane>
              <a-tab-pane tab="企业微信登录" key="2">
                <div class="tipContainer" v-if="isLoadingQwLoging || errorMessage">
                  <div class="isLoading" v-if="isLoadingQwLoging">
                    <a-spin size="large" tip="加载中，请稍候..." />
                  </div>
                  <div class="errorMessage" v-if="errorMessage">
                    <div>{{ errorMessage }}</div>
                    <div style="margin-top: 30px; text-align: center">
                      <a-button type="primary" @click="changeTab(2)" size="large"
                        style="width: 150px">重新登录</a-button>
                    </div>
                  </div>
                </div>
                <div id="qw_qr_login" class="qw_qr_login" style="margin-top: -14px"></div>
              </a-tab-pane>
              <a-tab-pane tab="微信扫码登录" key="3" v-if="!iss2b2c">
                <div id="wx_qr_login" class="wx_qr_login">
                  <div class="weChatTitle">
                    <div>
                      <img :src="
                          getProdFileUrl(
                            '/public/upload/file/13/0/2024-10-31-03-11-00-0c18b13e-c6c3-48f9-bd8c-6e51a22a4dd0.png'
                          )
                        " />
                    </div>
                    <span>请使用微信扫码登录</span>
                  </div>
                  <div id="qrcode" style="margin: 0 auto"></div>
                  <div v-if="endSeconds <= 0" style="color: #ff5b58">此二维码已失效</div>
                  <div v-else>此二维码将在 {{ endSeconds }} 秒后失效</div>
                  <div v-if="endSeconds <= 0" class="resetQrCode">
                    <a-button type="primary" @click="resetQrCode">重新获取二维码</a-button>
                  </div>
                  <div class="isLoadingQrCode" v-if="isPreRequesting || isLoadingQrCode">
                    <a-spin size="large" tip="加载二维码中，请稍候..." />
                  </div>
                </div>
              </a-tab-pane>
              <!-- <a-tab-pane tab="手机号登录" key="2">
              <a-form-item>
                <a-input size="large" placeholder="mobile number" >
                  <a-icon slot="prefix" type="mobile" />
                </a-input>
              </a-form-item>
              <a-form-item>
                <a-row :gutter="8" style="margin: 0 -4px">
                  <a-col :span="16">
                    <a-input size="large" placeholder="captcha">
                      <a-icon slot="prefix" type="mail" />
                    </a-input>
                  </a-col>
                  <a-col :span="8" style="padding-left: 4px">
                    <a-button style="width: 100%" class="captcha-button" size="large">获取验证码</a-button>
                  </a-col>
                </a-row>
              </a-form-item>
            </a-tab-pane> -->
            </a-tabs>
            <!-- <div>
            <a-checkbox :checked="true" >自动登录</a-checkbox>
            <a style="float: right">忘记密码</a>
          </div> -->
            <!-- <div>
            其他登录方式
            <a-icon class="icon" type="wechat" /> -->
            <!-- <a-icon class="icon" type="taobao-circle" /> -->
            <!-- <a-icon class="icon" type="weibo-circle" /> -->
            <!-- <router-link style="float: right" to="/dashboard/workplace" >注册账户</router-link> -->
            <!-- </div> -->
          </a-form>

          <Transition name="bounce">
            <div class="checkLoginContainer" v-if="isCheckLoging">
              <div class="isLoading" v-if="isLoadingQrCode">
                <a-spin size="large" tip="加载中，请稍候..." />
              </div>

              <div class="checkLoginWxQrCode" v-if="checkType === 2">
                <div class="weChatTitle">
                  <div>
                    <img :src="
                        getProdFileUrl(
                          '/public/upload/file/13/0/2024-10-31-03-11-00-0c18b13e-c6c3-48f9-bd8c-6e51a22a4dd0.png'
                        )
                      " />
                  </div>
                  <span>请使用微信扫码登录</span>
                </div>
                <div id="checkLoginWxQrCode" style="margin: 0 auto"></div>
              </div>
              <div id="checkLoginQrCode" v-else></div>

              <div class="errorMessageContainer" v-if="errorMessage">
                <div class="errorIcon">
                  <a-icon type="exclamation-circle" />
                </div>
                <div class="errorMessage">{{ errorMessage }}</div>
              </div>

              <div class="loginInfoWrapper" :style="
                  checkType === 1
                    ? {
                        marginTop: '-30px',
                      }
                    : {}
                ">
                <div class="checkLoginUserInfo" v-if="endSeconds <= 0">
                  登录信息已失效，请重新登录
                </div>
                <div class="checkLoginUserInfo" v-else-if="loginUserInfo.userId">
                  <Avatar :src="loginUserInfo.avatarUrl" :name="loginUserInfo.userName"
                    :size="40" />
                  <div class="userInfo">
                    <div class="name text-cut">{{ loginUserInfo.userName }}</div>
                    <div class="mobile text-cut">
                      <a-icon style="color: #3175fb" type="phone" theme="filled" />
                      <span style="margin-left: 4px">{{ loginUserInfo.userMobile }}</span>
                    </div>
                  </div>
                </div>
                <div class="checkLoginUserInfo" v-else>未知登录信息</div>

                <div>
                  <a-button type="danger" @click="cancelLogin" icon="close" size="large"
                    shape="round">{{ endSeconds > 0 ? "取消登录" : "重新登录" }}</a-button>
                </div>

                <div class="countTimeContainer" v-if="endSeconds > 0">
                  此登录信息将在 <b style="color: #ff5b58">{{ endSeconds }}</b> 秒后失效
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
    <div class="footer-logo">
      <img src="@/assets/img/pc-Login-icon-1.png" />
    </div>

    <Modal title="选择用户" ref="modal" :width="1200" @confirm="handleSubmit" hide-footer>
      <template #body>
        <!-- <a-select
          style="width: 100%"
          :allowClear="true"
          v-model="chooseUserId"
          show-search
          :filter-option="filterOption"
          placeholder="请选择用户"
        >
          <a-select-option v-for="(item, index) in users" :key="index" :value="item.id">{{
            `${item.name}(${item.mobile})`
          }}</a-select-option>
        </a-select> -->
        <div style="text-align: center">
          <a-input-search v-model="keyword" style="width: 400px; margin-bottom: 20px"
            placeholder="请输入姓名、手机号搜索" enter-button @search="handleSearch" :allowClear="true" />
        </div>
        <div class="userList">
          <div style="width: 100%; padding: 40px 0" v-if="users.length === 0">
            <Empty tip-text="暂无数据" />
          </div>
          <div class="userItem" v-for="u in users" :key="u.id" @click="chooseUser(u)">
            <div class="baseInfo">
              <Avatar :src="u.avatarUrl" :name="u.name" :size="46" />
              <div class="userInfo">
                <div class="name">{{ u.name }}</div>
                <div class="mobile">
                  <a-icon style="color: #3175fb" type="phone" theme="filled" />
                  <span style="margin-left: 4px">{{ u.mobile }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Modal>

    <Modal title="输入密码" ref="passModal" :width="500" hide-footer>
      <template #body>
        <div class="inputPassWordContainer">
          <div>
            <a-input v-model="passwordStr" placeholder="请输入密码" />
          </div>
          <div>
            <a-button type="primary" @click="confirmUpdatePassword">确定</a-button>
            <a-button @click="$refs.passModal.close()">取消</a-button>
          </div>
        </div>
      </template>
    </Modal>

    <UpdateSystem ref="updateSystem" />
  </common-layout>
</template>

<script>
import CommonLayout from "@/layouts/CommonLayout";
import UpdateSystem from "@/components/dialog/UpdateSystem.vue";
import {
  login,
  checkAdminLoginChooseUser,
  getAllUserNameList,
  getInfo,
  userQrLogin,
} from "@/services/user";
import { setAuthorization } from "@/utils/request";
import { loadRoutes } from "@/utils/routerUtil";
import { mapGetters, mapMutations } from "vuex";
import Empty from "@/components/empty";
import Avatar from "@/components/Avatar.vue";
import QRCode from "qrcodejs2";
import Modal from "@/layouts/ModalLayout.vue";
import { getMd5, getProdFileUrl } from "@/utils";

export default {
  name: "Login",
  components: { UpdateSystem, CommonLayout, Modal, Empty, Avatar },
  data() {
    return {
      logging: false,
      error: "",
      form: this.$form.createForm(this),
      showChooseUser: false,
      password: "",
      keyword: "",
      chooseUserId: undefined,
      users: [],
      limit: 30,
      page: 1,
      total: 0,
      passwordStr: "",
      wwLogin: null,
      isLoadingQrCode: false,
      isPreRequesting: false,
      preRequestingTimer: null,
      qrcode: null,
      timer: null,
      curTime: new Date(),
      loginInfo: null,
      loginUserInfo: {
        userId: 1,
        userName: "测试设计师张三设计师张三",
        userMobile: "198374837438",
        avatarUrl: "https://www.baidu.com/img/flexible/logo/pc/result.png",
      },
      checkType: 1,
      isCheckLoging: false,
      isLoadingQwLoging: false,
      errorMessage: "",
      checkLoginStateTimer: null,
      wwLoginPanel: null,
      checkWwwLoginPanelStateTimer: null,
    };
  },
  mounted() {
    // 监听键盘组合按键
    document.addEventListener("keydown", this.handleKeyDown);

    // 监听浏览器窗口关闭
    window.onbeforeunload = () => {
      this.handleCancelLoginState();
    };
  },
  beforeDestroy() {
    clearTimeout(this.timer);
    this.handleCancelLoginState();
    document.removeEventListener("keydown", this.handleKeyDown);
    window.onbeforeunload = null;
  },
  computed: {
    ...mapGetters("app", ["needUpdate"]),
    isMobile() {
      let flag = navigator.userAgent.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
      );
      if (flag === null) {
        return false;
      } else {
        return true;
      }
    },
    iss2b2c() {
      return process?.env?.VUE_APP_GET_ENV === "s2b2c";
    },
    systemName() {
      return this.$store.state.setting.systemName;
    },
    endSeconds() {
      let expireAt = null;

      if (this.isCheckLoging) {
        expireAt = this.loginUserInfo?.expireAt;
      } else {
        expireAt = this.loginInfo?.expireAt;
      }

      if (!expireAt) {
        return 0;
      }

      let time1 = new Date(expireAt).getTime();
      let time2 = new Date(this.curTime).getTime();

      if (time1 < time2) {
        return 0;
      }

      return Math.floor((time1 - time2) / 1000);
    },
  },
  watch: {
    needUpdate: {
      handler(val) {
        if (Number(val) === 1) {
          this.openUpdateSystem();
        }
      },
      immediate: true,
    },
  },
  async created() {
    this.checkAdminPassword();
    this.countTime();
  },
  methods: {
    ...mapMutations("account", [
      "setUser",
      "setPermissions",
      "setFunctions",
      "setRoles",
      "setIsDefaultPassword",
      "setNeedChangePassword",
    ]),
    getProdFileUrl,
    countTime() {
      this.curTime = new Date();

      // requestAnimationFrame(this.countTime)
      this.timer = setTimeout(() => {
        this.countTime();
      }, 1000);
    },
    async checkAdminPassword() {
      let showChooseUserAdmin = localStorage.getItem("showChooseUserAdmin");
      if (showChooseUserAdmin) {
        let res = await checkAdminLoginChooseUser({
          showChooseUser: getMd5(showChooseUserAdmin),
        });
        if (res.code === 1) {
          if (Number(res.data.checkRes) === 1) {
            this.showChooseUser = true;
            this.password = res.data.password;
          } else {
            this.showChooseUser = false;
            this.password = "";
          }
        }
      }
    },
    async openChooseUser() {
      this.chooseUserId = undefined;
      this.$store.commit("app/setLoading", true);
      let res = await getAllUserNameList({
        page: this.page,
        limit: this.limit,
        keyword: this.keyword,
        password: this.password,
      });
      this.users = res.data.rows;
      this.total = res.data.count;
      this.$refs.modal.show();
      this.$store.commit("app/setLoading", false);
    },
    chooseUser(user) {
      this.chooseUserId = user.id;
      this.form.setFieldsValue({
        name: user.mobile,
        password: this.password,
      });
      this.$refs.modal.close();
    },
    openUpdateSystem() {
      this.$store.commit("app/setLoading", true);
      if (!this.$refs.updateSystem) {
        setTimeout(() => {
          this.openUpdateSystem();
        }, 100);
        return;
      }
      this.$store.commit("app/setLoading", false);
      this.$refs.updateSystem.show();
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
    handleSearch() {
      this.$store.commit("app/setLoading", true);
      this.openChooseUser();
    },
    handleSubmit() {
      if (!this.chooseUserId) {
        this.$message.warning("请选择用户");
        return;
      }
      let user = this.users.find((v) => v.id === this.chooseUserId);
      if (!user) {
        this.$message.warning("请选择用户");
        return;
      }
      this.$refs.modal.close();
      this.form.setFieldsValue({
        name: user.mobile,
        password: this.password,
      });
    },
    resetQrCode() {
      this.initWxQrCode();
    },
    async initWxQrCode() {
      this.isLoadingQrCode = true;
      this.isPreRequesting = true;
      this.loginInfo = null;

      this.preRequestingTimer = setTimeout(async () => {
        let url = `${process.env.VUE_APP_CHECK_WX_PREV_URL}/#/pages/login/webWxLogin`;

        if (!this.isPreRequesting) {
          return;
        }

        let res = await userQrLogin({});

        this.isPreRequesting = false;

        if (res.code !== 1) {
          this.isLoadingQrCode = false;
          return;
        }

        if (!res?.data?.codeId) {
          this.isLoadingQrCode = false;
          this.$message.error("获取二维码失败，请重试");
          return;
        }

        this.loginInfo = res.data;

        // https://open.weixin.qq.com/connect/oauth2/authorize?appid=${process.env.VUE_APP_WX_APPID}&${encodeURIComponent(url)}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect

        if (!this.qrcode) {
          this.qrcode = new QRCode("qrcode", {
            width: 240, // 设置宽度
            height: 240, // 设置高度
            text: `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${process.env.VUE_APP_WX_APPID}&redirect_uri=${encodeURIComponent(
              url
            )}&response_type=code&scope=snsapi_userinfo&state=${res.data.codeId}#wechat_redirect`,
            correctLevel: QRCode.CorrectLevel.M,
          });
        } else {
          this.qrcode.clear();
          if (this.checkLoginStateTimer) {
            clearTimeout(this.checkLoginStateTimer);
          }
          this.qrcode.makeCode(
            `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${process.env.VUE_APP_WX_APPID}&redirect_uri=${encodeURIComponent(
              url
            )}&response_type=code&scope=snsapi_userinfo&state=${res.data.codeId}#wechat_redirect`
          );
        }

        this.isLoadingQrCode = false;
        this.checkLoginState();
      }, 3000);
    },
    async initUserWxQrCode() {
      this.$nextTick(() => {
        let url = `${process.env.VUE_APP_CHECK_WX_PREV_URL}/#/pages/login/confirmLogin?codeId=${this.loginUserInfo.codeId}`;

        new QRCode("checkLoginWxQrCode", {
          width: 280, // 设置宽度
          height: 280, // 设置高度
          text: url,
          correctLevel: QRCode.CorrectLevel.M,
        });

        this.checkLoginState();
      });
    },
    async checkLoginState() {
      let loginInfo = null;
      if (this.isCheckLoging) {
        loginInfo = this.loginUserInfo;
      } else {
        loginInfo = this.loginInfo;
      }

      if (!loginInfo) {
        return;
      }

      let res = await userQrLogin({
        codeId: loginInfo.codeId,
        type: "checkLogin",
      });

      if (res?.data?.expireAt) {
        loginInfo.expireAt = res.data.expireAt;
      }

      if (Number(res?.data?.status) === 1) {
        // 如果过期时间小于3秒，设置下次检查时间为过期时间-当前时间
        if (new Date(loginInfo.expireAt).getTime() - new Date().getTime() < 3000) {
          this.checkLoginStateTimer = setTimeout(() => {
            this.checkLoginState();
          }, new Date(loginInfo.expireAt).getTime() - new Date().getTime());
        } else {
          this.checkLoginStateTimer = setTimeout(() => {
            this.checkLoginState();
          }, 3000);
        }
      } else if (Number(res?.data?.status) === 2) {
        loginInfo = null;
        this.$store.commit("app/setLoading", true);

        this.$message.success("登录成功", 3);
        // Cookie.set("UeAuthorization", "Bearer " + res.data.token, {
        //   expires: new Date(res.data.expireAt),
        // });
        this.afterLogin({
          data: {
            code: 1,
            data: {
              token: res.data.token,
              expireAt: res.data.expireAt,
            },
          },
        });
      } else {
        if (this.isCheckLoging) {
          this.errorMessage = res?.data?.message || "登录失败，请重试";
          // 清除二维码
          const qr_code_dom = document.getElementById("checkLoginWxQrCode");
          if (qr_code_dom) {
            qr_code_dom.innerHTML = "";
          }
          this.loginUserInfo = null;
        } else {
          this.$message.error(res?.data?.message || "登录失败，请重新登录");
          loginInfo = null;
        }
      }
    },
    async checkQyWxStatus() {
      if (this.endSeconds <= 0) {
        if (!this.errorMessage) {
          this.errorMessage = "此登录信息已失效，请重新登录";
        }
        this.isLoadingQwLoging = false;

        if (this.checkLoginStateTimer) {
          clearTimeout(this.checkLoginStateTimer);
        }

        if (this.wwLoginPanel) {
          this.wwLoginPanel.unmount();
        }
        return;
      }

      this.checkWwwLoginPanelStateTimer = setTimeout(() => {
        this.checkQyWxStatus();
      }, 1000);
    },
    async qyWxLogin(code) {
      const res = await userQrLogin({
        code: code,
        codeId: this.isCheckLoging ? this.loginUserInfo?.codeId : undefined,
        type: "qyWxLogin",
      });

      if (res?.code !== 1) {
        this.errorMessage = res?.message || "登录失败，请重试";
        this.isLoadingQwLoging = false;
        this.isLoadingQrCode = false;
        if (this.isCheckLoging) {
          this.loginUserInfo = null;
        }
        return;
      }

      this.$store.commit("app/setLoading", true);
      this.$message.success("登录成功", 3);
      this.afterLogin({
        data: {
          code: 1,
          data: {
            token: res.data.token,
            expireAt: res.data.expireAt,
          },
        },
      });
    },
    cancelLogin() {
      this.isCheckLoging = false;
      this.isLoadingQwLoging = false;
      this.errorMessage = "";
      this.checkLoginStateTimer = null;
      this.isPreRequesting = false;
      if (this.preRequestingTimer) {
        clearTimeout(this.preRequestingTimer);
      }
      if (this.checkLoginStateTimer) {
        clearTimeout(this.checkLoginStateTimer);
      }
      if (this.wwLoginPanel) {
        this.wwLoginPanel.unmount();
      }
      if (this.checkWwwLoginPanelStateTimer) {
        clearTimeout(this.checkWwwLoginPanelStateTimer);
      }
      if (this.checkLoginStateTimer) {
        clearTimeout(this.checkLoginStateTimer);
      }
      this.handleCancelLoginState();
      this.loginInfo = null;
      this.loginUserInfo = null;
    },
    async handleCancelLoginState() {
      await userQrLogin({
        codeId: this.loginUserInfo?.codeId || this.loginInfo?.codeId,
        type: "cancelLogin",
      });
    },
    initQyWxContainer(id) {
      const _this = this;
      this.errorMessage = "";
      this.isLoadingQwLoging = false;
      this.isLoadingQrCode = true;
      this.$nextTick(() => {
        var url = `${process.env.VUE_APP_CHECK_WX_URL}/#/wxqrlogin`;

        this.wwLoginPanel = window.ww.createWWLoginPanel({
          el: id,
          params: {
            login_type: "CorpApp",
            appid: process.env.VUE_APP_WECOM_APPID,
            agentid: process.env.VUE_APP_WECOM_AGENTID,
            redirect_uri: url,
            state: "wxqrlogin",
            redirect_type: "callback",
          },
          onLoginSuccess({ code }) {
            if (!code) {
              _this.$message.error("登录失败，请重试", 3);
              return;
            }
            _this.isLoadingQwLoging = true;
            _this.isLoadingQrCode = true;
            _this.removeQrLogincode();

            _this.qyWxLogin(code);
          },
          onLoginFail(err) {
            console.log(err);
            _this.isLoadingQrCode = false;
            _this.$message.error("登录失败，请重试", 3);
          },
        });

        if (this.isCheckLoging && this.checkType === 1) {
          setTimeout(() => {
            this.isLoadingQrCode = false;
            this.checkQyWxStatus();
          }, 1000);
        }
      });
    },
    changeTab(e) {
      if (Number(e) === 2) {
        this.initQyWxContainer("#qw_qr_login");
      } else if (Number(e) === 3) {
        this.$nextTick(() => {
          this.isLoadingQrCode = true;

          // const iframe = document.createElement("iframe");
          // iframe.src = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${process.env.VUE_APP_WX_APPID}&redirect_uri=${encodeURIComponent(
          //   url,
          // )}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`;
          // iframe.style.width = "100%";
          // iframe.style.height = "100%";
          // iframe.style.border = "none";
          // console.log("iframe", iframe);
          // document.getElementById("wx_qr_login").appendChild(iframe);

          // new window.WxLogin({
          //   self_redirect: true,
          //   id: "wx_qr_login",
          //   appid: "${process.env.VUE_APP_WX_APPID}",
          //   scope: "snsapi_login",
          //   redirect_uri: encodeURIComponent(url),
          //   state: "wxlogin",
          //   style: "black",
          //   stylelite: 1,
          // });
          this.initWxQrCode();
        });
      }
      this.$nextTick(() => {
        // document.getElementById("qr_login").innerHTML = "";
        // 销毁iframe
        if (Number(e) !== 2) {
          this.removeQrLogincode();
          this.errorMessage = "";
          this.isLoadingQwLoging = false;
          if (this.wwLoginPanel) {
            this.wwLoginPanel.unmount();
          }
        }

        if (Number(e) !== 3) {
          if (this.qrcode) {
            this.qrcode.clear();
          }
          this.loginInfo = null;
          this.isLoadingQrCode = false;
          this.isPreRequesting = false;
          if (this.preRequestingTimer) {
            clearTimeout(this.preRequestingTimer);
          }
          if (this.checkLoginStateTimer) {
            clearTimeout(this.checkLoginStateTimer);
          }
        }
      });
    },
    removeQrLogincode() {
      let qw_qr_login = document.getElementById("qw_qr_login");
      if (qw_qr_login) {
        var iframe = qw_qr_login.getElementsByTagName("iframe")[0];
        if (iframe) {
          iframe.parentNode.removeChild(iframe);
        }
      }

      if (this.wwLoginPanel) {
        this.wwLoginPanel.unmount();
      }
    },
    onSubmit(e, t) {
      e.preventDefault();
      this.form.validateFields((err) => {
        if (!err) {
          this.logging = true;
          const name = this.form.getFieldValue("name");
          const password = this.form.getFieldValue("password");
          this.checkType = t;
          this.checkLogin(name, password);
        }
      });
    },
    async checkLogin(name, password) {
      let loginRes = await login(name, password);

      this.logging = false;
      if (loginRes?.data?.data?.needCheckLoginByWxOrQw) {
        this.isCheckLoging = true;

        this.loginUserInfo = loginRes.data.data;

        if (!this.loginUserInfo.userId || !this.loginUserInfo.codeId) {
          this.errorMessage = "未知登录信息";
          this.$message.error("登录失败，请重试", 3);
          return;
        }

        if (this.checkType === 1) {
          this.initQyWxContainer("#checkLoginQrCode");
        } else {
          this.initUserWxQrCode();
        }
      } else {
        this.afterLogin(loginRes);
      }
    },
    afterLogin(res) {
      this.logging = false;
      const loginRes = res.data;
      if (loginRes.code > 0) {
        setAuthorization({
          token: loginRes.data.token,
          expireAt: new Date(loginRes.data.expireAt),
        });
        // 获取路由配置
        getInfo().then((result) => {
          if (!result.data.data) {
            return;
          }
          const {
            isDefaultPassword,
            needChangePassword,
            user,
            permissions,
            functions,
            roles,
            routes,
          } = result.data.data;
          if (isDefaultPassword) {
            this.setIsDefaultPassword(isDefaultPassword);
          }
          if (needChangePassword) {
            this.setNeedChangePassword(needChangePassword);
          }
          this.setUser(user);
          this.setPermissions(permissions);
          this.setFunctions(functions);
          this.setRoles(roles);
          loadRoutes(routes);
          this.$store.commit("app/setLoading", false);
          this.$router.push("/dashboard/workplace");
          if (loginRes.message) {
            this.$message.success(loginRes.message, 3);
          }
        });
      } else {
        this.error = loginRes.message;
      }
    },
    handleKeyDown(e) {
      // ctrl + shift + alt + t
      if (e.ctrlKey && e.shiftKey && e.altKey && e.keyCode === 84) {
        this.passwordStr = localStorage.getItem("showChooseUserAdmin");
        this.$refs.passModal.show();
      }
    },
    confirmUpdatePassword() {
      if (!this.passwordStr) {
        this.$message.warning("请输入密码");
        return;
      }
      this.$refs.passModal.close();
      localStorage.setItem("showChooseUserAdmin", this.passwordStr);
      this.checkAdminPassword();
    },
  },
};
</script>

<style lang="less">
.bounce-enter-active {
  animation: bounce-in 0.3s;
}
.bounce-leave-active {
  animation: bounce-in 0.3s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

#qr_login {
  display: flex;
  iframe {
    margin: 20px auto 0;
  }
}
.login_change_tabs {
  .ant-tabs-nav {
    margin-bottom: 0;
  }
  .ant-tabs-tab {
    margin: 0 12px;
    padding: 12px 16px;
  }
  .ant-tabs-tab-active {
    color: @primary-color;
  }
}
</style>

<style lang="less" scoped>
.logo {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  position: absolute;
  // position: fixed;
  // top: 20px;
  // left: 20px;
  // width: 200px;
  img {
    width: 80px;
    // width: 100%;
    // height: 160px;
    // margin-left: 45px;
  }
}
.footer-logo {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  position: absolute;
  img {

  }
}
.bigFont,
.circle {
  display: none;
  z-index: 1;
  position: relative;
}
.common-layout {
  &.style2 {
    position: relative;
    // background: #2a8d78;
    background-image: url("~@/assets/img/pc-Login-bg.jpg");
    .logo {
      filter: brightness(0) invert(1);
    }
    .bigFont {
      display: block;
      font-weight: bold;
      color: #ffffff22;
      position: fixed;
      height: 32vw;
      line-height: 32vw;
      font-size: 44vw;
      bottom: 0;
      left: 0;
      text-indent: -4vw;
      width: 100%;
      text-align: justify;
      &::after {
        line-height: 0;
        content: " ";
        display: inline-block;
        width: 100%;
      }
    }
    .circle {
      display: block;
      width: 50vw;
      height: 50vw;
      border-radius: 50%;
      background: #ffffff22;
      position: fixed;
      top: -25vw;
      right: -25vw;
      &::after {
        display: block;
        width: 60%;
        height: 60%;
        border-radius: 50%;
        background: #ffffff22;
        content: " ";
        position: absolute;
        top: 20%;
        left: 20%;
        background: #2a8d78;
      }
    }
    .loginContainer {
      display: flex;
      justify-content: center;
      align-items: center;
      // height: 626px;
      margin: calc(50vh - 293px - 112px) auto;
      background-color: #fff;
      width: 1100px;
      border-radius: 4px;
      overflow: hidden;
      z-index: 3;
      position: relative;
      .left {
        // flex: 1.2;
        height: 100%;
        background-color: #f3fffc;
        img {
          object-fit: contain;
          // width: 90%;
          // margin-left: 5%;
          // height: 100%;
        }
      }
      .right {
        flex: 1;
        display: flex;
        align-items: center;
        flex-direction: column;
        .topLogo {
          text-align: center;
          width: 63px;
          border-radius: 10px;
          overflow: hidden;
          img {
            width: 100%;
          }
        }
        .login {
          width: 480px;
          height: 410px;
          margin: 20px auto 0;
          .icon {
            font-size: 24px;
            color: @text-color-second;
            margin-left: 16px;
            vertical-align: middle;
            cursor: pointer;
            transition: color 0.3s;
            &:hover {
              color: @primary-color;
            }
          }
        }
      }
      #qw_qr_login {
        height: 460px;
        padding: 0;
        zoom: 1;
      }
    }
  }
  .login {
    width: 368px;
    margin: 80px auto 0;
    position: relative;
    @media screen and (max-width: 576px) {
      width: 95%;
    }
    @media screen and (max-width: 320px) {
      .captcha-button {
        font-size: 14px;
      }
    }
    .icon {
      font-size: 24px;
      color: @text-color-second;
      margin-left: 16px;
      vertical-align: middle;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: @primary-color;
      }
    }
  }
  .checkLoginContainer {
    width: 100%;
    height: 470px;
    margin-top: -20px;
    background-color: #fff;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 100;

    .isLoading {
      width: 100%;
      height: calc(100% - 10px);
      background: #ffffffdd;
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 20px;
      left: 0;
      z-index: 3;
    }

    .errorMessageContainer {
      width: 100%;
      height: 340px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 2;
      .errorIcon {
        color: #ff5b58;
        font-size: 30px;
      }
      .errorMessage {
        color: #ff5b58;
        font-size: 14px;
        margin-top: 10px;
        padding: 0 20px;
      }
    }

    #checkLoginQrCode {
      width: 480px;
      height: 416px;
      margin: 0px auto;
      position: relative;
      z-index: 1;
      img {
        width: 100%;
        height: 100%;
      }
    }

    .checkLoginWxQrCode {
      width: 480px;
      height: 335px;
      margin: 0px auto;
      position: relative;
      z-index: 1;
      padding-bottom: 25px;

      #checkLoginWxQrCode {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      img {
        width: 100%;
        height: 100%;
      }

      .weChatTitle {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-bottom: 5px;
        font-size: 18px;
        margin-top: 30px;
        color: #10141a;
        img {
          width: 20px;
          height: 20px;
        }
      }
    }

    .checkLoginUserInfo {
      width: 220px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ff5b58;
      .userInfo {
        width: 174px;
        padding-left: 10px;
        .name {
          font-size: 14px;
          font-weight: bold;
          color: #333;
        }
        .mobile {
          font-size: 13px;
          color: #666;
        }
      }
    }

    .loginInfoWrapper {
      width: 370px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #ff6e0022;
      border: 1px solid #ff6e00;
      margin: 0 auto;
      padding: 8px;
      gap: 10px;
      border-radius: 100px;
      margin-top: 10px;
      position: relative;
      z-index: 2;

      .countTimeContainer {
        width: 100%;
        position: absolute;
        bottom: -24px;
        left: 0;
        font-size: 13px;
        text-align: center;
        color: #666;
      }
    }
  }
}

.userList {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  .userItem {
    width: 220px;
    text-align: left;
    background: #fafafa;
    border-radius: 6px;
    padding: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    &:hover {
      background: #f0f0f0;
    }
    &.active {
      background: #f3fbff;
      box-shadow: 0px 0px 30px 0px #3175fb33 inset;
    }
    .baseInfo {
      display: flex;
    }
    .userInfo {
      flex: 1;
      padding-left: 10px;
      .name {
        font-size: 14px;
        line-height: 26px;
        font-weight: bold;
      }
      .mobile {
        font-size: 13px;
      }
    }
  }
}
.inputPassWordContainer {
  > div {
    text-align: center;
    &:first-child {
      margin-bottom: 20px;
    }
    .ant-btn {
      margin: 0 20px;
    }
  }
}

.weChatTitle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 5px;
  font-size: 18px;
  color: #10141a;
  img {
    width: 20px;
    height: 20px;
  }
}

#wx_qr_login {
  padding-top: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  position: relative;
  .resetQrCode,
  .isLoadingQrCode {
    width: 240px;
    height: 240px;
    position: absolute;
    top: 67px;
    left: 50%;
    transform: translateX(-50%);
    background: #000000cc;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .isLoadingQrCode {
    width: 100%;
    height: 390px;
    background: #fff;
    top: 0;
  }
  #qrcode {
    width: 240px;
    height: 240px;
    img {
      width: 100%;
      height: 100%;
    }
  }
}

.tipContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 360px;
  .errorMessage {
    color: #ff5b58;
    font-weight: bold;
  }
}
</style>
