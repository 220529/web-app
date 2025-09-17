<script setup lang="ts">
import Split from "split.js";
import ExifReader from "exifreader";
import { storeToRefs } from "pinia";
import Draggable from "vuedraggable/src/vuedraggable";
import { PDFDocument } from "pdf-lib";
import MaterialContractTemplateFormDialog from "./MaterialContractTemplateFormDialog.vue";
import ChangeContractTemplateFormDialog from "./ChangeContractTemplateFormDialog.vue";
import { TResponse } from "~/types/response";
const { modelValue, orderData } = defineModels<{
  modelValue?: boolean;
  orderData?: any;
}>();

const { parseTime, copyText } = useUtils();
const { showLoading, hideLoading, errorMessage, successMessage, updateLoadingState } =
  useAppStore();
const userStore = useUserStore();
const { curRole, functions } = storeToRefs(userStore);
const {
  filerelList,
  recordList,
  getFillUrl,
  contractList,
  runFlow,
  sendSignFlow,
  revokeSignFlow,
  terminateContractFile,
  contractDetail,
  deleteContractFile,
  // getUploadUrl,
  downloadContractFile,
  // downloadFile,
  urgeSign,
  getSignUrl,
  taskList,
  // addCover,
  downloadFileByUrl,
  getOssToken,
  downloadFileFromOss,
  // uploadFile,
  getContractInfo,
  configList,
  createContract
} = useHttp();

const cardListRef = ref<any>(null);
const { width: cardListWidth } = useElementSize(cardListRef);
const templateCardListRef = ref<any>(null);
const { width: templateCardListWidth } = useElementSize(templateCardListRef);
const templateListData = ref<any[]>([]);
const chooseTemplateDialogVisible = ref(false);

// template config
const showChooseTemplate = ref(false);
const customTemplateList = ref<any[]>([]);
const showChoosePrintRecord = ref(false);
const printTypeList = ref<any[]>([]);
const chooseRecords = ref<any[]>([]);
const chooseShowRecordType = ref("");
const chooseCoverConfig = ref<any>(null);
const chooseTemplateConfig = ref<any>(null);

// 选材明细相关
const allMaterialPrintRecordList = ref<any[]>([]);

// confirm dialog
const showConfirm = ref(false);
const confirmType = ref("");
const confirmTitle = ref("");
const confirmContent = ref("");
const chooseTemplate = ref<any>(null);

// contract list
const contractListData = ref<any[]>([]);
const showIframe = ref(false);
const iframeUrl = ref("");
const chooseContractFile = ref<any>(null);
const taskListData = ref<any[]>([]);

// tip
const tipDialogTitle = ref("");
const dialogWidth = ref(500);
const dialogHeight = ref(300);
const showTip = ref(false);
const tipContent = ref("");
const tipType = ref("");
const curData = ref<any>(null);
const inputText = ref("");
const chooseType = ref(undefined as any);
const rescissionReasonList = [
  {
    id: 1,
    name: "条款内容有误",
  },
  {
    id: 2,
    name: "印章选择错误",
  },
  {
    id: 3,
    name: "签署人信息错误",
  },
  {
    id: 4,
    name: "合作终止",
  },
  {
    id: 5,
    name: "其他",
  },
];

// 图纸文件管理
const files = ref<any[]>([]);
const showChooseFiles = ref(false);
const showImages = ref(false);
const chooseImages = ref<any[]>([]);
const checkImage = ref<any>(null);
// const curHandleParams = ref<any>({});
const gFile = ref<any>(null);
const uint8ArrayData = ref<any>(null);
// const inputFile = ref<any>(null);
const showImagesListType = ref("list");
const imagesListSize = ref("large");
const splitContainer = ref<any>(null);
const loadImageCount = ref(0);
const showImageContainerRef = ref<any>(null);

const { width: imageContainerWidth, height: imageContainerHeight } =
  useElementSize(showImageContainerRef);

const showTemplateList = computed(() => {
  // return templateListData.value.filter((v: any) => v.status === 1);
  // 按typeName分组
  const res: any[] = [];
  const typeNames: any[] = [];
  templateListData.value
    .filter((v: any) => v.status === 1 && ![2, 3, 6].includes(v.fitUse))
    .forEach((v: any) => {
      if (!typeNames.includes(v.typeName)) {
        typeNames.push(v.typeName);
        res.push({
          typeName: v.typeName,
          list: [],
        });
      }
    });
  templateListData.value
    .filter((v: any) => v.status === 1 && ![2, 3].includes(v.fitUse))
    .forEach((v: any) => {
      if (v.fitUse === 4) {
        const productId = JSON.parse(v.data || '{}')?.productId;
        if (!productId?.length || productId.includes(orderData.value.productId)) {
          res.find((item: any) => item.typeName === v.typeName)?.list.push(v);
        }
        return
      }
      res.find((item: any) => item.typeName === v.typeName)?.list.push(v);
    });
  return res.reduce((prev: any[], cur: any) => {
    return prev.concat(cur.list);
  }, []);
});
//获取材料买卖
const materialTemplateListData = computed(() => {
  return templateListData.value.filter((v: any) => v.status === 1 && [2, 3].includes(v.fitUse)).map(v => {
    return getCardData(v)
  })
})
//获取变更协议合同模板
const changeTemplateListData = computed(() => {
  return templateListData.value.filter((v: any) => v.status === 1 && [6].includes(v.fitUse)).map(v => {
    return getCardData(v)
  })
})
const useTemplateIds = computed(() => {
  return contractListData.value
    .filter(
      (v: any) =>
        ([0, 1, 2].includes(v.signFlow?.signFlowStatus) &&
          v.signFlow?.rescissionStatus !== 3) ||
        (!v.signFlow &&
          taskListData.value.find((task: any) => {
            const data = JSON.parse(task.data || "{}");
            return v.fileId === data.fileId;
          })?.status !== 3)
    )
    .map((v: any) => v.docTemplateId);
});

const useTemplateTypes = computed(() => {
  return templateListData.value
    .filter((v) => useTemplateIds.value.includes(v.templateId))
    .map((v: any) => v.houseType);
});

const allTemplateTypes = computed(() => {
  let tplIds = [...new Set(showTemplateList.value.map((v) => v.houseType))];

  return [
    {
      id: 0,
      name: `全部(${showTemplateList.value.length})`,
    },
    ...tplIds.map((v: any) => {
      let typeName = showTemplateList.value.find(
        (tpl) => tpl.houseType === v
      )?.typeName;
      let count = showTemplateList.value.filter(
        (tpl) => tpl.houseType === v
      ).length;

      return {
        id: v,
        name: `${typeName}(${count})`,
      };
    }),
  ];
});

const cardListData = computed(() => {
  return contractListData.value.map((v: any) => {
    let btns: any[] = [
      {
        text: "发起签署",
        props: {
          size: "small",
          color: "primary",
          variant: "outlined",
          prependIcon: "mdi-send-clock-outline",
        },
        click: () => {
          sendSignContractUrl(v);
        },
      },
    ];

    let floatBtns: any[] = [
      {
        text: "删除",
        icon: "mdi-delete",
        props: {
          color: "error-0001",
        },
        click: () => {
          openDeleteConfirm(v);
        },
      },
    ];

    const tplConfig = templateListData.value.find(
      (tpl: any) => tpl.templateId === v.docTemplateId
    );
    if (tplConfig?.houseState1 === 1) {
      btns = [
        {
          text: "发起审批流程",
          props: {
            size: "small",
            color: "warning",
            variant: "outlined",
            prependIcon: "mdi-send-clock-outline",
          },
          click: () => {
            openWorkflowPanel(v);
          },
        },
      ];

      let sendTaskData = taskListData.value.find((task: any) => {
        const data = JSON.parse(task.data || "{}");
        return v.fileId === data.fileId;
      });
      if (sendTaskData) {
        if (sendTaskData.status === 1) {
          btns = [
            {
              text: "流程进行中",
              props: {
                size: "small",
                color: "blue",
                variant: "outlined",
                prependIcon: "mdi-timelapse",
              },
              click: () => {
                openWorkflowPanel(sendTaskData);
              },
            },
          ];
          floatBtns = [];
        } else {
          if (sendTaskData.status === 2) {
            btns = [
              {
                text: "审批通过 发起签署",
                props: {
                  size: "small",
                  color: "green",
                  variant: "elevated",
                  prependIcon: "mdi-check-decagram",
                },
                click: () => {
                  sendSignContractUrl(v);
                },
              },
            ];
          }
          floatBtns = [
            {
              text: "审批结果",
              icon: "mdi-file-document-outline",
              props: {
                color: "primary",
              },
              click: () => {
                openWorkflowPanel(sendTaskData);
              },
            },
          ];
          if (sendTaskData.status === 0) {
            floatBtns.push({
              text: "删除",
              icon: "mdi-delete",
              props: {
                color: "error-0001",
              },
              click: () => {
                openDeleteConfirm(v);
              },
            });
          } else if (sendTaskData.status === 3) {
            btns = [
              {
                text: "审批未通过 查看",
                props: {
                  size: "small",
                  color: "error-0001",
                  variant: "elevated",
                  prependIcon: "mdi-close",
                },
                click: () => {
                  openWorkflowPanel(sendTaskData);
                },
              },
            ];
            floatBtns = [];
          }
        }
      }
    }
    if ([2].includes(v.signFlow?.signFlowStatus)) {
      btns = [
        {
          text: "下载签署文件",
          props: {
            size: "small",
            color: "primary",
            variant: "elevated",
            prependIcon: "mdi-download",
          },
          click: () => {
            downLoadSignPDF(v);
          },
        },
      ];
      if (v.signFlow?.rescissionStatus === 3) {
        btns = [
          {
            text: "查看解约原因",
            props: {
              size: "small",
              color: "#EA6A68",
              class: "text-#fff",
              variant: "elevated",
              prependIcon: "mdi-eye-arrow-left",
            },
            click: () => {
              if (!v?.signFlow?.signFlowDescription) {
                errorMessage("未获取到解约原因");
                return;
              }
              checkReason(
                "解约原因",
                v?.rescission?.rescindReasonNotes || "未获取到解约原因"
              );
            },
          },
          {
            text: "下载解约文件",
            props: {
              size: "small",
              color: "primary",
              variant: "elevated",
              prependIcon: "mdi-download",
            },
            click: () => {
              downloadRescissionPDF(v);
            },
          },
        ];
        floatBtns.push({
          text: "下载签署文件",
          icon: "mdi-download",
          props: {
            color: "primary",
          },
          click: () => {
            downLoadSignPDF(v);
          },
        });
      }
    } else if ([3, 5, 7].includes(v.signFlow?.signFlowStatus)) {
      btns = [
        {
          text: "查看PDF文件",
          props: {
            size: "small",
            color: "primary",
            variant: "elevated",
            prependIcon: "mdi-eye",
          },
          click: () => {
            getContractDetail(v.fileId);
          },
        },
      ];
      if (v.signFlow?.signFlowStatus === 7) {
        btns.unshift({
          text: "查看拒签原因",
          props: {
            size: "small",
            color: "error-0001",
            variant: "elevated",
            prependIcon: "mdi-eye-remove",
          },
          click: () => {
            if (!v?.signFlow?.signFlowDescription) {
              errorMessage("未获取到拒签原因");
              return;
            }
            checkReason("拒签原因", v?.signFlow?.signFlowDescription);
          },
        });
      } else if (v.signFlow?.signFlowStatus === 3) {
        btns.unshift({
          text: "查看撤销原因",
          props: {
            size: "small",
            color: "#D145FF",
            class: "text-#fff",
            variant: "elevated",
            prependIcon: "mdi-eye-arrow-left",
          },
          click: () => {
            if (!v?.signFlow?.signFlowDescription) {
              errorMessage("未获取到撤销原因");
              return;
            }
            checkReason("撤销原因", v?.signFlow?.signFlowDescription);
          },
        });
      }
    } else {
      btns.push({
        text: "查看PDF文件",
        props: {
          size: "small",
          color: "primary",
          variant: "elevated",
          prependIcon: "mdi-eye",
        },
        click: () => {
          getContractDetail(v.fileId);
        },
      });
      if (v.signFlow?.signFlowStatus === 1) {
        btns[0] = {
          text: "撤销签署",
          props: {
            size: "small",
            color: "warning",
            variant: "elevated",
            prependIcon: "mdi-file-restore-outline",
          },
          click: () => {
            curData.value = v;
            tipDialogTitle.value = "撤销原因";
            dialogHeight.value = 360;
            dialogWidth.value = 600;
            inputText.value = "";
            chooseType.value = undefined;
            tipType.value = "inputRevokeReason";
            showTip.value = true;
          },
        };
        floatBtns.push({
          text: "催签",
          icon: "mdi-bell-ring",
          props: {
            color: "primary",
          },
          click: () => {
            urgeSignFlow(v.signFlowId);
          },
        });
        floatBtns.push({
          text: "复制签署链接",
          icon: "mdi-link",
          props: {
            color: "primary",
          },
          click: () => {
            copySignUrl(v.signFlowId);
          },
        });
      }
    }

    const tplData = templateListData.value.find(
      (tpl: any) => tpl.templateId === v.docTemplateId
    );

    let tagName = tplData ? tplData.typeName : "未知类型";
    let tplName = `${tplData?.title || "未知模板"}` || "未获取到名称";

    let types = ["施工图纸", "选材明细", "变更明细", "变更协议"];
    types.forEach((type) => {
      const reg = new RegExp(`^${type}`);
      if (v.ttContractTitle && reg.test(v.ttContractTitle)) {
        tagName = type;
        tplName = type;
      }
    });

    const tags = [
      {
        text: tagName,
        props: {
          size: "small",
          color: "#3175FB",
          variant: "outlined",
        },
      },
      {
        text: v.signFlow
          ? ["草稿", "签署中", "完成", "撤销", "无", "过期", "无", "拒签"][
          v.signFlow?.signFlowStatus
          ]
          : v.fileStatus === 0
            ? "文件未上传"
            : "未发起",
        props: {
          size: "small",
          class: "text-#fff!",
          color: v.signFlow
            ? [
              "#3175FB",
              "#FF8400",
              "#83C447",
              "#D145FF",
              "#8A8A8A",
              "#8A8A8A",
              "#8A8A8A",
              "#FF5B58",
            ][v.signFlow?.signFlowStatus]
            : v.fileStatus === 0
              ? "#FF5B58"
              : "#FF8400",
          variant: "flat",
        },
      },
    ];

    if (v.signFlow?.rescissionStatus > 0) {
      tags.push({
        text: ["未解约", "解约中", "部分解约", "已解约"][
          v.signFlow?.rescissionStatus
        ],
        props: {
          size: "small",
          color: ["#32ACD4", "#FF9624", "#BD6868", "#EA6A68"][
            v.signFlow?.rescissionStatus
          ],
          class: "text-#fff!",
          variant: "flat",
        },
      });
      if ([1, 2].includes(Number(v.signFlow.rescissionStatus))) {
        btns.push({
          text: "撤销解约签署",
          props: {
            size: "small",
            color: "warning",
            variant: "elevated",
            prependIcon: "mdi-file-restore-outline",
          },
          click: () => {
            curData.value = v;
            tipDialogTitle.value = "撤销原因";
            dialogHeight.value = 360;
            dialogWidth.value = 600;
            inputText.value = "";
            chooseType.value = undefined;
            tipType.value = "inputRevokeReason";
            showTip.value = true;
          },
        });
        floatBtns.push({
          text: "催签",
          icon: "mdi-bell-ring",
          props: {
            color: "primary",
          },
          click: () => {
            urgeSignFlow(v.rescission?.rescissionSignFlowId);
          },
        });
        floatBtns.push({
          text: "复制签署链接",
          icon: "mdi-link",
          props: {
            color: "primary",
          },
          click: () => {
            copySignUrl(v.rescission?.rescissionSignFlowId);
          },
        });
      }
    }

    if (v.signFlow) {
      const isHaveDeleteBtn = floatBtns.find((btn: any) => btn.text === "删除");
      if (isHaveDeleteBtn) {
        floatBtns = floatBtns.filter((btn: any) => btn.text !== "删除");
      }
      if (v.signFlow?.signFlowStatus === 2) {
        // 解约
        if (v.signFlow?.rescissionStatus === 0) {
          floatBtns.push({
            text: "解约",
            icon: "mdi-file-lock-open",
            props: {
              color: "error-0001",
            },
            permission: { COMPLETION_PROCESS_PERMISSIONS: orderData.value.id },
            click: () => {
              curData.value = v;
              tipDialogTitle.value = "解约原因";
              dialogHeight.value = 425;
              dialogWidth.value = 600;
              tipType.value = "inputRescissionReason";
              inputText.value = "";
              chooseType.value = undefined;
              showTip.value = true;
              // curData.value = v;
              // confirmType.value = "rescission";
              // confirmTitle.value = "发起解约";
              // confirmContent.value = `确认发起解约-${
              //   v.ttContractTitle || "未获取到名称"
              // }-吗？`;
              // showConfirm.value = true;
            },
          });
        }
      }
    }

    if (
      curRole.value &&
      !["designer", "superAdmin"].includes(curRole.value.type)
    ) {
      if (curRole.value.type === "finance" || functions.value.includes("order:detail:contract:download")) {
        if (btns.filter((v: any) => v.text.includes("下载")).length > 0) {
          btns = btns.filter((v: any) => v.text.includes("下载"));
        } else {
          btns = [
            {
              text: "暂无可下载文件",
              props: {
                size: "small",
                color: "error-0001",
                variant: "outlined",
                prependIcon: "mdi-download",
              },
            },
          ];
        }
        if (floatBtns.filter((v: any) => v.text.includes("下载")).length > 0) {
          floatBtns = floatBtns.filter((v: any) => v.text.includes("下载"));
        } else {
          floatBtns = [];
        }
      } else {
        floatBtns = [];
        btns = [];
      }
    }

    if (v.fileStatus === 0) {
      floatBtns = [];
      btns = [
        {
          text: "删除重新上传",
          props: {
            size: "small",
            color: "error-0001",
            variant: "outlined",
            prependIcon: "mdi-delete",
          },
          click: () => {
            openDeleteConfirm(v);
          },
        },
      ];
    }

    return {
      header: {
        title: v.ttContractTitle || "未获取到名称",
        titleLine: 3,
        icon: {
          type: "mdi-file-sign",
          size: "22px",
        },
        style: {
          fontSize: "15px",
          color: "#333",
          lineHeight: "18px",
        },
        // tags: [{
        //   // text: ['未启用', '已启用'][v.ttStatus],
        //   // props: {
        //   //   size: 'small',
        //   //   color: ['label-orange', 'label-green'][v.ttStatus],
        //   // },
        // }],
        bg: "#F8F9FA",
        btns: floatBtns,
      },
      padding: [0],
      // bigFont: {
      //   padding: [15, 0],
      //   title: '123',
      //   style: {
      //     fontSize: '36px',
      //     color: '#FF8400',
      //     background: '#F8F9FA',
      //   },
      //   unit: '天',
      //   unitStyle: {
      //     fontSize: '14px',
      //   },
      // },
      tags: {
        padding: [10, 15, 10],
        items: tags,
      },
      list: {
        padding: [0, 10, 10],
        style: {
          color: "#BAC0CD",
          fontSize: "12px",
          lineHeight: "18px",
        },
        items: [
          {
            icon: {
              type: "mdi-file-document-outline",
              size: "14px",
              color: "#BAC0CD",
            },
            text: `合同模板：${tplName}`,
          },
          {
            icon: {
              type: "mdi-clock-time-four-outline",
              size: "14px",
              color: "#BAC0CD",
            },
            text: `创建时间：${v.ttCreateTime}`,
          },
        ],
      },
      btns,
    };
  });
});

const chooseTemplateType = ref(0);
const templateCardData = computed(() => {
  return showTemplateList.value
    .filter((v: any) => {
      if (chooseTemplateType.value === 0) return true;
      return v.houseType === chooseTemplateType.value;
    })
    .map((v: any) => {
      return getCardData(v);
    });
});
function getCardData(v: any) {
  return {
    header: {
      title: v.title || "未获取到名称",
      titleLine: 3,
      icon: {
        type: "mdi-file-sign",
        size: "22px",
      },
      style: {
        fontSize: "15px",
        color: "#333",
        lineHeight: "18px",
      },
      // tags: [{
      //   // text: ['未启用', '已启用'][v.ttStatus],
      //   // props: {
      //   //   size: 'small',
      //   //   color: ['label-orange', 'label-green'][v.ttStatus],
      //   // },
      // }],
      bg: "#F8F9FA",
      btns: [],
    },
    padding: [0],
    // bigFont: {
    //   padding: [15, 0],
    //   title: '123',
    //   style: {
    //     fontSize: '36px',
    //     color: '#FF8400',
    //     background: '#F8F9FA',
    //   },
    //   unit: '天',
    //   unitStyle: {
    //     fontSize: '14px',
    //   },
    // },
    tags: {
      padding: [10, 15, 10],
      items: [
        {
          text: `类型：`,
          props: {
            size: "small",
            color: "#3175FB",
            variant: "text",
            class: "mr-0! pa-0! text-#666! text-14px!",
          },
        },
        {
          text: `${v.typeName}`,
          props: {
            size: "small",
            color: "#3175FB",
            variant: "flat",
          },
        },
      ],
    },
    list: {
      padding: [0, 10, 10],
      style: {
        color: "#BAC0CD",
        fontSize: "12px",
        lineHeight: "18px",
      },
      items: [
        {
          icon: {
            type: "mdi-clock-time-four-outline",
            size: "14px",
            color: "#BAC0CD",
          },
          text: `创建时间：${parseTime(v.createdAt)}`,
        },
        {
          icon: {
            type: "mdi-clock-time-four-outline",
            size: "14px",
            color: "#BAC0CD",
          },
          text: `更新时间：${parseTime(v.updatedAt)}`,
        },
      ],
    },
    btns: [
      (useTemplateIds.value.includes(v.templateId) ||
        useTemplateTypes.value.includes(v.houseType)) && v.houseState2 !== 1 && v.fitUse !== 6
        ? {
          text: "当前模板类型已使用",
          props: {
            size: "small",
            color: "error-0001",
            variant: "outlined",
            prependIcon: "mdi-note-remove-outline",
          },
        }
        : {
          text: "选择",
          props: {
            size: "small",
            color: "primary",
            variant: "outlined",
            prependIcon: "mdi-check",
          },
          click: () => {
            confirmChooseTemplate(v);
          },
          permission: { COMPLETION_PROCESS_PERMISSIONS: orderData.value.id },
        },
    ],
  }
}

// 打印记录
const showChooseTypeRecordList = computed(() => {
  return allMaterialPrintRecordList.value.filter((v: any) => {
    if (chooseShowRecordType.value === "all") return true;
    return v.houseSpace === chooseShowRecordType.value;
  });
});

const printRecordCardListData = computed(() => {
  return showChooseTypeRecordList.value.map((v: any) => {
    const jsonData = JSON.parse(v.data);
    const isMultipleTypes = printTypeList.value
      .filter((t: any) => t.alowMultipleChoose)
      .map((t: any) => t.type);

    let btns = [];
    if (isMultipleTypes.includes(v.houseSpace)) {
      let chooseHouseSpaces = chooseRecords.value.map((r) => r.houseSpace);
      let chooseItemIds = chooseRecords.value.map((r) => r.houseType);
      let isChoose =
        chooseHouseSpaces.includes(v.houseSpace) &&
        chooseItemIds.includes(v.houseType);

      btns = [
        isChoose
          ? {
            text: chooseRecords.value.map((r) => r.id).includes(v.id)
              ? "已选择此记录"
              : "此类型及ID已选择其他记录",
            props: {
              size: "small",
              prependIcon: chooseRecords.value.map((r) => r.id).includes(v.id)
                ? "mdi-check-circle"
                : "mdi-close-circle",
              class: "text-#fff",
              color: chooseRecords.value.map((r) => r.id).includes(v.id)
                ? "success"
                : "gray",
              variant: "elevated",
            },
          }
          : {
            text: "选择此记录PDF",
            props: {
              size: "small",
              prependIcon: "mdi-check",
              class: "text-#fff",
              color: "primary",
              variant: "outlined",
            },
            click: () => {
              if (!v.pdfUrl) {
                errorMessage("未获取到PDF地址");
                return;
              }
              chooseRecords.value.push(v);
            },
          },
      ];
    } else {
      let isChecked = chooseRecords.value.map((r) => r.id).includes(v.id);

      btns = chooseRecords.value.map((r) => r.houseSpace).includes(v.houseSpace)
        ? [
          {
            text: isChecked ? "已选择此记录" : "此类型已选择其他记录",
            props: {
              size: "small",
              prependIcon: isChecked
                ? "mdi-check-circle"
                : "mdi-close-circle",
              class: "text-#fff",
              color: isChecked ? "success" : "gray",
              variant: "elevated",
            },
          },
        ]
        : [
          {
            text: "选择此记录PDF",
            props: {
              size: "small",
              prependIcon: "mdi-check",
              class: "text-#fff",
              color: "primary",
              variant: "outlined",
            },
            click: () => {
              if (!v.pdfUrl) {
                errorMessage("未获取到PDF地址");
                return;
              }
              chooseRecords.value.push(v);
            },
          },
        ];
    }
    let bg = "#F8F9FA";
    return getCardInfo(v, jsonData, bg, btns, {});
  });
});

// 已选记录
const chooseRecordCardListData = computed(() => {
  return chooseRecords.value.map((v: any) => {
    const jsonData = JSON.parse(v.data);

    let btns = [
      {
        text: "取消选择",
        props: {
          size: "small",
          prependIcon: "mdi-close",
          class: "text-#fff",
          color: "error-0001",
          variant: "outlined",
        },
        click: () => {
          chooseRecords.value = chooseRecords.value.filter(
            (r) => r.id !== v.id
          );
        },
      },
    ];
    let bg = "#F8F9FA";
    return getCardInfo(v, jsonData, bg, btns, {
      padding: [10, 10, 0],
      items: [
        {
          text: printTypeList.value.find((t) => t.type === v.houseSpace)?.title,
          props: {
            size: "small",
            color: "#3175FB",
            variant: "elevated",
          },
        },
      ],
    });
  });
});

function getCardInfo(
  v: any,
  jsonData: any,
  bg = "#F8F9FA",
  btns: any,
  tags: any
) {
  return {
    header: {
      title: jsonData.printTitle,
      titleColor: "#424250",
      titleLine: 4,
      style: {
        fontSize: "14px",
        fontWeight: "normal",
        lineHeight: "16px",
      },
      icon: {
        type: "mdi-file-document-outline",
        size: "26px",
      },
      bg,
    },
    padding: [0],
    data: v,
    tags: tags,
    list: {
      padding: [10, 10, 10],
      style: {
        color: "#BAC0CD",
        fontSize: "12px",
        lineHeight: "18px",
      },
      items: [
        {
          icon: {
            type: "mdi-form-select",
            size: "14px",
            color: "#BAC0CD",
          },
          text: `使用模板：${v.configName || "无"}`,
        },
        {
          icon: {
            type: "mdi-clock-time-four-outline",
            size: "14px",
            color: "#BAC0CD",
          },
          text: `导出时间：${jsonData.printTime}`,
        },
        {
          icon: {
            type: "mdi-account-outline",
            size: "14px",
            color: "#BAC0CD",
          },
          text: "操作人：" + (jsonData.adminName || "无"),
        },
      ],
    },
    btns,
  };
}

async function sendSignContractUrl(item: any) {
  // if (!data.docTemplateFillUrl) {
  //   errorMessage('未获取到填写链接')
  //   return
  // }
  // window.open(data.docTemplateFillUrl)
  showLoading();
  const contractInfoRes: any = await getContractInfo({ fileId: item.fileId })
  if (contractInfoRes.code !== 1) {
    return hideLoading()
  }
  const { contractType = 0, supplierContactName, supplierContactPhone, supplierName } = contractInfoRes.data


  const customerAccount = String(orderData.value?.customer?.mobile).replaceAll(
    /[^0-9]/g,
    ""
  )
  let payload = {}
  console.log("sendSignContractUrl...", contractInfoRes, item)
  if (contractType === 1 || contractType === 2) { // 1: 材料合同（三方）签署 2: 材料合同（双方）签署
    const signers: any[] = [
      {
        "signerType": 0,
        "signerRole": "甲方",
        "psnAccount": customerAccount,
        "psnName": orderData.value.customer.name
      },
    ]
    if (contractType === 1) {
      signers.push(
        {
          "signerType": 1,
          "signerRole": "乙方",
          "pagingSeal": true,
          "orgName": supplierName,
          "transactorPsnAccount": supplierContactPhone,
          "transactorPsnName": supplierContactName
        },
        {
          "signerType": -1,
          "signerRole": "丙方",
          "pagingSeal": true
        }
      )
    } else if (contractType === 2) {
      signers.push({
        "signerType": -1,
        "signerRole": "乙方",
        "pagingSeal": true

        // "signerType": 1,
        // "signerRole": "乙方",
        // "pagingSeal": true,
        // "orgName": supplierName,
        // "transactorPsnAccount": supplierContactPhone,
        // "transactorPsnName": supplierContactName
      })
    }
    // 材料买卖｜三方合同 | 变更协议6
    payload = {
      docs: [
        {
          fileId: item.fileId,
        },
      ],
      ttOrderId: String(orderData.value.id),
      signFlowConfig: {
        signFlowTitle: item.ttContractTitle || "未获取到名称",
        // autoFinish: true,
      },
      customerAccount: customerAccount,
      signers
    }
  } else {
    payload = {
      docs: [
        {
          fileId: item.fileId,
        },
      ],
      ttOrderId: String(orderData.value.id),
      initiatePageConfig: {
        uneditableFields: [
          "signFlowTitle",
          "docs",
          "signers",
          "signFields",
          "signFlowExpireTime",
          "copiers",
          "attachments",
        ],
      },
      signFlowConfig: {
        signFlowTitle: item.ttContractTitle || "未获取到名称",
        autoFinish: true,
      },
      customerAccount: customerAccount,
    }
  }

  const res: any = await sendSignFlow(payload);
  if (res.code === 1) {
    // window.open(res.data.signFlowInitiateUrl)
    iframeUrl.value = res.data.signFlowInitiateUrl;
    await nextTick();
    showIframe.value = true;
  } else {
    errorMessage(res.message)
  }
  hideLoading();
}

async function getTemplateList(noLoading?: boolean) {
  if (!noLoading) {
    showLoading();
  }
  const res: any = await recordList({
    page: 1,
    pageSize: 30,
    targetId: orderData.value.companyId,
    type: 40,
  });
  if (!noLoading) {
    hideLoading();
  }

  templateListData.value = res.data?.rows || [];
  templateListData.value = templateListData.value.map((v: any) => {
    const data = JSON.parse(v.data || "{}");
    v.templateId = data.templateId || "";
    return v;
  });
}

async function getUseTemplateList(noLoading?: boolean) {
  if (!noLoading) {
    showLoading();
  }
  const res: any = await contractList({
    sync: 1,
    page: 1,
    pageSize: 30,
    ttOrderId: orderData.value.id,
  });
  if (!noLoading) {
    hideLoading();
  }

  contractListData.value = res.data?.rows || [];
}

async function getTasks(noLoading?: boolean) {
  if (!noLoading) {
    showLoading();
  }
  const res: any = await taskList({
    page: 1,
    limit: 100,
    taskType: 9,
    type: "task",
    associationId: orderData.value.id,
    dataType: "allAssociationIdTask",
  });
  if (!noLoading) {
    hideLoading();
  }

  taskListData.value = res.data?.rows || [];
  taskListData.value = taskListData.value.sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

async function getContractDetail(id: string) {
  showLoading();
  const res: any = await contractDetail({
    id,
  });
  hideLoading();

  if (res.code === 1 && res.data.fileDownloadUrl)
    window.open(res.data.fileDownloadUrl);
  else errorMessage(res.message || "获取文件失败");
}

async function downLoadSignPDF(item: any) {
  if (!item.signFlowId) {
    errorMessage("未获取到签署ID");
    return;
  }
  showLoading();
  const res: any = await downloadContractFile({
    id: item.signFlowId,
  });
  hideLoading();
  if (res.code === 1 && res.data.files.length > 0)
    window.open(res.data.files[0]?.downloadUrl);
  else errorMessage(res.message || "获取文件失败");
}

async function downloadRescissionPDF(d: any) {
  if (!d.rescissionSignFlowId) {
    errorMessage("未获取到解约文件ID");
    return;
  }
  showLoading();
  const res: any = await downloadContractFile({
    id: d.rescissionSignFlowId,
  });
  hideLoading();
  if (res.code === 1 && res.data.files.length > 0)
    window.open(res.data.files[0]?.downloadUrl);
  else errorMessage(res.message || "获取文件失败");
}

async function urgeSignFlow(id: string) {
  if (!id) {
    errorMessage("未获取到签署ID");
    return;
  }
  showLoading();
  const res: any = await urgeSign({
    id,
  });
  hideLoading();
  if (res.code === 1) {
    successMessage("催签成功");
  } else {
    errorMessage(res.message || "催签失败");
  }
}

async function copySignUrl(id: string) {
  if (!id) {
    errorMessage("未获取到签署ID");
    return;
  }
  showLoading();
  const res: any = await getSignUrl({
    id,
  });
  hideLoading();
  if (res.code === 1) {
    copyText(res.data.shortUrl);
    successMessage("复制成功");
  } else {
    errorMessage(res.message || "复制失败");
  }
}


async function init() {
  showLoading();
  let tasks = [];
  // await getTemplateList();
  // await getUseTemplateList();
  // await getTasks(true);
  tasks.push(getTemplateList(true));
  tasks.push(getUseTemplateList(true));
  tasks.push(getTasks(true));
  await Promise.all(tasks);
  hideLoading();
}

function openChooseTemplate() {
  chooseTemplateDialogVisible.value = true;
}

function confirmChooseTemplate(tpl: any) {
  chooseTemplate.value = tpl;
  if (tpl.fitUse === 1) {
    chooseTemplateDialogVisible.value = false;
  } else if ([2, 3].includes(tpl.fitUse)) {
    chooseMaterialTemplateDialogVisible.value = false;
  } else if ([6].includes(tpl.fitUse)) {
    chooseChangeMaterDialogVisible.value = false;
  }
  confirmType.value = "chooseTemplate";
  confirmTitle.value = "确认选择模板";
  confirmContent.value = `确认选择模板-${tpl.title}-吗？`;
  showConfirm.value = true;
}

function openDeleteConfirm(contractFile: any) {
  chooseContractFile.value = contractFile;
  confirmType.value = "deleteContractFile";
  confirmTitle.value = "确认删除";
  confirmContent.value = `确认删除文件-${contractFile.ttContractTitle || "未获取到名称"
    }-吗？`;
  showConfirm.value = true;
}

function handleConfirm() {
  console.log("handleConfirm...")
  showConfirm.value = false;
  if (confirmType.value === "chooseTemplate") handleChooseTemplate();
  else if (confirmType.value === "deleteContractFile")
    handleDeleteContractFile();
  else if (confirmType.value === "rescission") handleRescission();
  else if (confirmType.value === "revoke") handleRevoke();
  else if (confirmType.value === "createPDF") handleCreatePDF();
  else if (confirmType.value === "mergePDF") {
    (window as any).$wujie?.bus.$emit(
      "handleCreateContractTemplateFilePDF",
      chooseImages.value,
      getMergePdfFile
    );
  }
}

function handleTipConfirm() {
  if (tipType.value === "inputRevokeReason") {
    if (!inputText.value) {
      errorMessage("请输入撤销原因");
      return;
    }
    confirmType.value = "revoke";
    confirmTitle.value = "确认撤销";
    confirmContent.value = `确认撤销签署-${curData.value.ttContractTitle || "未获取到名称"
      }-吗？`;
    showConfirm.value = true;
    showTip.value = false;
  } else if (tipType.value === "inputRescissionReason") {
    if (!chooseType.value) {
      errorMessage("请选择解约原因");
      return;
    }
    if (!inputText.value) {
      errorMessage("请输入解约原因说明");
      return;
    }
    showTip.value = false;
    confirmType.value = "rescission";
    confirmTitle.value = "确认解约";
    confirmContent.value = `确认解约签署-${curData.value.ttContractTitle || "未获取到名称"
      }-吗？`;
    showConfirm.value = true;
  } else if (tipType.value === "showReason") {
    showTip.value = false;
  }
}

async function handleRescission() {
  if (!curData.value) {
    errorMessage("未获取到数据");
    return;
  }
  if (!orderData.value?.customer?.designerMobile) {
    errorMessage("未获取到设计师手机号");
    return;
  }
  // if (!inputText.value) {
  //   errorMessage("请输入解约原因");
  //   return;
  // }
  showLoading();
  const res: any = await terminateContractFile({
    id: curData.value.signFlowId,
    // transactor: String(orderData.value?.customer?.mobile).replaceAll(
    //   /[^0-9]/g,
    //   ""
    // ),
    transactor: orderData.value?.customer?.designerMobile,
    rescindReason: String(chooseType.value),
    rescindReasonNotes: inputText.value || "无",
    ttExtra: {
      orderId: orderData.value.id || "无",
      orderNumber: orderData.value.number,
      customerName: orderData.value?.customer?.name || "无",
      customerMobile: orderData.value?.customer?.mobile || "无",
      designerName: orderData.value?.customer?.designerName || "无",
      designerMobile: orderData.value?.customer?.designerMobile || "无",
      // rescissionReason: inputText.value,
    },
  });
  setTimeout(() => {
    hideLoading();

    if (res.code === 1) {
      successMessage("发起解约成功");
      getUseTemplateList();
      // iframeUrl.value = res.data.rescissionUrl;
      // await nextTick();
      // showIframe.value = true;
    } else {
      errorMessage(res.message);
    }
  }, 2000);
}

async function handleRevoke() {
  if (!curData.value) {
    errorMessage("未获取到数据");
    return;
  }
  if (!inputText.value) {
    errorMessage("请输入撤销原因");
    return;
  }
  showLoading();
  const res: any = await revokeSignFlow({
    id: curData.value.rescissionSignFlowId
      ? curData.value.rescissionSignFlowId
      : curData.value.signFlowId,
    revokeReason: inputText.value || "无",
  });
  hideLoading();

  if (res.code === 1) {
    successMessage("撤销成功");
    getUseTemplateList();
  } else {
    errorMessage(res.message);
  }
}

const materialContractTemplateFormDialogRef = ref<InstanceType<typeof MaterialContractTemplateFormDialog>>()
const changeContractTemplateFormDialogRef = ref<InstanceType<typeof ChangeContractTemplateFormDialog>>()
async function handleChooseTemplate() {
  if (!chooseTemplate.value) {
    errorMessage("请选择模板");
    return;
  }
  if (!chooseTemplate.value.templateId) {
    errorMessage("模板ID不存在");
    return;
  }
  if (!chooseTemplate.value.houseSpace) {
    errorMessage("未获取模版数据接口");
    return;
  }

  if ([2, 3].includes(+chooseTemplate.value.fitUse)) {
    // 三方协议 要先选择 已收款的 套外或者增项物料（同时只能选择一家供应商的物料！！！）
    materialContractTemplateFormDialogRef.value?.Open({ templateId: chooseTemplate.value.templateId, templateName: chooseTemplate.value.title, flowId: chooseTemplate.value.houseSpace, contractType: ({ 2: 1, 3: 2 }[+chooseTemplate.value.fitUse]) as 1 | 2 })
  } else if ([6].includes(+chooseTemplate.value.fitUse)) {
    changeContractTemplateFormDialogRef.value?.Open({
      templateId: chooseTemplate.value.templateId,
      templateName: chooseTemplate.value.title,
      flowId: chooseTemplate.value.houseSpace
    });
  } else {
    showLoading();
    const data: any = {
      flowId: chooseTemplate.value.houseSpace,
      orderId: orderData.value.id,
    }

    const getDataRes: any = await runFlow(data);
    if (getDataRes.code === 1) {
      // const componentDataList = []
      // for (const k of Object.keys(getDataRes.data)) {
      //   componentDataList.push({
      //     componentKey: k,
      //     componentValue: getDataRes.data[k],
      //   })
      // }
      await openFilledContract(getDataRes.data)
    } else {
      hideLoading();
      errorMessage(getDataRes.message);
    }
  }
}

/**
 * 使用数据回填模版信息
 */
async function openFilledContract(fillData: any) {
  const res: any = await getFillUrl({
    id: chooseTemplate.value.templateId,
    docTemplateId: chooseTemplate.value.templateId,
    ttOrderId: String(orderData.value.id),
    ttContractTitle: `${chooseTemplate.value.title}-${orderData.value.number
      }-${orderData.value?.customer?.name}-${parseTime(
        new Date(),
        "{y}-{m}-{d}"
      )}`,
    ttContractNo: orderData.value.number,
    ttFillingValues: fillData,
  });
  if (res.code === 1) {
    // window.open(res.data.docTemplateFillUrl)
    iframeUrl.value = res.data.docTemplateFillUrl;
    await nextTick();
    showIframe.value = true;
    // const createRes: any = await createRecord({
    //   type: 41,
    //   title: `${chooseTemplate.value.title}-${parseTime(new Date())}`,
    //   targetId: orderData.value.id,
    //   data: JSON.stringify(res.data),
    // })
    // hideLoading()
    // if (createRes.code === 1) {
    //   successMessage('模板创建成功，请正确填写合同内容并提交')
    //   getUseTemplateList()
    // }
  } else {
    hideLoading();
    errorMessage(res.message);
  }
}

async function handleDeleteContractFile() {
  if (!chooseContractFile.value) {
    errorMessage("请选择文件");
    return;
  }
  if (!chooseContractFile.value.fileId) {
    errorMessage("文件ID不存在");
    return;
  }
  showLoading();
  const res: any = await deleteContractFile({
    id: chooseContractFile.value.fileId,
  });
  hideLoading();
  if (res.code === 1) {
    successMessage("删除成功");
    getUseTemplateList();
  } else {
    errorMessage(res.message);
  }
}

function checkReason(title: string, text: string) {
  tipDialogTitle.value = title;
  dialogHeight.value = 400;
  dialogWidth.value = 600;
  tipType.value = "showReason";
  tipContent.value = text;
  showTip.value = true;
}

async function initContractTasks() {
  await getTasks();
}

function openWorkflowPanel(item: any) {
  (window as any).$wujie?.bus.$emit("openContractSendWorkflow", item);
}

function openChooseFile() {
  showChooseTemplate.value = true;
}

async function handleChooseTemplateType(chooseConfig: any) {
  if (!chooseConfig.coverConfig || !chooseConfig.coverConfig.url) {
    errorMessage("未获取到当前类型图纸的封面配置，请联系管理员");
    return;
  }
  const chooseName = chooseConfig.name;
  chooseTemplateConfig.value = chooseConfig;
  chooseCoverConfig.value = chooseConfig.coverConfig || {};
  // 查询已创建合同，是否包含施工图纸
  const reg = new RegExp(`^${chooseName}`);
  const chooseTemplates = contractListData.value.filter((v: any) => {
    return v.ttContractTitle && reg.test(v.ttContractTitle);
  });

  // 材料买卖合同
  const isType3 = chooseConfig.type === 3
  //变更明细合同
  const isType4 = chooseConfig.type === 4
  if (
    !isType3 && !isType4 &&
    chooseTemplates.filter(
      (v: any) =>
        v.signFlow?.signFlowStatus === 2 && v.signFlow?.rescissionStatus !== 3
    ).length > 0
  ) {
    errorMessage(`${chooseName}已签署完成，请解约完成后再进行创建`);
    return;
  }

  if (!isType3 && !isType4 && chooseTemplates.filter((v: any) => !v.signFlow).length > 0) {
    errorMessage(`有${chooseName}已创建未发起，请删除后再进行创建`);
    return;
  }

  if (
    !isType3 && !isType4 && chooseTemplates.filter((v: any) => v.signFlow?.signFlowStatus === 1)
      .length > 0
  ) {
    errorMessage(`有${chooseName}已发起签署，请等待签署完成后再进行创建`);
    return;
  }

  if (!orderData.value?.customer?.id) {
    errorMessage("未获取到客户信息");
    return;
  }
  if (!orderData.value.companyId) {
    errorMessage("未获取到公司信息");
    return;
  }
  showChooseTemplate.value = false;
  if (chooseName === "施工图纸") {
    showLoading();
    const fileRes: any = await filerelList({
      page: 1,
      limit: 100,
      type: "1,2",
      targetId: orderData.value.customer.id,
    });
    hideLoading();
    if (fileRes.code === 1) {
      files.value = fileRes.data?.rows || [];
    } else {
      files.value = [];
      errorMessage(fileRes.message);
    }
    showChooseFiles.value = true;
  } else if (chooseName === "选材明细") {
    showLoading();
    let res: any = await recordList({
      page: 1,
      limit: 100,
      type: 46,
      houseSpace: printTypeList.value.map((v: any) => v.type).join(","),
      targetId: orderData.value.id,
    });

    hideLoading();

    allMaterialPrintRecordList.value = res.data?.rows || [];
    chooseRecords.value = [];
    chooseShowRecordType.value = printTypeList.value[0]?.type;

    showChoosePrintRecord.value = true;
  } else if (chooseName === "材料买卖") {
    chooseMaterialTemplateDialogVisible.value = true
  } else if (chooseName === "变更明细") {
    chooseChangeMaterDialogVisible.value = true
  }
}
const chooseMaterialTemplateDialogVisible = ref(false)
const chooseChangeMaterDialogVisible = ref(false)
async function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function getPdfName() {
  return `${chooseTemplateConfig.value.name}-${orderData.value.number
    }-${parseTime(new Date(), "{y}-{m}-{d}-{h}-{i}-{s}")}`;
}

async function handleChooseFile(file: any) {
  console.log("handleChooseFile...", file)
  showLoading();
  await sleep(50);
  showChooseFiles.value = false;
  let url: string = (await getCoverImage(
    chooseCoverConfig.value?.url
  )) as any;
  console.log("url....0", chooseCoverConfig.value?.url)
  const detailRes = await fetchTemplateUrl();
  console.log("url....1", detailRes.data.fileDownloadUrl)
  url = detailRes.data.fileDownloadUrl
  // url = getContractFilePdf(detailRes.data.fileDownloadUrl) as any;
  if (file.type === 2) {
    if (file.imgs.length === 0) {
      hideLoading();
      errorMessage("图片组内无图片");
      return;
    }
    chooseImages.value = file.imgs;
    // chooseImages.value按name排序，以数字开头或者结尾，按数字排序
    if (/^\d/.test(file.imgs[0].name)) {
      chooseImages.value = chooseImages.value.sort((a: any, b: any) => {
        return (
          Number(a.name.match(/^\d+/) && a.name.match(/^\d+/)[0]) -
          Number(b.name.match(/^\d+/) && b.name.match(/^\d+/)[0])
        );
      });
    }
    // 图片名字，如果有后缀，去掉后缀后以数字结尾，按数字排序
    else if (
      /\.\w+$/.test(file.imgs[0].name) &&
      /\d+\.\w+$/.test(file.imgs[0].name)
    ) {
      chooseImages.value = chooseImages.value.sort((a: any, b: any) => {
        return (
          Number(a.name.match(/\d+\.\w+$/)?.[0]?.match(/\d+/)?.[0] || 0) -
          Number(b.name.match(/\d+\.\w+$/)?.[0]?.match(/\d+/)?.[0] || 0)
        );
      });
    }

    chooseImages.value.unshift({
      id: 0,
      url: url,
    });
    chooseImages.value[0].url = url;
    checkImage.value = chooseImages.value[0];
    showImagesListType.value = "list";
    loadImageCount.value = 0;
    showImages.value = true;
  } else if (file.type === 1) {
    if (!file.fileUrl) {
      hideLoading();
      errorMessage("未获取到PDF文件，请确认已经上传");
      return;
    }
    // 通过链接下载pdf
    let res: any = {};
    let uint8Array: Uint8Array = new Uint8Array();
    if (file.fileUrl.startsWith("https")) {
      const tokenInfo: any = await getOssToken();

      if (!tokenInfo?.data?.stsToken) {
        errorMessage("获取oss token失败");
        hideLoading();
        return;
      }
      res = await downloadFileFromOss(tokenInfo, file.fileUrl);
      if (!res?.content) {
        errorMessage("获取PDF文件失败");
        hideLoading();
        return;
      }
      uint8Array = res.content as Uint8Array;
    } else {
      res = await downloadFileByUrl(file.fileUrl);
      // 将 Blob 转换为 Uint8Array
      const arrayBuffer = await res.arrayBuffer();
      uint8Array = new Uint8Array(arrayBuffer);
    }
    const pdfDoc = await PDFDocument.load(uint8Array);

    // 每页都校验是否是横向，如果有横向，返回错误，提示用户重新上传，宽高比为1.3-1.5
    let isError = false;
    for (const page of pdfDoc.getPages()) {
      let { width, height } = page.getSize();
      const rotationAngle = page.getRotation().angle;
      if (rotationAngle === 90 || rotationAngle === 270) {
        [width, height] = [height, width];
      }
      if (width < height) {
        // ctx.helper.error(ctx, 0, 'PDF图纸不支持竖向页面，导出时可旋转为横向，请检查并重新上传');
        errorMessage(
          "PDF图纸不支持竖向页面，导出时可旋转为横向，请检查并重新上传"
        );
        isError = true;
        break;
      }
      if (width / height < 1.3 || width / height > 1.5) {
        // ctx.helper.error(ctx, 0, 'PDF图纸宽高比不符合要求，导出时可旋转为横向，请检查并重新上传');
        errorMessage(
          "PDF图纸宽高比不符合要求，导出时可旋转为横向，请检查并重新上传"
        );
        isError = true;
        break;
      }
    }

    if (isError) {
      hideLoading();
      return;
    }

    const firstPage = pdfDoc.getPages()[0];
    let { width, height } = firstPage.getSize();
    const rotationAngle = firstPage.getRotation().angle;
    if (rotationAngle === 90 || rotationAngle === 270) {
      [width, height] = [height, width];
    }

    // Create a new page to first page of PDF
    const newPage = pdfDoc.insertPage(0);
    newPage.setWidth(width);
    newPage.setHeight(height);

    // Draw uploadImage to first page of PDF
    // 添加imageData jpg到pdf
    // const uploadImage = await pdfDoc.embedPng(body.imageData);
    const uploadImage = await pdfDoc.embedJpg(url);
    newPage.drawImage(uploadImage, {
      x: 0,
      y: 0,
      width,
      height,
    });

    // 转成文件流
    const pdfBytes = await pdfDoc.save();
    uint8ArrayData.value = pdfBytes;
    gFile.value = new File([pdfBytes], `${getPdfName()}.pdf`, {
      type: "application/pdf",
    });

    hideLoading();
    confirmType.value = "createPDF";
    confirmTitle.value = "确认创建";
    confirmContent.value = `确认选择-${files.value.find((v: any) => v.id === file.id)?.name || "未获取到名称"
      }-创建施工图纸模板文件吗？`;
    showConfirm.value = true;
  }
}

function getCoverImage(src: string) {
  return new Promise((resolve, reject) => {
    // 使用canvas合成图片，获取地址
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = src;
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx!.drawImage(img, 0, 0);

      const textConfig = chooseCoverConfig.value?.textConfig || [];

      ctx!.fillStyle = textConfig.color || "#000";
      ctx!.font = `${canvas.width / (textConfig.fontScale || 80)}px Arial`;
      // 字体基线为底部
      ctx!.textBaseline = textConfig.textBaseline || "bottom";
      // ctx!.fillText("左上", 0, 0);
      // ctx!.fillText("左下", 0, canvas.height - 30);
      // ctx!.fillText("右上", canvas.width - 30, 0);
      // ctx!.fillText("右下", canvas.width - 30, canvas.height - 30);
      // const url = canvas.toDataURL("image/png");

      const texts = textConfig.fillTexts || [];
      for (const text of texts) {
        ctx!.fillText(
          text.text,
          canvas.width * (text.x || 0.5),
          canvas.height * (text.y || 0.5)
        );
      }

      const url = canvas.toDataURL("image/jpeg", 0.8);
      resolve(url);
    };
  });
}

//禁止拖动到id为0的对象
function onMove(e: any) {
  if (e.relatedContext.element.id === 0) return false;
  return true;
}

function openConfirmMergePDF() {
  confirmType.value = "mergePDF";
  confirmTitle.value = "确认合并";
  confirmContent.value = `确认合并${chooseImages.value.length}张图片吗？`;
  showConfirm.value = true;
}

async function getMergePdfFile(pdfData: any) {
  const { file } = pdfData;

  // 检查pdf文件大小，不超过30M
  if (file.size > 30 * 1024 * 1024) {
    errorMessage(
      "文件大小超过系统限制30M，请检查图片组图片大小，尽量每张图片不超过1M"
    );
    return;
  }
  // uint8ArrayData.value = blob;
  // 下载文件

  showLoading();
  (window as any).$wujie?.bus.$emit(
    "zhqUploadFile",
    {
      file,
      type: 18,
      name: file.name,
      targetId: orderData.value.id,
      otherData: {
        fileName: getPdfName(),
        ttOrderId: orderData.value.id,
        ttContractNo: orderData.value.number,
        ttContractTitle: file.name.slice(0, file.name.lastIndexOf(".")),
      },
    },
    (res: any) => {
      hideLoading();
      if (res.code === 1) {
        successMessage("模板创建成功");
        showImages.value = false;
        getUseTemplateList();
        // uploadFileToEsign(file, res.data);
      } else {
        errorMessage(res.message || "模板创建成功");
      }
    }
  );
}

async function handleCreatePDF() {
  showLoading();
  // const res: any = await addCover({
  //   fileId: curHandleParams.value.fileId,
  //   name: `施工图纸-${orderData.value.number}-${
  //     orderData.value.customer?.name || "无"
  //   }-${parseTime(new Date(), "{y}-{m}-{d}")}`,
  //   targetId: orderData.value.id,
  //   number: orderData.value.number,
  //   imageData: curHandleParams.value.url,
  // });
  // hideLoading();
  // if (res.code === 1) {
  //   successMessage("模板创建成功");
  //   getUseTemplateList();
  // } else {
  //   errorMessage(res.message || "模板创建成功");
  // }
  const params: any = {};
  if (chooseCoverConfig.value?.templateId) {
    params.useTemplate = 1;
    params.docTemplateId = chooseCoverConfig.value.templateId
  }

  (window as any).$wujie?.bus.$emit(
    "zhqUploadFile",
    {
      file: gFile.value,
      type: 18,
      name: gFile.value.name,
      targetId: orderData.value.id,
      otherData: {
        fileName: getPdfName(),
        ttOrderId: orderData.value.id,
        ttContractNo: orderData.value.number,
        ttContractTitle: gFile.value.name.slice(
          0,
          gFile.value.name.lastIndexOf(".")
        ),
        ...params
      },
    },
    (res: any) => {
      hideLoading();
      if (res.code === 1) {
        successMessage("模板创建成功");
        showImages.value = false;
        getUseTemplateList();
        // uploadFileToEsign(gFile.value, res.data);
      } else {
        errorMessage(res.message || "模板创建成功");
      }
    }
  );
}

// 上传文件到E签宝
// async function uploadFileToEsign(file: any, data: any) {
//   showLoading();
//   const getUploadUrlRes: any = await getUploadUrl({
//     fileName: file.name,
//     fileSize: data.fileSize,
//     contentMd5: data.md5,
//     ttOrderId: orderData.value.id,
//     ttContractNo: orderData.value.number,
//     ttContractTitle: file.name.slice(0, file.name.lastIndexOf(".")),
//   });

//   if (getUploadUrlRes.code === 1 && getUploadUrlRes.data.fileUploadUrl) {
//     console.log("uint8ArrayData.valueuint8ArrayData.valueuint8ArrayData.value", uint8ArrayData.value);
//     // var data = uint8ArrayData.value;
//     // let formData = new FormData();
//     // formData.append('file', gFile.value);

//     const fileReader = new FileReader();
//     fileReader.readAsArrayBuffer(gFile.value);

//     fileReader.onloadend = async (e: any) => {
//       var xhr = new XMLHttpRequest();

//       xhr.addEventListener("readystatechange", function() {
//         if(this.readyState === 4) {
//           console.log(this.responseText);
//         }
//       });

//       xhr.open("PUT", getUploadUrlRes.data.fileUploadUrl, true);
//       xhr.setRequestHeader("Content-MD5", data.md5);
//       xhr.setRequestHeader("Content-Type", "application/pdf");

//       // xhr.sendAsBinary(fileReader.result);
//       xhr.send(fileReader.result);

//     };

//     // const uploadRes: any = await uploadFile(getUploadUrlRes.data.fileUploadUrl, {
//     //   // file: uint8ArrayData.value,
//     //   file: gFile.value,
//     //   md5: data.md5,
//     // });
//     // console.log("uploadRes", uploadRes);
//     // if (uploadRes.errCode === 0) {
//     //   successMessage("模板创建成功");
//     //   showImages.value = false;
//     //   getUseTemplateList(true);
//     // } else {
//     //   hideLoading();
//     //   errorMessage(uploadRes.msg || "上传文件失败");
//     //   return;
//     // }
//   } else {
//     hideLoading();
//     errorMessage(getUploadUrlRes.message || "获取上传地址失败");
//     return;
//   }

//   // const res: any = await uploadFile({
//   //   file,
//   //   type: 18,
//   //   name: file.name,
//   //   targetId: orderData.value.id,
//   //   otherData: {
//   //     fileName: `施工图纸-${orderData.value.number}`,
//   //     ttOrderId: orderData.value.id,
//   //     ttContractNo: orderData.value.number,
//   //     ttContractTitle: file.name.slice(0, file.name.lastIndexOf(".")),
//   //   },
//   // });
//   // hideLoading();
//   // if (res.code === 1) {
//   //   successMessage("模板创建成功");
//   //   showImages.value = false;
//   //   getUseTemplateList(true);
//   // } else {
//   //   errorMessage(res.message || "模板创建成功");
//   // }
// }

// 打印相关，选材明细模板
function handleChooseShowRecordType(d: any) {
  if (!d) return;
  if (d.type === chooseShowRecordType.value) return;
  chooseShowRecordType.value = d.type;
}

async function handleChoosePrintRecord() {
  if (chooseRecords.value.length === 0) {
    errorMessage("请选择要生成合同模版的选材明细PDF");
    return;
  }
  console.log("handleChoosePrintRecord...")
  // 检查是否有配置合同模板ID
  if (chooseCoverConfig.value?.templateId) {
    // 有合同模板ID，需要先创建合同再合成
    await handleChoosePrintRecordWithContract();
    return;
  }

  if (chooseTemplateConfig.value?.mergetSortTypes) {
    chooseRecords.value = chooseRecords.value.sort((a: any, b: any) => {
      return (
        chooseTemplateConfig.value?.mergetSortTypes.indexOf(a.houseSpace) -
        chooseTemplateConfig.value?.mergetSortTypes.indexOf(b.houseSpace)
      );
    });
  }

  const mergerPdf = await PDFDocument.create();
  showLoading();
  let tokenInfo: any = {};

  if (chooseRecords.value.filter((v: any) => !v.pdfUrl).length > 0) {
    errorMessage("未获取到PDF文件");
    hideLoading();
    return;
  }
  if (
    chooseRecords.value.filter((v: any) => v.pdfUrl.startsWith("https"))
      .length > 0
  ) {
    tokenInfo = await getOssToken();

    if (!tokenInfo?.data?.stsToken) {
      errorMessage("获取oss token失败");
      hideLoading();
      return;
    }
  }
  let pdfTasks: any = [];
  for (const record of chooseRecords.value) {
    pdfTasks.push(getPdfUnitArray(record.pdfUrl, tokenInfo));
  }
  const pdfUnitArray = await Promise.all(pdfTasks);

  if (pdfUnitArray.length === 0) {
    hideLoading();
    errorMessage("未获取到PDF文件");
    return;
  }

  for (const pdfUnit of pdfUnitArray) {
    const pdfDoc = await PDFDocument.load(pdfUnit);
    const copiedPages = await mergerPdf.copyPages(
      pdfDoc,
      pdfDoc.getPageIndices()
    );
    copiedPages.forEach((page) => {
      mergerPdf.addPage(page);
    });
  }

  const url = (await getCoverImage(chooseCoverConfig.value?.url)) as any;

  const firstPage = mergerPdf.getPages()[0];
  let { width, height } = firstPage.getSize();
  const rotationAngle = firstPage.getRotation().angle;
  if (rotationAngle === 90 || rotationAngle === 270) {
    [width, height] = [height, width];
  }

  // Create a new page to first page of PDF
  const newPage = mergerPdf.insertPage(0);
  newPage.setWidth(width);
  newPage.setHeight(height);

  // Draw uploadImage to first page of PDF
  // 添加imageData jpg到pdf
  // const uploadImage = await pdfDoc.embedPng(body.imageData);
  const uploadImage = await mergerPdf.embedJpg(url);
  newPage.drawImage(uploadImage, {
    x: 0,
    y: 0,
    width,
    height,
  });

  // 转成文件流
  const pdfBytes = await mergerPdf.save();
  uint8ArrayData.value = pdfBytes;
  gFile.value = new File([pdfBytes], `${getPdfName()}.pdf`, {
    type: "application/pdf",
  });

  hideLoading();
  showChoosePrintRecord.value = false;
  confirmType.value = "createPDF";
  confirmTitle.value = "确认创建";
  confirmContent.value = `确认创建选材明细合同模板文件吗？`;
  showConfirm.value = true;
}

async function fetchTemplateUrl() {
  const fileName = `${chooseTemplateConfig.value.name}-${
      orderData.value.number
    }-${orderData.value.customer?.name || "无"}-${parseTime(
      new Date(),
      "{y}-{m}-{d}"
    )}`;

    const payload: Parameters<typeof createContract>[0] = {
      docTemplateId: chooseCoverConfig.value.templateId,
      ttContractTitle: fileName,
      fileName,
      components: [
        {
          componentKey: "address",
          componentValue: orderData.value.customer?.address,
        },
        {
          componentKey: "number",
          componentValue: orderData.value.number,
        },
      ], // 这里可能需要根据模板配置来填充
      ttCustomerId: `${orderData.value.customer?.id}`,
      ttOrderId: `${orderData.value.id}`,
      ttContractNo: orderData.value.number,
    };

    const createRes = await (createContract(payload) as Promise<TResponse>);

    if (createRes.code !== 1) {
      errorMessage(`创建合同失败：${createRes.message}`);
      hideLoading();
      return;
    }

    const contractFileId = createRes.data.fileId;

    // 步骤2：获取合同PDF
    const detailRes: any = (await contractDetail({
      id: contractFileId,
    })) as Promise<TResponse>;
    return detailRes
}
// 新增：处理有合同模板的情况
async function handleChoosePrintRecordWithContract() {
  showLoading({
    title: "正在创建合同，请稍后…",
    tip: "合同创建中",
    type: "progress",
  });

  try {
    // 步骤1：创建合同
    updateLoadingState({
      percent: 10,
      title: "正在创建合同，请稍后…",
      tip: "合同创建中",
    });

    const fileName = `${chooseTemplateConfig.value.name}-${
      orderData.value.number
    }-${orderData.value.customer?.name || "无"}-${parseTime(
      new Date(),
      "{y}-{m}-{d}"
    )}`;

    const payload: Parameters<typeof createContract>[0] = {
      docTemplateId: chooseCoverConfig.value.templateId,
      ttContractTitle: fileName,
      fileName,
      components: [
        {
          componentKey: "address",
          componentValue: orderData.value.customer?.address,
        },
        {
          componentKey: "number",
          componentValue: orderData.value.number,
        },
      ], // 这里可能需要根据模板配置来填充
      ttCustomerId: `${orderData.value.customer?.id}`,
      ttOrderId: `${orderData.value.id}`,
      ttContractNo: orderData.value.number
    };

    const createRes = await (createContract(payload) as Promise<TResponse>);

    if (createRes.code !== 1) {
      errorMessage(`创建合同失败：${createRes.message}`);
      hideLoading();
      return;
    }

    const contractFileId = createRes.data.fileId;

    updateLoadingState({
      percent: 30,
      title: "正在获取合同文件，请稍后…",
      tip: "合同创建完成",
    });
    // 步骤2：获取合同PDF
    const detailRes: any = (await contractDetail({
      id: contractFileId,
    })) as Promise<TResponse>;
    if (detailRes.code !== 1) {
      errorMessage(`获取合同文件失败：${detailRes.message}`);
      await deleteContractFile({ id: contractFileId });
      hideLoading();
      return;
    }

    updateLoadingState({
      percent: 50,
      title: "正在合成最终文件，请稍后…",
      tip: "合同文件获取完成",
    });
    // 步骤3：合成合同PDF和明细PDF
    const finalPdf = await mergeContractWithDetails(
      detailRes.data.fileDownloadUrl
    );

    updateLoadingState({
      percent: 80,
      title: "正在上传文件，请稍后…",
      tip: "文件合成完成",
    });
    // 步骤4：上传最终文件
    gFile.value = new File([finalPdf], `${getPdfName()}.pdf`, {
      type: "application/pdf",
    });

    await handleCreatePDF();

    updateLoadingState({
      percent: 95,
      title: "正在清理临时文件，请稍后…",
      tip: "文件上传完成",
    });
    // 步骤5：清理临时合同文件
    await deleteContractFile({ id: contractFileId });

    updateLoadingState({
      percent: 100,
      title: "完成",
      tip: "任务完成",
    });
    setTimeout(() => {
      successMessage("合同创建成功");
      showChoosePrintRecord.value = false;
      getUseTemplateList();
      hideLoading();
    }, 100);
  } catch (error: any) {
    errorMessage(`任务执行失败：${error.message}`);
    hideLoading();
  }
}
/**
 * 下载 合同 pdf文件
 * @param url
 */
async function getContractFilePdf(url: string) {
  try {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    throw new Error("加载E签宝合同文件失败了！");
  }
}
// 新增：合成合同PDF和明细PDF
async function mergeContractWithDetails(
  contractPdfUrl: string
): Promise<Uint8Array> {
  const mergerPdf = await PDFDocument.create();

  const pdfTasks: any = [];
  // 获取合同PDF
  pdfTasks.push(getContractFilePdf(contractPdfUrl));

  // 获取明细PDF
  if (chooseRecords.value.filter((v: any) => !v.pdfUrl).length > 0) {
    throw new Error("未获取到明细PDF文件");
  }

  console.log("chooseRecords", chooseRecords.value);
  for (const record of chooseRecords.value) {
    pdfTasks.push(getContractFilePdf(record.pdfUrl));
  }
  const pdfUnitArray = await Promise.all(pdfTasks);

  if (pdfUnitArray.length === 0) {
    throw new Error("未获取到明细PDF文件");
  }

  // 添加明细PDF页面
  for (const pdfUnit of pdfUnitArray) {
    const pdfDoc = await PDFDocument.load(pdfUnit);
    const copiedPages = await mergerPdf.copyPages(
      pdfDoc,
      pdfDoc.getPageIndices()
    );
    copiedPages.forEach((page) => {
      mergerPdf.addPage(page);
    });
  }

  return await mergerPdf.save();
}
//
async function handleChoosePrintChangeRecord() {
  if (chooseRecords.value.length === 0) {
    errorMessage("请选择要生成合同模版的选材明细PDF");
    return;
  }

  if (chooseTemplateConfig.value?.mergetSortTypes) {
    chooseRecords.value = chooseRecords.value.sort((a: any, b: any) => {
      return (
        chooseTemplateConfig.value?.mergetSortTypes.indexOf(a.houseSpace) -
        chooseTemplateConfig.value?.mergetSortTypes.indexOf(b.houseSpace)
      );
    });
  }

  const mergerPdf = await PDFDocument.create();
  showLoading();
  let tokenInfo: any = {};

  if (chooseRecords.value.filter((v: any) => !v.pdfUrl).length > 0) {
    errorMessage("未获取到PDF文件");
    hideLoading();
    return;
  }
  if (
    chooseRecords.value.filter((v: any) => v.pdfUrl.startsWith("https"))
      .length > 0
  ) {
    tokenInfo = await getOssToken();

    if (!tokenInfo?.data?.stsToken) {
      errorMessage("获取oss token失败");
      hideLoading();
      return;
    }
  }
  let pdfTasks: any = [];
  for (const record of chooseRecords.value) {
    pdfTasks.push(getPdfUnitArray(record.pdfUrl, tokenInfo));
  }
  const pdfUnitArray = await Promise.all(pdfTasks);

  if (pdfUnitArray.length === 0) {
    hideLoading();
    errorMessage("未获取到PDF文件");
    return;
  }

  for (const pdfUnit of pdfUnitArray) {
    const pdfDoc = await PDFDocument.load(pdfUnit);
    const copiedPages = await mergerPdf.copyPages(
      pdfDoc,
      pdfDoc.getPageIndices()
    );
    copiedPages.forEach((page) => {
      mergerPdf.addPage(page);
    });
  }

  const url = (await getCoverImage(chooseCoverConfig.value?.url)) as any;

  const firstPage = mergerPdf.getPages()[0];
  let { width, height } = firstPage.getSize();
  const rotationAngle = firstPage.getRotation().angle;
  if (rotationAngle === 90 || rotationAngle === 270) {
    [width, height] = [height, width];
  }

  // Create a new page to first page of PDF
  const newPage = mergerPdf.insertPage(0);
  newPage.setWidth(width);
  newPage.setHeight(height);

  // Draw uploadImage to first page of PDF
  // 添加imageData jpg到pdf
  // const uploadImage = await pdfDoc.embedPng(body.imageData);
  const uploadImage = await mergerPdf.embedJpg(url);
  newPage.drawImage(uploadImage, {
    x: 0,
    y: 0,
    width,
    height,
  });

  // 转成文件流
  const pdfBytes = await mergerPdf.save();
  uint8ArrayData.value = pdfBytes;
  gFile.value = new File([pdfBytes], `${getPdfName()}.pdf`, {
    type: "application/pdf",
  });

  hideLoading();
  confirmType.value = "createPDF";
  confirmTitle.value = "确认创建";
  confirmContent.value = `确认创建变更明细合同模板文件吗？`;
  showConfirm.value = true;
}

async function getPdfUnitArray(url: string, tokenInfo: any) {
  let res: any = {};
  let uint8Array: Uint8Array;
  if (url.startsWith("https")) {
    res = await downloadFileFromOss(tokenInfo, url);
    if (!res?.content) {
      errorMessage("获取PDF文件失败");
      hideLoading();
      return;
    }
    uint8Array = res.content as Uint8Array;
  } else {
    res = await downloadFileByUrl(url);
    if (!res?.arrayBuffer) {
      errorMessage("获取PDF文件失败");
      hideLoading();
      return;
    }
    // 将 Blob 转换为 Uint8Array
    const arrayBuffer = await res.arrayBuffer();
    uint8Array = new Uint8Array(arrayBuffer);
  }
  return uint8Array;
}

async function orderDetailContractManageVisible(v: boolean, data: any) {
  if (v) {
    orderData.value = data.orderData || {};
    customTemplateList.value = data.config.templateList || [];
    printTypeList.value = data.config.choosePrintItems || [];
    await nextTick();
    modelValue.value = true;
    await nextTick();
    init();
  } else {
    modelValue.value = false;
  }
}

onBeforeMount(() => {
  (window as any).$wujie?.bus.$on(
    "orderDetailContractManageVisible",
    orderDetailContractManageVisible
  );
  (window as any).$wujie?.bus.$on("initContractTasks", initContractTasks);
});

onUnmounted(() => {
  (window as any).$wujie?.bus.$off(
    "orderDetailContractManageVisible",
    orderDetailContractManageVisible
  );
  (window as any).$wujie?.bus.$off("initContractTasks", initContractTasks);
});

const imageRotateType = ref("clockwise");

const imageLoad = async (e: any) => {
  const img = e.target;
  // 图片转buffer
  const reader = new FileReader();
  const response = await fetch(img.src);
  const blob = await response.blob();
  reader.onload = function (event) {
    const arrayBuffer: any = event.target?.result;
    if (arrayBuffer) {
      const tags: any = ExifReader.load(arrayBuffer, { expanded: true });
      const id = img.getAttribute("data-id");
      let imageItem = chooseImages.value.find(
        (v: any) => Number(v.id) === Number(id)
      );
      imageItem.orientation = tags?.exif?.Orientation?.value || 1;
      imageItem.width = img.naturalWidth;
      imageItem.height = img.naturalHeight;
      if (img.naturalWidth < img.naturalHeight) {
        img.style.transform = "rotate(-90deg) scale(1.45)";
        if (imageItem) imageItem.rotate = "anticlockwise";
        // 添加class isRotate
        img.classList.add("isRotate");
      } else {
        img.style.transform = "";
      }
    }

    loadImageCount.value += 1;
    if (loadImageCount.value === chooseImages.value.length) {
      hideLoading();
    }
  };
  reader.readAsArrayBuffer(blob);
};

watch(imageRotateType, (v) => {
  const imgs = document.querySelectorAll("#split-0 img.isRotate");
  imgs.forEach((img: any) => {
    const id = img.getAttribute("data-id");
    let imageItem = chooseImages.value.find(
      (v: any) => Number(v.id) === Number(id)
    );
    if (v === "clockwise") {
      img.style.transform = `rotate(-90deg) scale(1.45)`;
      if (imageItem) imageItem.rotate = "anticlockwise";
    } else {
      img.style.transform = `rotate(90deg) scale(1.45)`;
      if (imageItem) imageItem.rotate = "clockwise";
    }
  });
});

// 监听 show image list type
watch(showImagesListType, async (v) => {
  if (v === "big") {
    await nextTick();
    splitContainer.value = Split(["#split-0", "#split-1"], {
      direction: "horizontal",
      minSize: [310, 310],
      sizes: [25, 75],
    });
  } else {
    splitContainer.value?.destroy();
  }
});
</script>

<template>
  <DrawerLayout v-model="modelValue" :width="1180">
    <v-card>
      <v-toolbar dark class="text-#333 relative z-2" color="#fff">
        <v-btn dark icon color="red" @click="modelValue = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title class="text-#3175FB"> 合同管理 </v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn variant="text" size="large" @click="getUseTemplateList(false)">
            <div class="i-mdi-refresh mr4px text-20px" />
            刷新列表
          </v-btn>
          <v-btn variant="text" size="large" @click="openChooseFile"
                 v-permission:orderInfo.id="{ COMPLETION_PROCESS_PERMISSIONS: orderData?.id }"
          >
            <div class="i-mdi-paper-add mr4px text-20px" />
            创建合同模板
          </v-btn>
          <v-btn variant="text" size="large" @click="openChooseTemplate"
            :disabled="!['designer'].includes(curRole && curRole.type)">
            <div class="i-mdi-contract-sign mr4px text-20px" />
            选择合同模板
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <div class="wfull bg-#f4f4f4 hc-100vh-64px overflow-auto beauty-scroll relative z-1">
        <Empty v-if="contractListData.length === 0" text="暂未发起合同" />
        <Empty v-if="templateListData.length === 0" text="暂无合同模板" />
        <div ref="cardListRef" class="cardList flex flex-wrap gap-20px pa20px" v-else>
          <CustomCard v-for="(item, index) in cardListData" :key="index" :list-width="cardListWidth" :min-width="280"
            :data="item" />
          <!-- 文件选择 -->
          <!-- <v-file-input label="File input" v-model="inputFile"></v-file-input> -->
        </div>
      </div>
    </v-card>
    <DialogLayout v-model="chooseTemplateDialogVisible" header-icon="i-mdi-contract-sign" :height="700" :width="1200"
      bg="#f4f4f4" hide-footer no-padding title="选择模板(同类型只能签署一个)">
      <div class="h50px wfull bg-#fafafa px-10px shadow-sm flex items-center r-z-2">
        <v-chip-group v-model="chooseTemplateType" theme="myCustomLightTheme" hide-details mandatory color="primary">
          <v-chip size="small" :value="item.id" variant="elevated" class="bg-#fff text-#000"
            v-for="(item, index) in allTemplateTypes" :key="index">
            {{ item.name }}
          </v-chip>
        </v-chip-group>
      </div>
      <Empty v-if="!templateCardData.length" text="暂无启用的合同模板" />
      <!-- <div class="py10px">
        <div
          class="bg-#f4f4f4 px10px py5px mb15px b-l-4px border-color-#3175FBcc"
          v-for="(tplGroup, index) in showTemplateList"
          :key="index"
        >
          <div class="text-16px text-#333 font-weight-bold lh-30px pl14px">
            {{ tplGroup.typeName }}
          </div>
          <div class="mt-5px">
            <TtBtn
              v-for="(tpl, index) in tplGroup.list"
              :key="index"
              :disabled="
                useTemplateIds.includes(tpl.templateId) ||
                useTemplateTypes.includes(tpl.houseType)
              "
              color="primary"
              class="mb10px wfull w48% mx-1% py4px"
              size="large"
              @click="confirmChooseTemplate(tpl)"
            >
              {{ tpl.title }}
              <div
                v-if="
                  useTemplateIds.includes(tpl.templateId) ||
                  useTemplateTypes.includes(tpl.houseType)
                "
                class="text-right wfull absolute left-0 top--8px"
              >
                <v-chip
                  color="#FF5B58"
                  text-color="#fff"
                  variant="elevated"
                  density="compact"
                >
                  当前模板类型已使用
                </v-chip>
              </div>
            </TtBtn>
          </div>
        </div>
      </div> -->
      <div class="h574px overflow-auto beauty-scroll r-z-1">
        <div class="cardList flex flex-wrap gap-20px pa20px" ref="templateCardListRef">
          <CustomCard v-for="(item, index) in templateCardData" :key="index" :list-width="templateCardListWidth"
            :min-width="240" :data="item" />
        </div>
      </div>
    </DialogLayout>


    <!-- 选择材料合同模版 -->
    <DialogLayout v-model="chooseMaterialTemplateDialogVisible" header-icon="i-mdi-contract-sign" :height="700"
      :width="1200" bg="#f4f4f4" hide-footer no-padding title="选择材料买卖合同模板">
      <Empty v-if="!materialTemplateListData.length" text="暂无启用的合同模板" />
      <!-- <div class="py10px">
        <div
          class="bg-#f4f4f4 px10px py5px mb15px b-l-4px border-color-#3175FBcc"
          v-for="(tplGroup, index) in showTemplateList"
          :key="index"
        >
          <div class="text-16px text-#333 font-weight-bold lh-30px pl14px">
            {{ tplGroup.typeName }}
          </div>
          <div class="mt-5px">
            <TtBtn
              v-for="(tpl, index) in tplGroup.list"
              :key="index"
              :disabled="
                useTemplateIds.includes(tpl.templateId) ||
                useTemplateTypes.includes(tpl.houseType)
              "
              color="primary"
              class="mb10px wfull w48% mx-1% py4px"
              size="large"
              @click="confirmChooseTemplate(tpl)"
            >
              {{ tpl.title }}
              <div
                v-if="
                  useTemplateIds.includes(tpl.templateId) ||
                  useTemplateTypes.includes(tpl.houseType)
                "
                class="text-right wfull absolute left-0 top--8px"
              >
                <v-chip
                  color="#FF5B58"
                  text-color="#fff"
                  variant="elevated"
                  density="compact"
                >
                  当前模板类型已使用
                </v-chip>
              </div>
            </TtBtn>
          </div>
        </div>
      </div> -->
      <div class="h574px overflow-auto beauty-scroll r-z-1">
        <div class="cardList flex flex-wrap gap-20px pa20px" ref="templateCardListRef">
          <CustomCard v-for="(item, index) in materialTemplateListData" :key="index" :list-width="templateCardListWidth"
            :min-width="240" :data="item" />
        </div>
      </div>
    </DialogLayout>
    <!-- 选择变更明细合同模版 -->
    <DialogLayout v-model="chooseChangeMaterDialogVisible" header-icon="i-mdi-contract-sign" :height="700" :width="1200"
      bg="#f4f4f4" hide-footer no-padding title="选择变更明细合同模板">
      <Empty v-if="!changeTemplateListData.length" text="暂无启用的合同模板" />
      <div class="h574px overflow-auto beauty-scroll r-z-1">
        <div class="cardList flex flex-wrap gap-20px pa20px" ref="templateCardListRef">
          <CustomCard v-for="(item, index) in changeTemplateListData" :key="index" :list-width="templateCardListWidth"
            :min-width="240" :data="item" />
        </div>
      </div>
    </DialogLayout>

    <DialogLayout v-model="showTip" header-icon="mdi-alert-circle-outline" :title="tipDialogTitle" :width="dialogWidth"
      :height="dialogHeight" :hide-footer="['showReason'].includes(tipType)" @confirm="handleTipConfirm">
      <div v-if="tipType === 'showReason'" class="whitespace-pre-wrap">
        {{ tipContent }}
      </div>
      <div v-if="['inputRescissionReason', 'inputRevokeReason'].includes(tipType)">
        <v-select v-if="tipType === 'inputRescissionReason'" class="mt10px" hide-details v-model="chooseType"
          placeholder="请选择解约原因" :items="rescissionReasonList" item-title="name" item-value="id" label="请选择解约原因"
          required />

        <v-textarea v-model="inputText" :placeholder="tipType === 'inputRescissionReason'
          ? '请输入解约原因说明'
          : '请输入撤销原因'
          " class="mt10px" hide-details rows="5" maxLength="150" no-resize clearable />
      </div>
    </DialogLayout>

    <LightConfirm v-model="showConfirm" :title="confirmTitle" :tip-text="confirmContent" @confirm="handleConfirm" />

    <DialogLayout v-model="showChooseTemplate" :width="680" :min-height="490" :max-height="800" height="auto"
      header-icon="i-mdi-paper-add" title="选择创建的模板类型" no-padding :hide-header="true" :hide-footer="true">
      <Empty v-if="customTemplateList.length === 0" text="暂未配置可选择的模板类型" />
      <div class="chooseCardList flex flex-wrap gap-20px pa-20px flex-start">
        <div v-for="(c, i) in customTemplateList" :key="i" @click="handleChooseTemplateType(c)"
          class="w200px b-1 flex items-center flex-col py20px rounded-8px cursor-pointer hover:shadow">
          <div class="mb-20px icon">
            <CustomImgIcon :icon="c.icon" />
          </div>
          <div class="mb-10px text-16px font-bold text-#3175fb name">
            {{ c.name }}
          </div>
          <div class="chooseBtn px-16px py-4px b-1 rounded-100px text-14px text-#3175fb">
            选择
          </div>
        </div>
      </div>
    </DialogLayout>

    <DialogLayout v-model="showChooseFiles" :width="710" :height="600" header-icon="mdi-file-image"
      title="选择图纸图片组或图纸PDF" :hide-header="true" :hide-footer="true">
      <div class="fileList flex gap-10px flex-wrap">
        <Empty v-if="files.length === 0" text="暂未上传图纸文件" />
        <div class="fileItem pa5px cursor-pointer bg-#f4f4f4 w120px rounded-8px hover:bg-blue-100"
          v-for="(file, index) in files" :key="index" @click="handleChooseFile(file)">
          <div class="icon flex-center text-60px">
            <div v-if="file.type === 1" class="i-mdi-file-pdf text-red"></div>
            <div v-else-if="file.type === 2" class="i-mdi-file-image text-blue"></div>
          </div>
          <div class="text-center text-13px line-clamp-2 h40px items-center flex flex-center">
            <div class="line-clamp-2 break-all">{{ file.name }}</div>
          </div>
        </div>
      </div>
    </DialogLayout>

    <DialogLayout v-model="showChoosePrintRecord" :width="1200" :height="700" header-icon="i-mdi-list-box-outline"
      title="选择需要创建合同模板的打印记录" :btnValue="`确认选择完成(已选${chooseRecords.length})`" no-padding float-footer
      @confirm="handleChoosePrintRecord">
      <div class="flex h550px">
        <div class="w200px overflow-auto beauty-scroll pa-10px relative z-2 shadow-md">
          <div v-for="(b, i) in printTypeList" :key="i" @click="handleChooseShowRecordType(b)"
            class="flex mb-10px rounded-6px cursor-pointer pa-10px text-13px items-center hover:bg-#f4f4f4 transition"
            :class="chooseShowRecordType === b.type
              ? ['text-#3175FB', 'bg-#3175FB22!']
              : ['bg-#fafafa']
              ">
            <CustomImgIcon :icon="b.icon" :size="20" :color="chooseShowRecordType === b.type ? '#3175FB' : '#333'" />
            <div class="ml-6px">
              {{ b.title }}{{ b.alowMultipleChoose ? "(多选)" : "" }}
            </div>
          </div>
        </div>
        <div class="flex-1 relative z-1 text-#333 bg-#f4f4f4 overflow-auto beauty-scroll">
          <Empty v-if="printRecordCardListData.length === 0" text="暂无记录" />
          <div class="cardList flex flex-wrap gap-15px pa15px">
            <CustomCard v-for="(item, index) in printRecordCardListData" :key="index" :list-width="740" :min-width="220"
              :data="item" />
          </div>
        </div>
        <div class="w230px relative z-2 shadow-md">
          <div
            class="wfull h40px lh-40px text-15px font-bold b-l-4px border-color-#3175FB pl10px bg-#fff shadow relative z-2">
            已选记录({{ chooseRecords.length }})
          </div>
          <div
            class="wfull hc-100%-40px pa10px bg-#fafafa relative z-1 overflow-y-auto overflow-x-hidden beauty-scroll">
            <div class="cardList flex flex-wrap gap-15px justify-center">
              <Empty v-if="chooseRecordCardListData.length === 0" text="暂未选择" />
              <CustomCard v-for="(item, index) in chooseRecordCardListData" :key="index" :list-width="200"
                :min-width="190" :data="item" />
            </div>
          </div>
        </div>
      </div>
    </DialogLayout>

    <Teleport to="html">
      <DialogLayout v-model="showImages" :width="1200" :height="800" header-icon="mdi-file-image"
        title="图纸图片组合并PDF_拖拽排序" btnValue="合并为图纸PDF模板文件" no-padding float-footer content-class="h100vh"
        @confirm="openConfirmMergePDF">
        <template #titleDefault>
          <div class="flex items-center gap-20px">
            <div class="text-#999 text-14px">
              (自动排序支持以序号开头或结尾,例：1****.jpg、****01.jpg)
            </div>
            <div class="flex items-center">
              列表尺寸：
              <v-chip-group v-model="imagesListSize" theme="myCustomLightTheme" hide-details mandatory color="primary">
                <v-chip value="small" size="small" variant="elevated" class="bg-#fff text-#000">
                  小
                </v-chip>
                <v-chip value="normal" size="small" variant="elevated" class="bg-#fff text-#000">
                  中
                </v-chip>
                <v-chip value="large" size="small" variant="elevated" class="bg-#fff text-#000">
                  大
                </v-chip>
              </v-chip-group>
            </div>
          </div>
        </template>
        <template #addFooterBtn>
          <div class="mr-auto text-14px lh-16px text-red">
            <div>推荐单张图片规格：</div>
            <div class="text-red">宽 × 高：<b>3307  ×  2338</b> 相近即可</div>
            <div class="text-red">大小：<b>500KB</b> 左右，尽量不超过1M</div>
          </div>
          <v-spacer />
          <div class="flex items-center text-#666 mr-20px">
            竖向图片自动旋转方向：
            <v-chip-group v-model="imageRotateType" theme="myCustomLightTheme" hide-details mandatory color="primary">
              <v-chip value="clockwise" size="small" variant="elevated" class="bg-#fff text-#000">
                逆时针
              </v-chip>
              <v-chip value="anticlockwise" size="small" variant="elevated" class="bg-#fff text-#000">
                顺时针
              </v-chip>
            </v-chip-group>
          </div>
          <v-btn class="text-none me-2" color="blue" :prepend-icon="showImagesListType === 'list'
            ? 'mdi-view-agenda'
            : 'mdi-view-dashboard'
            " @click="
              showImagesListType =
              showImagesListType === 'list' ? 'big' : 'list'
              ">
            切换为{{ showImagesListType === "list" ? "大图" : "列表" }}模式
          </v-btn>
        </template>
        <div class="wfull h645px flex flex-wrap splitPaneContainer">
          <div id="split-0" :class="showImagesListType === 'big' ? ['w310px'] : ['wfull']">
            <Draggable v-model="chooseImages" item-key="id" filter=".forbid" chosen-class="chosen" force-fallback="true"
              group="people" animation="300"
              class="overflow-auto beauty-scroll flex flex-wrap h650px gap-10px pa10px content-start" :move="onMove">
              <template #item="{ element, index }">
                <div class="flex-center flex-wrap cursor-pointer rounded-4px hover:bg-blue-100 overflow-hidden relative"
                  :class="[
                    {
                      forbid: element.id === 0,
                      'bg-#f4f4f4': checkImage !== element,
                      'bg-blue-300!': checkImage === element,
                    },
                    {
                      small: 'w134px h130px',
                      normal: 'w182px h165px',
                      large: 'w280px h230px',
                    }[imagesListSize] || 'w280px h230px',
                  ]" @click="checkImage = element">
                  <div class="wfull flex-center items-center" :class="{
                    small: 'h95px',
                    normal: 'h130px',
                    large: 'h190px',
                  }[imagesListSize] || 'h190px'
                    ">
                    <img :src="element.url" :data-id="element.id" class="max-h-100% max-w-100%" @load="imageLoad" />
                  </div>
                  <div class="text-12px lh-16px line-clamp-2">
                    {{ index === 0 ? "封面" : element.name }}
                  </div>
                  <div class="text-12px lh-16px absolute left-0px top-0px px-4px py-2px text-#fff bg-#000000 font-bold">
                    第{{ index + 1 }}页
                  </div>
                  <div v-if="element.rotate"
                    class="text-14px lh-16px absolute right-0px top-0px px-4px py-2px text-#fff bg-#00000099 font-bold">
                    <v-icon :size="20">{{
                      element.rotate === "clockwise"
                        ? "mdi-rotate-right"
                        : "mdi-rotate-left"
                    }}</v-icon>90
                  </div>
                </div>
              </template>
            </Draggable>
          </div>
          <div id="split-1" ref="showImageContainerRef"
            class="showImage wc-100%-310px flex-center overflow-hidden hfull" v-if="showImagesListType === 'big'">
            <img :src="checkImage?.url" class="wfull hfull object-contain" :style="{
              width: checkImage?.rotate
                ? `${imageContainerHeight}px`
                : '100%',
              height: checkImage?.rotate
                ? `${imageContainerWidth}px`
                : '100%',
            }" :class="[
              checkImage?.rotate
                ? checkImage.rotate === 'clockwise'
                  ? 'rotate-90'
                  : 'rotate-270'
                : '',
            ]" />
          </div>
        </div>
      </DialogLayout>
    </Teleport>
    <FullScreenIframe v-model="showIframe" :url="iframeUrl" @initList="init" />

    <MaterialContractTemplateFormDialog v-if="orderData?.id && orderData?.customerId && orderData?.customer"
      :orderId="orderData.id" :customerId="orderData.customerId" :orderNumber="orderData.number"
      :customerName="orderData.customer.name" :companyId="orderData.companyId" :companyName="orderData.companyName"
      ref="materialContractTemplateFormDialogRef" @refresh="getUseTemplateList" />
    <ChangeContractTemplateFormDialog ref="changeContractTemplateFormDialogRef"
      v-if="orderData?.id && orderData?.customerId && orderData?.customer" :orderId="orderData.id"
      :customerId="orderData.customerId" :orderNumber="orderData.number" :customerName="orderData.customer.name"
      :companyId="orderData.companyId" :companyName="orderData.companyName" @refresh="getUseTemplateList" />
  </DrawerLayout>
</template>

<style scoped>
.chooseCardList>div {
  transition: all 0.3s ease;
}

.chooseCardList>div>div {
  transition: all 0.3s ease;
}

.chooseCardList>div:hover {
  border-color: #3175fb;
  background: #3175fb;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2), 0 0 0 8px rgba(0, 79, 250, 0.2);
}

.chooseCardList>div:hover .icon img {
  filter: drop-shadow(0 5000px 0 #fff) !important;
}

.chooseCardList>div:hover div {
  color: #fff;
  border-color: #fff;
}
</style>
