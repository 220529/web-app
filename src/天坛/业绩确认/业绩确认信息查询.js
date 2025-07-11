/**
 * @flowId 137
 * @flowKey hxq0m4aexa0cs592
 * @flowName 业绩确认信息查询
 * @flowNodeName 函数名称
 * @flowNodeType funEditNode
 * @flowNodeId 1
 * @updateTime 2025-06-16 10:15:07
 */

try {
  /**
   * @param {*} name
   * @eg "2024年4月签单汇总"
   * @eg "2024年04月签单汇总"
   * @return {
   *   month: "04",
   *   year: "2024",
   *   parsed: boolean
   * }
   */
  function matchDate(name = '') {
    const text = name;
    const regex = /(\d{4})年(\d{1,2})月/;
    const match = text.match(regex);

    if (match && name) {
      const year = match[1];
      const month = match[2].padStart(2, '0');
      return {
        year,
        month,
        parsed: true,
      };
    }

    return {
      year: null,
      month: null,
      parsed: false,
    };
  }
  const [{ getButton1, getIconText, getIcon, buttonClick }, { role }] =
    await Promise.all([
      ctx.service.common.runFlowByParams({
        flowId: 'n9frfqz6omboxmh6', // 测试工具函数
      }),
      ctx.helper.getRole(ctx),
    ]);

  const getTipText = (type, text, title) => {
    return {
      handleType: 'showTipText',
      dialogProps: {
        hideFooter: true,
        noPadding: true,
        width: '600px',
        height: '300px',
        title: title || '执行结果',
      },
      tipData: {
        icon: type || 'success',
        text: text || '执行成功',
      },
    };
  };

  function renderButton(text, onclick, option = { size: 'normal', style: '' }) {
    const isNormal = option.size === 'normal';
    const isSmall = option.size === 'small' || 'mini';

    return `
      <style>.hoverBtn:hover{opacity: 0.7 !important;}</style>
      <button
        class="hoverBtn"
        id="openChooseBtn"
        style="
          margin: 0 auto;
          padding: ${isNormal ? '9px 16px' : '3px 9px'};
          border-radius: 4px;
          opacity: 1;
          background: #3175FB;
          font-size: ${isNormal ? '12px' : '10px'};
          font-weight: normal;
          line-height: 14px;
          color: #FFFFFF;
          ${option.style}
        "
        ${buttonClick(onclick)}
      >
        ${text}
      </button>
    `;
  }
  function renderListItem(v) {
    const svgAttr = `style="width: 20px;height:20px;flex-shrink: 0;margin: 0 10px 0 5px;" class="icon" viewBox = "0 0 1024 1024" version = "1.1" xmlns = "http://www.w3.org/2000/svg" width = "200" height = "200"`;
    return `
      <div style="
          background: ${v.status === 'success' ? '#78c53822' : '#de3e3e22'};
          display:flex;
          align-items: center;
          width:100%;
          padding:8px 5px;
          font-size:14px;
          border-radius:5px;
      ">
          ${
            v.status === 'success'
              ? `
              <svg ${svgAttr} p-id="22181">
                  <path d="M511.75543 62.584384c-247.815085 0-448.708512 200.659089-448.708512 448.186625 0 247.52549 200.893426 448.185602 448.708512 448.185602 247.814062 0 448.707488-200.659089 448.707488-448.185602C960.462918 263.243473 759.569492 62.584384 511.75543 62.584384L511.75543 62.584384zM406.268934 739.938386l-35.823903-35.779901 0.11768-0.116657L174.825724 508.533039l35.82288-35.780925 195.736986 195.507766 378.618177-378.179179 35.82595 35.780925L406.268934 739.938386 406.268934 739.938386z" fill="#78c538" p-id="22182">
                  </path>
              </svg>`
              : `
              <svg ${svgAttr} p-id="23978" width="200" height="200">
                  <path d="M509.262713 5.474574c281.272162 0 509.262713 228.02238 509.262713 509.262713 0 281.272162-227.990551 509.262713-509.262713 509.262713s-509.262713-227.990551-509.262713-509.262713c0-281.240333 227.990551-509.262713 509.262713-509.262713z m135.050106 278.725849L509.262713 419.250528l-135.050106-135.050105-90.012184 90.012184L419.186871 509.262713l-135.018277 135.081935 90.012184 90.012184L509.262713 599.274897l135.050106 135.050106 90.012184-90.012184L599.274897 509.262713l135.050106-135.050106-90.012184-90.012184z" fill="#de3e3e" p-id="23979">
                  </path>
              </svg>
              `
          }
          ${v?.tip || '未知信息'}
      </div>
    `;
  }
  function renderCheckList(list, render = renderListItem) {
    return list.map((v) => render(v)).join('');
  }

  function renderMonthItem(month) {
    return `
      <div style="
        background: #F5F6F7;
        display:flex;
        align-items: center;
        width:100%;
        padding: 3px 16px;
        font-size:14px;
        border-radius:2px;
      ">
        <div style="
          background: url('${ctx.helper.getProdFileUrl(
            '/public/upload/file/13/0/2024-07-18-10-43-16-055d4793-f774-47d6-a509-d20d9a57a723.png',
          )}');
          background-size: 100% 100%;
          width: 34px;
          height: 34px;
          margin-right: 5px;
        "></div>
        业绩归属月份：${month}
      </div>
    `;
  }

  /**
   * @description 根据状态展示对应的提示
   * @param {*} status
   * @param {*} enabledHtml
   * @return {*}
   */
  function renderActionByStatus(status, enabledHtml) {
    if (status === 'disabled') {
      const disabledHtml = `
          <div style = "width: 100%; padding: 10px 20px; font-size: 16px; font-weight: 500; line-height: 17px; color: #de3e3e; border-radius: 2px; opacity: 1; background: #FEEFF0; border: 1px solid #de3e3e;" >
            订单暂不可发起业绩确认，请检查上述条件或补充订单信息后发起。
          </div>
        `;
      return disabledHtml;
    } else if (status === 'applyEd') {
      const hasDoneHtml = `
          <div style="width: 100%; padding: 10px 20px; font-size: 16px; font-weight: 500; line-height: 17px; color: #de3e3e; border-radius: 2px; opacity: 1; background: #FEEFF0; border: 1px solid #de3e3e;">
              已存在审核中业绩申请,如果订单信息错误，可点击下方按钮取消。
          </div>
        `;
      return hasDoneHtml;
    } else if (status === 'enabled') {
      return enabledHtml;
    }
    return '';
  }

  // 校验 是否同时存在两个月份 业绩汇总
  async function getChooseMonth(
    fileName = '签单汇总',
    fileType = 'confirmOrder',
    recordWhere = {},
  ) {
    const date = new Date();
    // 24年4月xxxx
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const nowMonth = [
      `${year}年${month < 10 ? `0${month}` : month}月${fileName}`,
      `${year}年${month}月${fileName}`,
    ];
    const titlePrefixArr = [...nowMonth];

    const lastDate = new Date();
    lastDate.setMonth(lastDate.getMonth() - 1, 1);
    const lastYear = lastDate.getFullYear();
    const lastMonth = lastDate.getMonth() + 1;
    // 添加上月 fileName
    const lastMonthArr = [
      `${lastYear}年${
        lastMonth < 10 ? `0${lastMonth}` : lastMonth
      }月${fileName}`,
      `${lastYear}年${lastMonth}月${fileName}`,
    ];
    titlePrefixArr.unshift(...lastMonthArr);

    // 上月和当月 业绩汇总表 文件
    const [lastFiles, files] = await Promise.all([
      ctx.model.Workfile.findAll({
        where: {
          adminId: [1180, 2, 661, 1291, 4, 1275], // 测试环境，固定一个用户：zy TODO: 上线修改uid
          type: fileType, // TODO:
          name: {
            [Op.in]: lastMonthArr,
          },
        },
      }),
      ctx.model.Workfile.findAll({
        where: {
          adminId: [1180, 2, 661, 1291, 4, 1275], // 测试环境，固定一个用户：zy TODO: 上线修改uid
          type: fileType, // TODO:
          name: {
            [Op.in]: nowMonth,
          },
        },
      }),
    ]);

    async function checkFilesStatus(files, date, fileName = '签单汇总') {
      if (!files.length) {
        return {
          status: 'notFound',
          tip: `未找到${fileName}文件`,
          date,
        };
      } else {
        const file = files[0];
        const date = matchDate(file.name);
        const fitUse = `${date.year}${date.month}`;
        const fileData = JSON.parse(file.data);
        if (fileData.length) {
          const record = await ctx.model.Record.findOne({
            where: {
              targetId: fileData[0].id,
              fitUse,
              ...recordWhere,
            },
            order: [['createdAt', 'DESC']],
          });
          if (JSON.parse(record?.data || '{}')?.stopTime) {
            return {
              status: 'stop',
              tip: `${file.name.replace(fileName, '')}业绩确认已关闭`,
              date: file.name.replace(fileName, ''),
            };
          }
        }

        return {
          status: 'success',
          tip: `${file.name.replace(fileName, '')}业绩文件未关闭`,
          date: file.name.replace(fileName, ''),
        };
      }
    }

    const nowMonthDate = nowMonth[0].replace(fileName, '');
    const lastMonthDate = lastMonthArr[0].replace(fileName, '');

    const [lastMonthStatus, nowMonthStatus] = await Promise.all([
      checkFilesStatus(lastFiles, lastMonthDate, fileName),
      checkFilesStatus(files, nowMonthDate, fileName),
    ]);
    let html = '';

    const fileCheckList = [];

    // 存在多个月份的文件
    if (
      lastMonthStatus.status === 'success' &&
      nowMonthStatus.status === 'success'
    ) {
      html = `
        <style>
            #month-check-wrapper {
                width: 100%;
                margin-bottom: 12px;
            }
            #month-check-wrapper .month-check-item_radio {
                margin-right: 12px;
            }
        </style>
        <div id="month-check-wrapper">
            <label style="margin-right: 4px;">请选择当前业绩所属月份：</label>
            <label class="month-check-item_radio">
                <input type="radio" class="month-check-item" name="monthCheck" value="${lastMonthDate}" />
                ${lastMonthDate}
            </label>
            <label class="month-check-item_radio">
                <input type="radio" class="month-check-item" name="monthCheck" value="${nowMonthDate}" />
                ${nowMonthDate}
            </label>
        </div>
      `;
    } else if (lastMonthStatus.status === 'success') {
      html = renderMonthItem(lastMonthStatus.date);
    } else if (nowMonthStatus.status === 'success') {
      html = renderMonthItem(nowMonthStatus.date);
    } else {
      if (
        nowMonthStatus.status === 'notFound' &&
        lastMonthStatus.status === 'stop'
      ) {
        // 当前月份业绩文件还未创建！
        fileCheckList.push({
          status: 'error',
          tip: `${lastMonthStatus.date}业绩确认已关闭，${nowMonthStatus.date}业绩文件还未创建！`,
        });
        html = ` <div style="width: 100%">暂时无法发起业绩确认,请等待管理员添加${nowMonthStatus.date}业绩确认文件；</div> `;
      } else {
        if (nowMonthStatus.status === 'notFound') {
          // 当前月份业绩文件还未创建！
          fileCheckList.push({
            status: 'error',
            tip: `${nowMonthStatus.date}业绩文件还未创建!`,
          });
        }
        html = ` <div style="width: 100%">暂时无法发起业绩确认,请等待管理员添加${nowMonthStatus.date}业绩确认文件;</div> `;
      }
    }

    return {
      html,
      lastMonthStatus,
      nowMonthStatus,
      fileCheckList,
    };
  }

  /**
   * @description 获取首期款实收金额 (合同款&订金)
   */
  async function getFirstRealReceiveAmountTotal(
    orderId,
    type = [302, 301], // 合同款、订金
    andRefund = false,
    refundTotal = 0,
  ) {
    const total = await ctx.model.Bill.sum('amount', {
      where: {
        status: 2,
        targetId: orderId,
        type: {
          [Op.in]: type,
        },
      },
    });

    return total - (andRefund ? refundTotal : 0);
  }

  /**
   * @description 获取订单的设计费实收金额
   * @param {*} orderId
   * @return {*} Promise<number>
   */
  function getDesignPriceAmount(orderId) {
    return ctx.model.Bill.sum('amount', {
      where: {
        status: {
          [Op.in]: [2],
        },
        targetId: orderId,
        type: {
          [Op.in]: [303],
        },
      },
    });
  }

  // 获取退款金额等信息
  async function getRefundAmounts(orderId) {
    const refundCountRes = await ctx.model.Task.findAll({
      where: {
        type: 'task',
        taskType: 6,
        associationId: orderId,
        // status: 1 处理中
        // status: 2 成功
        // status: 3 不通过
      },
    });
    // 退款总金额
    const refundBills = await ctx.model.Bill.findAll({
      where: {
        status: {
          [Op.in]: [2, 1],
        },
        targetId: orderId,
        type: {
          [Op.in]: [401, 402, 403],
        },
      },
    });
    const refundIds = refundBills
      .filter((v) => v.status === 2)
      .map((v) => v.id);
    const amounts = refundBills.reduce(
      (pre, acc) => {
        if (acc.status === 2) {
          pre.refundAmount += acc.amount;
          if (acc.type === 401) pre.refundAmount401 += acc.amount;
          else if (acc.type === 402) pre.refundAmount402 += acc.amount;
          else if (acc.type === 403) pre.refundAmount403 += acc.amount;
        }
        return pre;
      },
      {
        refundAmount: 0,
        refundAmount401: 0,
        refundAmount402: 0,
        refundAmount403: 0,
      },
    );

    return {
      ids: refundIds,
      count: {
        2: refundCountRes.filter((v) => v.status === 2).length,
        1: refundCountRes.filter((v) => v.status === 1).length,
      },
      amount: amounts,
    };
  }
  // 获取特殊优惠金额
  async function getSpecialOfferAmount(orderId) {
    const [tasks, specialOfferAmount] = await Promise.all([
      ctx.model.Task.findAll({
        where: {
          type: 'task',
          taskType: 3,
          associationId: orderId,
          // status: 1 处理中
          // status: 2 成功
          // status: 3 不通过
        },
      }),
      ctx.model.Bill.sum('amount', {
        where: {
          status: 0,
          targetId: orderId,
          type: {
            [Op.in]: [203],
          },
        },
      }),
    ]);
    return {
      tasks,
      specTaskCount: tasks.filter(Boolean).map((v) => ({
        status: v.status,
      })),
      specialOfferAmount:
        tasks.filter(Boolean).reduce((total, item) => {
          // 2:通过的 & 1:进行中的
          if ([1, 2].includes(+item.status)) {
            const offerItems = JSON.parse(item.data || '{}')?.offerItems || [];
            offerItems.forEach(({ type, amount }) => {
              // 7: 折抵现金（中期减免）
              if ([7].includes(+type) && !Number.isNaN(parseFloat(amount)))
                total += parseFloat(amount);
            });
          }
          return total;
        }, 0) - (specialOfferAmount || 0),
    };
  }

  // 缓存已经查询到的部门
  const deps = new Map();
  // type 6 分公司
  async function findType6Department(departmentId) {
    let department = deps.get(+departmentId);
    if (!department) {
      department = await ctx.model.Department.findOne({
        where: { id: departmentId },
      });
    }
    if (department) {
      deps.set(+departmentId, department);
      if (department.type === 6) return department;
      else return await findType6Department(department.pid);
    }
    return null;
  }

  //  业绩查询 ｜ 发起等逻辑实现
  const orderId = body.orderId;
  if (!orderId)
    return getTipText('error', '未获取到订单信息', '未获取到订单信息');

  const orderInfo = await ctx.service.order.find(orderId);

  const orderTotalPrice =
    orderInfo?.status === 1 ? +orderInfo.lockPrice : +orderInfo.totalPrice;

  if (Number(orderInfo.status) === 0)
    return getTipText('error', '报价中订单无法确认', '报价中订单无法确认');

  function isSameMonth(date1, dates) {
    return dates.some((date) => {
      return (
        date1.getFullYear() === date.getFullYear() &&
        date1.getMonth() === date.getMonth()
      );
    });
  }
  const { fetchOrderById, decimalToPercent, normalizeAmount, toFixedNumber } =
    await ctx.service.common.runFlowByParams({
      flowId: 'qb3jfo36gx2a6ajv',
    });
  const orderDetail = await fetchOrderById({ orderId });
  const {
    fetchContractsByOrderId,
    fetchProjectsByOrderIds,
    fetchRelationContractFile,
  } = await ctx.service.common.runFlowByParams({
    flowId: 'ngwxsmpv2z5i7ldg',
  });
  const projects = await fetchProjectsByOrderIds({
    orderIds: [orderId],
    orderId,
  });
  const mainContract = await fetchContractsByOrderId({
    orderId: body.orderId,
    fitUses: [4],
  });
  const qualityContract = await fetchContractsByOrderId({
    orderId: body.orderId,
    fitUses: [5],
  });
  const relationContract = await fetchRelationContractFile({
    orderId: body.orderId,
  });
  // 新签单业绩
  async function getType1View(
    orderId,
    orderDesignPrice,
    isChooseContractFile,
    relationContractFile,
  ) {
    const isBeforeCreatedStatus = [
      {
        title: '未发起',
        value: -1,
        props: {
          color: '#58637D33',
          style: 'color: #58637D',
        },
      },
      {
        title: '驳回',
        value: 0,
        props: {
          color: '#FF5B5833',
          style: 'color: #FF5B58',
        },
      },
      {
        title: '已发起',
        value: 1,
        props: {
          color: '#3175FB33',
          style: 'color: #3175FB',
        },
      },
      {
        title: '已确认',
        value: 2,
        props: {
          color: '#3175FB33',
          style: 'color: #3175FB',
        },
      },
      {
        title: '已完成',
        value: 3,
        props: {
          color: '#83C44733',
          style: 'color: #83C447',
        },
      },
      {
        title: '已超时',
        value: 4,
        props: {
          color: '#FF5B5833',
          style: 'color: #FF5B58',
        },
      },
      {
        title: '线下已发',
        value: 5,
        props: {
          color: '#58637D33',
          style: 'color: #58637D',
        },
      },
      {
        title: '线下已发',
        value: 6,
        props: {
          color: '#58637D33',
          style: 'color: #58637D',
        },
      },
      {
        title: '已作废',
        value: 7,
        props: {
          color: '#58637D33',
          style: 'color: #58637D',
        },
      },
      {
        title: '已作废',
        value: 8,
        props: {
          color: '#58637D33',
          style: 'color: #58637D',
        },
      },
    ];

    // 获取退款金额等信息
    async function getRefundAmounts(orderId) {
      // 退款总金额
      const refundBills = await ctx.model.Bill.findAll({
        where: {
          status: {
            [Op.in]: [2, 1],
          },
          targetId: orderId,
          type: {
            [Op.in]: [401, 402, 403],
          },
        },
      });
      const refundIds = refundBills
        .filter((v) => v.status === 2)
        .map((v) => v.id);
      const amounts = refundBills.reduce(
        (pre, acc) => {
          if (acc.status === 2) {
            pre.refundAmount += acc.amount;
            if (acc.type === 401) pre.refundAmount401 += acc.amount;
            else if (acc.type === 402) pre.refundAmount402 += acc.amount;
            else if (acc.type === 403) pre.refundAmount403 += acc.amount;
          }
          return pre;
        },
        {
          refundAmount: 0,
          refundAmount401: 0,
          refundAmount402: 0,
          refundAmount403: 0,
        },
      );

      return {
        amount: amounts,
      };
    }

    // 获取特殊优惠金额
    async function getSpecialOffer(orderId) {
      const [tasks] = await Promise.all([
        ctx.model.Task.findAll({
          where: {
            type: 'task',
            taskType: 3,
            associationId: orderId,
            // status: 1 处理中
            // status: 2 成功
            // status: 3 不通过
          },
        }),
      ]);

      return {
        hasSpecialOffer: tasks.filter(Boolean).find((item) => {
          let flag = false;
          // 2:通过的 & 1:进行中的
          if ([1, 2].includes(+item.status)) {
            // const offerItems = JSON.parse(item.data || '{}')?.offerItems || [];
            // offerItems.forEach(({ type, amount }) => {
            //   // 7: 折抵现金（中期减免）
            //   if ([7].includes(+type) && !Number.isNaN(parseFloat(amount))) {
            //     flag = true;
            //   }
            // });
            flag = true;
          }
          return flag;
        }),
      };
    }

    const [
      bills,
      record,
      designPriceAmount = 0,
      { amount: refundAmount },
      { hasSpecialOffer },
      hasApplyRecord,
      chooseMonthRes,
    ] = await Promise.all([
      ctx.model.Bill.findAll({
        where: {
          targetId: orderId,
          type: {
            [Op.in]: [301, 302],
          },
          status: 2,
        },
        order: [['createdAt', 'DESC']],
      }),
      ctx.model.Record.findOne({
        where: {
          targetId: orderId,
          type: 31,
          status: {
            [Op.in]: isBeforeCreatedStatus.map((v) => v.value),
          },
        },
        order: [['fitUse', 'DESC']],
      }),
      getDesignPriceAmount(orderId),
      getRefundAmounts(orderId),
      getSpecialOffer(orderId),
      ctx.model.Record.findOne({
        where: {
          type: 51,
          targetId: orderId,
          houseType: {
            [Op.in]: [null, 1],
          },
        },
        order: [['createdAt', 'DESC']],
      }),
      getChooseMonth('签单汇总', 'confirmOrder', {
        type: 31,
      }),
    ]);

    const checkList = [];

    const bill1s = bills.filter((v) => v.type === 301);
    const bill1 = bills.find((v) => v.type === 301);
    const bill2s = bills.filter((v) => v.type === 302);
    const bill2 = bills.find((v) => v.type === 302);
    let bill1Total = bill1s.reduce((acc, cur) => {
      acc += cur.amount;
      return acc;
    }, 0);
    let bill2Total = bill2s.reduce((acc, cur) => {
      acc += cur.amount;
      return acc;
    }, 0);
    // 实收订金、合同款金额
    bill1Total = toFixedNumber(orderDetail.handselAmount);
    bill2Total = toFixedNumber(orderDetail.contractAmount);
    const radio = orderDetail.handselAndContractAmount / orderDetail.baseAmonut;
    checkList.push(...chooseMonthRes.fileCheckList);

    const dates = [];
    if (chooseMonthRes.lastMonthStatus.status)
      dates.push(new Date(new Date().setMonth(new Date().getMonth() - 1)));

    if (chooseMonthRes.nowMonthStatus.status) dates.push(new Date());

    if (!bill1 && !bill2) {
      checkList.push({
        status: 'error',
        tip: '未发起(订金/合同款)实收',
      });
    } else if (bill1 && !bill2) {
      // 实收日期必须是本月内
      const time = ctx.helper.parseTime(
        new Date(bill1.createdAt),
        'YYYY年MM月',
      );
      if (!isSameMonth(new Date(bill1.createdAt), dates)) {
        checkList.push({
          status: 'error',
          tip: `订金实收日期不符合（实收月份：${time}）`,
        });
      } else {
        checkList.push({
          status: 'success',
          tip: `已发起订金实收，金额: ${bill1Total}元,未发起合同款实收，实收月份: ${time}`,
        });
      }
    } else if (bill2 && !bill1) {
      const time = ctx.helper.parseTime(
        new Date(bill2.createdAt),
        'YYYY年MM月',
      );
      // 实收日期必须是本月内
      if (!isSameMonth(new Date(bill2.createdAt), dates)) {
        checkList.push({
          status: 'error',
          tip: `合同款实收日期不符合（实收月份：${time}）`,
        });
      } else {
        checkList.push({
          status: 'success',
          tip: `已发起合同款实收，金额: ${bill2Total}元,未发起订金实收，实收月份: ${time} `,
        });
      }
    } else {
      const time1 = ctx.helper.parseTime(
        new Date(bill1.createdAt),
        'YYYY年MM月',
      );
      const time2 = ctx.helper.parseTime(
        new Date(bill2.createdAt),
        'YYYY年MM月',
      );
      if (
        !isSameMonth(new Date(bill2.createdAt), dates) &&
        !isSameMonth(new Date(bill1.createdAt), dates)
      ) {
        checkList.push({
          status: 'error',
          tip: `实收日期不符合（订金实收，实收月份: ${time1}/ 合同款实收，实收月份: ${time2}）`,
        });
      } else {
        checkList.push({
          status: 'success',
          tip: `订单已发起，订金实收，金额: ${bill1Total}元，实收月份: ${time1} / 合同款实收，金额: ${bill2Total}元, 实收月份: ${time2}`,
        });
      }
    }
    const xinQianTip = `合同实收款达到: ${decimalToPercent(radio)}`;
    if (radio >= 0.3) {
      checkList.push({
        status: 'success',
        tip: xinQianTip,
      });
    } else {
      checkList.push({
        status: 'error',
        tip: `${xinQianTip}，不符合业绩发起条件。如有问题请联系管理员`,
      });
    }

    if (designPriceAmount > 0 && !orderDesignPrice) {
      checkList.push({
        status: 'error',
        tip: '设计费未录入无法确认业绩',
      });
    }

    if (refundAmount.refundAmount > 0) {
      checkList.push({
        status: 'error',
        tip: `订单存在退款,退款总金额: ${
          refundAmount.refundAmount
        }元, 退款类型: ${refundAmount.refundAmount401 > 0 ? '订金退款' : ''} ${
          refundAmount.refundAmount402 > 0 ? '合同款退款' : ''
        } ${refundAmount.refundAmount403 > 0 ? '设计费退款' : ''}`,
      });
    } else {
      checkList.push({
        status: 'success',
        tip: '订单无退款',
      });
    }

    if (hasSpecialOffer) {
      checkList.push({
        status: 'success',
        tip: '订单已发起特殊优惠',
      });
    } else {
      checkList.push({
        status: 'error',
        tip: '订单未发起特殊优惠',
      });
    }

    // 关联了纸质合同
    if (orderInfo.relationNumber && !mainContract?.length) {
      if (relationContract?.file) {
        checkList.push({
          tip: `已关联了纸质合同文件。`,
          status: 'success',
        });
      } else {
        if (!relationContractFile) {
          const btnHtml = renderButton(
            '选择纸质合同文件',
            {
              handleType: 'runFlow',
              params: {
                flowId: 'hxq0m4aexa0cs592',
                addParams: {
                  isChooseContractFile: 1,
                },
              },
            },
            { size: 'small', style: 'margin-right: 0;' },
          );

          checkList.push({
            tip: `订单未签署主合同，但关联了纸质合同，请选择纸质合同。${btnHtml}`,
            status: 'error',
          });
        } else {
          checkList.push({
            tip: `已选择纸质合同文件。`,
            status: 'success',
          });
        }
      }
    } else {
      // 签约电子合同
      if (!mainContract?.length) {
        checkList.push({
          tip: `订单未签署主合同，不满足业绩发起条件。`,
          status: 'error',
        });
      } else {
        checkList.push({
          tip: `订单已签署主合同`,
          status: 'success',
        });
      }
    }

    let hasLastRecord = null;

    if (record) {
      if (
        record.status === 2 &&
        (record.title.endsWith('3_null,4_null') ||
          record.title.endsWith('3_-,4_-'))
      )
        record.status = 3;

      const lastState = isBeforeCreatedStatus.find(
        ({ value }) => value === record.status,
      );
      const fitUse = `${record.fitUse}`;

      if (lastState !== -1) {
        const lastFitUse = `${fitUse.slice(0, 4)}年${fitUse.slice(4)}月`;

        checkList.push({
          status: 'error',
          tip: `订单已发起过确认,确认月份: ${lastFitUse}，状态为<span
          style="
            margin-left: 5px;
            border-radius: 4px;
            display: inline-block;
            line-height: 21px;
            height: 21px;
            padding: 0 7px;
            background-color: ${lastState.props.color};
            ${lastState.props.style};
          "
        >
          ${lastState?.title}
        </span>`,
        });
        hasLastRecord = record;
      } else {
        checkList.push({
          status: 'success',
          tip: '订单未发起过确认～',
        });
      }
    } else {
      checkList.push({
        status: 'success',
        tip: '订单未发起过确认！',
      });
    }

    if (hasApplyRecord) {
      if (hasApplyRecord.status === 1) {
        checkList.push({
          status: 'error',
          ignore: true,
          tip: '存在审核中业绩申请，暂时无法再次发起',
        });
      } else if (hasApplyRecord.status === 3) {
        const { reason = '' } = JSON.parse(hasApplyRecord.data || '{}') || {};
        checkList.push({
          status: 'success',
          tip: `存在审核不通过业绩申请，可再次发起; <p style="margin-left: 14px; color: red;">原因: <span style="font-weight: bold;">${reason}</span></p>`,
        });
      }
    }

    async function getDetailProp(orderId, hasLastRecord, hasApplyRecord) {
      let detailProps = null;
      if (hasLastRecord || hasApplyRecord?.status === 1) {
        const recordId = hasLastRecord?.id || null;
        const fileId = JSON.parse(hasLastRecord?.data || '{}')?.fileId || null;
        const rowData = {
          targetId: orderId,
        };
        rowData.id = recordId;
        const params = {
          flowId: 'iotebawk2evbtsit', // 获取首签业绩 详情  TODO: 上线修改获取ID
          rowData: JSON.stringify(rowData),
          user_type: 2,
        };
        if (fileId) params.fileId = fileId;

        const res = await ctx.service.common.runFlowByParams(params);
        detailProps = {
          res,
          pageJsonData: {
            type: 'wujie',
            config: {},
            customConfig: {
              src: 'firstSignPerfConfirm',
              useComponents: ['PaymentAndRefundDrawer'],
            },
          },
          dialogType: 'xxxxxxx',
          showFooter: false,
          width: '1200px',
          title: `${res.month}首签业绩确认 ${res.order?.number}`,
          formDataKey: 'customerId',
          'no-click-animation': true,
          persistent: true,
          height: '80vh',
          params: {
            order: `${JSON.stringify(res.order)}`,
            taskCount: `${JSON.stringify(res.taskCount)}`,
            refundTaskCount: `${JSON.stringify(res.refundTaskCount)}`,
            amount: `${JSON.stringify(res.amount)}`,
            processStatus: `${JSON.stringify(res.processStatus)}`,
            record: `${JSON.stringify(res.record)}`,
            type: 'watch',
            user_type: 2,
          },
        };
        // } else {
        //   const rowData = {
        //     id: orderId,
        //   };
        //   const params = {
        //     flowId: "iotebawk2evbtsit", // 获取设计师订单详情  TODO: 上线修改获取ID
        //     rowData: JSON.stringify(rowData),
        //     user_type: 1,
        //   };
        //   const res = await ctx.service.common.runFlowByParams(params);
        //   detailProps = {
        //     res,
        //     pageJsonData: {
        //       type: 'wujie',
        //       config: {},
        //       customConfig: {
        //         src: 'firstSignPerfConfirm',
        //       },
        //     },
        //     dialogType: 'xxxxxxx',
        //     showFooter: false,
        //     width: '1200px',
        //     title: `首签业绩确认 ${res.order?.number}`,
        //     formDataKey: 'customerId',
        //     'no-click-animation': true,
        //     persistent: true,
        //     height: '80vh',
        //     params: {
        //       order: `${JSON.stringify(res.order)}`,
        //       taskCount: `${JSON.stringify(res.taskCount)}`,
        //       refundTaskCount: `${JSON.stringify(res.refundTaskCount)}`,
        //       amount: `${JSON.stringify(res.amount)}`,
        //       processStatus: `${JSON.stringify(res.processStatus)}`,
        //       record: `null`,
        //       type: 'edit',
        //       user_type: 1,
        //     },
        //   };
      }
      return detailProps;
    }

    const detailProps = await getDetailProp(
      orderId,
      hasLastRecord,
      hasApplyRecord,
    );

    function getPerDetailButton() {
      return `
        ${getButton1(
          getIconText('info', '查看业绩详情', '#00CD66', 20),
          undefined,
          {
            handleType: 'runFormatFunction',
            params: {
              flowId: 'ljdr37vejf3lkxqr',
            },
          },
        )}
    `;
    }

    let status = 'disabled'; // disabled enabled applyEd
    if (checkList.find((v) => v.status === 'error' && !v.ignore)) {
      status = 'disabled'; // 不可发起
      if (hasLastRecord) {
        status = 'done'; // 往月已经发起了，不可再此发起
      }
    } else {
      if (hasApplyRecord?.status === 1) {
        status = 'applyEd'; // 已发起
      } else {
        status = 'enabled'; // 可以发起
      }
    }

    let html = `
        <div style = "width: 100%;height: 470px;overflow: auto;padding: 10px;display:flex;gap:10px;flex-wrap:wrap;align-content: flex-start;" class="beauty-scroll" >
          ${renderCheckList(checkList)}
            ${renderActionByStatus(
              status,
              `
                <div style="width: 100%; padding: 10px 20px; font-size: 16px; font-weight: 500; line-height: 17px; color: #5FB88A; border-radius: 2px; opacity: 1; background: #E9F9EE; border: 1px solid #5FB88A;">
                  订单信息正常${
                    ['designer', 'systemAdmin', 'superAdmin'].includes(
                      role?.type,
                    )
                      ? '，可点击下方按钮发起业绩申请。'
                      : '。'
                  }
                </div>
                <!-- 输入框 -->
                <div style="display: flex; align-items: center; width: 100%">
                    <div style="display: flex; align-items: center; width: 275px;line-height: 38px">
                        <label for="upFee" style="margin-right: 4px">上楼费：</label>
                        <input style="height: 38px; padding: 4px 16px; font-size: 14px; color: rgba(0,0,0,0.87); background: #f6f6f6; border: none; outline: none;" type="text" name="上楼费" id="upFee" placeholder="上楼费" />
                    </div>

                    <div style="display: flex; align-items: center; width: 275px;line-height: 38px">
                        <label for="remoteFee" style="margin-right: 4px">远程费：</label>
                        <input style="height: 38px; padding: 4px 16px; font-size: 14px; color: rgba(0,0,0,0.87); background: #f6f6f6; border: none; outline: none;" type="text" name="远程费" id="remoteFee" placeholder="远程费" />
                    </div>
                </div>
                <!-- 选择月份 -->
                ${
                  ['designer', 'systemAdmin', 'superAdmin'].includes(role?.type)
                    ? chooseMonthRes.html
                    : ''
                }
                <!-- 确认发起审核按钮 -->
                ${
                  ['designer', 'systemAdmin', 'superAdmin'].includes(role?.type)
                    ? renderButton('己确认无误，申请发起业绩确认', {
                        handleType: 'runFormatFunction',
                        params: {
                          flowId: 'nprvkg9y0wvrftgl',
                          type: 1,
                        },
                      })
                    : ''
                }
            `,
            )}

            ${
              hasApplyRecord?.status === 1
                ? `
              <!-- 业绩申请审核中 展示取消按钮 -->
              <div>
              ${getButton1(
                getIconText('close-fill', '点击取消当前申请', '#00CD66', 20),
                undefined,
                {
                  handleType: 'runFormatFunction',
                  params: {
                    // 取消业绩当前申请
                    flowId: 'csnkmdzf03calv2j',
                  },
                },
              )}
              </div>
            `
                : ''
            }
          ${
            hasLastRecord || hasApplyRecord?.status === 1
              ? getPerDetailButton()
              : ''
          }
        </div>
      `;

    if (isChooseContractFile === 1) {
      const [files] = await ctx.model.query(`
          SELECT
            fr.*,
            f.url AS fileUrl,
            f.id AS fileId,
            f.createdAt AS fileCreatedAt,
            u.name AS adminName
          FROM
            filerels AS fr
            LEFT JOIN files AS f ON fr.id = f.targetId AND f.type = 1
            LEFT JOIN users AS u ON fr.adminId = u.id
          WHERE
            fr.type = 1
            AND fr.targetId = ${orderInfo.customerId}
        `);

      files.forEach((file) => {
        file.url = ctx.helper.getOssUrl(file.fileUrl);
      });
      html = `
          <div style="margin-bottom: 20px; font-size: 18px; color: red; text-align: center;">在订单【图纸/文件管理】处上传纸质合同文件</div>
          <div style="display: flex; flex-wrap: wrap; gap: 20px; margin: 0 16px;">
            ${files
              .map((file) => {
                return `
                <div
                  style="
                    width: calc(50% - 10px);
                    background: rgb(229, 229, 229);
                    padding: 8px;
                    border-radius: 6px;
                  "
                >
                  <div
                    style="
                      display: flex;
                      background: white;
                      border-radius: 6px;
                    "
                  >
                    <div
                      style="
                        padding: 6px 10px;
                        width: calc(100% - 80px);
                        position: relative;
                      "
                    >
                      <div
                        style="
                          position: absolute;
                          top: 6px;
                          left: 8px;
                          font-size: 35px;
                        "
                      >
                        ${getIcon('pdf-file', 35, '#FE5852')}
                      </div>
                      <div
                        style="
                          color: rgb(51, 51, 51);
                          width: 100%;
                          height: 40px;
                          padding-left: 40px;
                          font-size: 14px;
                          line-height: 20px;
                          font-weight: bold;
                          word-break: break-all;
                          overflow: hidden;
                          text-overflow: ellipsis;
                          display: -webkit-box;
                          line-clamp: 2;
                          -webkit-line-clamp: 2;
                        "
                      >
                        ${file.name}
                      </div>
                      <div
                        style="
                          margin: 5px 0 0;
                          display: flex;
                          height: 24px;
                          gap: 5px;
                          align-items: center;
                        "
                      >
                        <span
                          style="
                            border: 1px solid rgb(245, 138, 81);
                            border-radius: 4px;
                            cursor: default;
                            opacity: 1;
                            background-color: rgb(245, 138, 81);
                            color: #fff;
                            padding: 0 7px;
                            font-size: 12px;
                            line-height: 20px;
                            white-space: nowrap;
                          "
                        >
                          PDF格式
                        </span>
                      </div>
                      <div
                        style="
                          color: rgb(153, 153, 153);
                          font-size: 12px;
                          line-height: 13px;
                          margin-top: 8px;
                          overflow: hidden;
                        "
                      >
                        <div style="margin-right: 20px; display: inline-block;">${
                          file.adminName
                        }</div>
                        <div style="display: inline-block;">创建时间：${ctx.helper.parseTime(
                          file.createdAt,
                          'YYYY-MM-DD HH:mm:ss',
                        )}</div>
                      </div>
                    </div>
                    <div
                      style="
                        display: flex;
                        border-left: 1px solid #ddd;
                        vertical-align: middle;
                        justify-content: space-evenly;
                        width: 80px;
                        flex-direction: column;
                        padding: 0 10px;
                      "
                    >
                      ${
                        file.fileId
                          ? renderButton('选择', {
                              handleType: 'runFlow',
                              params: {
                                flowId: 'hxq0m4aexa0cs592',
                                addParams: {
                                  isChooseContractFile: 2,
                                  relationContractFile: file,
                                },
                              },
                            })
                          : '<span style="color: #999; font-size: 12px; text-align: center;">无文件</span>'
                      }
                    </div>
                  </div>
                </div>
              `;
              })
              .join('')}
          </div>
        `;

      return {
        render: {
          handleType: 'showHtml',
          dialogProps: {
            title: '请选择纸质合同文件',
            width: '780px',
            height: '550px',
            noPadding: true,
            hideFooter: true,
          },
          htmlStr: html,
          debug: {
            files,
          },
        },
      };
    }
    return {
      render: {
        handleType: 'showHtml',
        dialogProps: {
          title: '业绩确认查询结果',
          width: '580px',
          height: '550px',
          noPadding: true,
          hideFooter: true,
          props: detailProps,
          fitUse: chooseMonthRes.lastMonthStatus.status,
        },
        htmlStr: html,
      },
      status,
      hasLastRecord,
      hasApplyRecord,
      chooseMonthRes,
      debug: {},
    };
  }

  // 开工业绩
  async function getType2View(order, totalPrice, newSignRecord) {
    const isBeforeCreatedStatus = [
      {
        title: '未发起',
        value: -1,
        props: {
          color: '#58637D33',
          style: 'color: #58637D',
        },
      },
      {
        title: '驳回',
        value: 0,
        props: {
          color: '#FF5B5833',
          style: 'color: #FF5B58',
        },
      },
      {
        title: '已发起',
        value: 1,
        props: {
          color: '#3175FB33',
          style: 'color: #3175FB',
        },
      },
      {
        title: '已完成',
        value: 2,
        props: {
          color: '#83C44733',
          style: 'color: #83C447',
        },
      },
      {
        title: '已超时',
        value: 4,
        props: {
          color: '#FF5B5833',
          style: 'color: #FF5B58',
        },
      },
      {
        title: '已作废',
        value: 5,
        props: {
          color: '#58637D33',
          style: 'color: #58637D',
        },
      },
      {
        title: '线下已发',
        value: 6,
        props: {
          color: '#58637D33',
          style: 'color: #58637D',
        },
      },
    ];

    const checkList = [];

    if (![1, 2, 3].includes(newSignRecord?.status)) {
      checkList.push({
        tip: '新签业绩未发起，不满足业绩发起条件。',
        status: 'error',
      });
    } else {
      checkList.push({
        tip: '新签业绩已发起',
        status: 'success',
      });
    }

    let [contractTotal, record, hasApplyRecord, chooseMonthRes] =
      await Promise.all([
        getFirstRealReceiveAmountTotal(orderId, [302]),
        ctx.model.Record.findOne({
          where: {
            targetId: orderId,
            type: 54,
            houseType: 3,
            status: {
              [Op.in]: isBeforeCreatedStatus.map((v) => v.value),
            },
          },
          order: [['fitUse', 'DESC']],
        }),
        ctx.model.Record.findOne({
          where: {
            type: 51,
            targetId: orderId,
            houseType: 2,
          },
          order: [['createdAt', 'DESC']],
        }),
        getChooseMonth('开工汇总', 'confirmKaiGongOrder', {
          type: 54,
          houseType: 3,
        }),
      ]);
    contractTotal = orderDetail.handselAndContractAmount;
    const contractRate = +((contractTotal / totalPrice) * 100).toFixed(2);
    const kaiGongTip = `合同实收款达到: ${decimalToPercent(
      contractTotal / orderDetail.baseAmonut,
    )}`;
    if (contractTotal / orderDetail.baseAmonut >= 0.65) {
      checkList.push({
        tip: kaiGongTip,
        status: 'success',
      });
    } else {
      checkList.push({
        tip: `${kaiGongTip}，不符合业绩发起条件。如有问题请联系管理员`,
        status: 'error',
      });
    }
    const startNode = projects?.find((v) => v.name === '开工交底');
    if (startNode?.status === 2) {
      checkList.push({
        tip: '开工交底节点已完成',
        status: 'success',
      });
    } else {
      checkList.push({
        tip: `开工交底节点未完成，不符合业绩发起条件。如有问题请联系管理员`,
        status: 'error',
      });
    }

    checkList.push(...chooseMonthRes.fileCheckList);

    let hasLastRecord = null;

    if (record) {
      const lastState = isBeforeCreatedStatus.find(
        ({ value }) => value === record.status,
      );
      const fitUse = `${record.fitUse}`;

      if (lastState !== -1) {
        const lastFitUse = `${fitUse.slice(0, 4)}年${fitUse.slice(4)}月`;

        checkList.push({
          status: 'error',
          tip: `订单已发起过确认,确认月份: ${lastFitUse}，状态为<span
          style="
            margin-left: 5px;
            border-radius: 4px;
            display: inline-block;
            line-height: 21px;
            height: 21px;
            padding: 0 7px;
            background-color: ${lastState.props.color};
            ${lastState.props.style};
          "
        >
          ${lastState?.title}
        </span>`,
        });
        hasLastRecord = record;
      } else {
        checkList.push({
          status: 'success',
          tip: '订单未发起过确认～',
        });
      }
    } else {
      checkList.push({
        status: 'success',
        tip: '订单未发起过确认！',
      });
    }

    if (hasApplyRecord) {
      if (hasApplyRecord.status === 1) {
        checkList.push({
          status: 'error',
          ignore: true,
          tip: '存在审核中业绩申请，暂时无法再次发起',
        });
      } else if (hasApplyRecord.status === 3) {
        const { reason = '' } = JSON.parse(hasApplyRecord.data || '{}') || {};
        checkList.push({
          status: 'success',
          tip: `存在审核不通过业绩申请，可再次发起; <p style="margin-left: 14px; color: red;">原因: <span style="font-weight: bold;">${reason}</span></p>`,
        });
      }
    }

    let status = 'disabled'; // disabled enabled applyEd
    if (checkList.find((v) => v.status === 'error' && !v.ignore)) {
      status = 'disabled'; // 不可发起
      if (hasLastRecord) {
        status = 'done'; // 往月已经发起了，不可再此发起
      }
    } else {
      if (hasApplyRecord?.status === 1) {
        status = 'applyEd'; // 已发起
      } else {
        status = 'enabled'; // 可以发起
      }
    }

    async function getDetailProp(orderId, hasLastRecord, hasApplyRecord) {
      let detailProps = null;
      if (hasLastRecord || hasApplyRecord?.status === 1) {
        const recordId = hasLastRecord?.id || null;
        const fileId = JSON.parse(hasLastRecord?.data || '{}')?.fileId || null;
        const rowData = {
          id: orderId,
        };
        rowData.recordId = recordId;
        const params = {
          flowId: 'wahlsfp0mk4l8mg9', // 获取开工业绩 详情  TODO: 上线修改获取ID
          rowData: JSON.stringify(rowData),
          user_type: 1,
        };
        if (fileId) params.fileId = fileId;

        const res = await ctx.service.common.runFlowByParams(params);
        detailProps = {
          res,
          pageJsonData: {
            // id: "c5u6w21axhpi8rl9",
            type: 'wujie',
            config: {},
            customConfig: {
              src: 'performance/personDetail',
            },
          },
          dialogType: 'xxxxxxx',
          showFooter: false,
          width: '1200px',
          title: `${res.month}开工业绩确认 ${res.order?.number}`,
          formDataKey: 'customerId',
          'no-click-animation': true,
          persistent: true,
          height: '80vh',
          params: {
            order: `${JSON.stringify(res.order)}`,
            amount: `${JSON.stringify(res.amount)}`,
            record: `${JSON.stringify(res.record)}`,
            type: 'watch',
            user_type: 2,
            performanceType: 2,
          },
        };
      }
      return detailProps;
    }

    const detailProps = await getDetailProp(
      orderId,
      hasLastRecord,
      hasApplyRecord,
    );

    function getPerDetailButton() {
      return `
        ${getButton1(
          getIconText('info', '查看业绩详情', '#00CD66', 20),
          undefined,
          {
            handleType: 'runFormatFunction',
            params: {
              flowId: 'ljdr37vejf3lkxqr',
            },
          },
        )}
    `;
    }

    const html = `
        <div style = "width: 100%;height: 470px;overflow: auto;padding: 10px;display:flex;gap:10px;flex-wrap:wrap;align-content: flex-start;" class="beauty-scroll" >
          ${renderCheckList(checkList)}

          ${renderActionByStatus(
            status,
            `
                <div style="width: 100%; padding: 10px 20px; font-size: 16px; font-weight: 500; line-height: 17px; color: #5FB88A; border-radius: 2px; opacity: 1; background: #E9F9EE; border: 1px solid #5FB88A;">
                  订单信息正常${
                    ['designer', 'systemAdmin', 'superAdmin'].includes(
                      role?.type,
                    )
                      ? '，可点击下方按钮发起业绩申请。'
                      : '。'
                  }
                </div>

                <!-- 选择月份 -->
                ${
                  ['designer', 'systemAdmin', 'superAdmin'].includes(role?.type)
                    ? chooseMonthRes.html
                    : ''
                }
                <!-- 确认发起审核按钮 -->
                ${
                  ['designer', 'systemAdmin', 'superAdmin'].includes(role?.type)
                    ? renderButton('己确认无误，申请发起业绩确认', {
                        handleType: 'runFormatFunction',
                        params: {
                          flowId: 'nprvkg9y0wvrftgl',
                          type: 2,
                        },
                      })
                    : ''
                }
            `,
          )}
          ${
            hasApplyRecord?.status === 1
              ? `
                <!-- 业绩申请审核中 展示取消按钮 -->
                <div>
                ${getButton1(
                  getIconText('close-fill', '点击取消当前申请', '#00CD66', 20),
                  undefined,
                  {
                    handleType: 'runFormatFunction',
                    params: {
                      // 取消业绩当前申请
                      flowId: 'csnkmdzf03calv2j',
                    },
                  },
                )}
                </div>
              `
              : ''
          }
          ${
            hasLastRecord || hasApplyRecord?.status === 1
              ? getPerDetailButton()
              : ''
          }
        </div>
    `;

    return {
      render: {
        handleType: 'showHtml',
        dialogProps: {
          title: '开工业绩查询结果',
          width: '580px',
          height: '550px',
          noPadding: true,
          hideFooter: true,
          props: detailProps,
          fitUse: chooseMonthRes.lastMonthStatus.status,
        },
        htmlStr: html,
      },
      status,
      hasApplyRecord,
      chooseMonthRes,
    };
  }

  // 套外业绩
  async function getType3View(
    orderId,
    isChooseMaterials = false,
    chooseMaterials = [],
  ) {
    const checkList = [];
    const [hasApplyRecord, outMaterialRes, chooseMonthRes, records] =
      await Promise.all([
        ctx.model.Record.findOne({
          where: {
            type: 51,
            targetId: orderId,
            houseType: 3,
          },
          order: [['createdAt', 'DESC']],
        }),
        ctx.service.common.runFlowByParams({
          flowId: 'nf57lljtzxj3eyj4', // 获取套外已收齐物料数据 TODO: 上线替换线上ID
          orderId: orderId,
          type: 3,
        }),
        getChooseMonth('套外汇总', 'confirmTaowaiOrder', {
          type: 54,
          houseType: 1,
        }),
        ctx.model.Record.findAll({
          where: {
            targetId: orderId,
            type: 54,
            houseType: 1,
          },
          order: [['fitUse', 'DESC']],
        }),
      ]);
    const confirmMs = records
      .map((v) =>
        (JSON.parse(v.data || '{}').materials || []).filter((m) => {
          return [2].includes(m.status);
        }),
      )
      .flat();
    const cancelIds = records
      .map((v) =>
        (JSON.parse(v.data || '{}').materials || []).filter((m) => {
          return [7].includes(m.status);
        }),
      )
      .flat()
      .map((v) => v.id);
    const waitConfirmMs = (outMaterialRes.rows || []).filter(
      (v) => !confirmMs.find((m) => m.id == v.id) && !cancelIds.includes(v.id),
    );
    if (!outMaterialRes?.count) {
      checkList.push({
        tip: `该订单没有已收款套外材料，不满足套外业绩发起条件`,
        status: 'error',
      });
    } else {
      const btnHtml = renderButton(
        '选择/查看发起业绩物料',
        {
          handleType: 'runFormatFunction',
          params: {
            flowId: 'aazmqkr49noyur3m',
            defaultCheckList: chooseMaterials,
          },
        },
        { size: 'small', style: 'margin-right: 0;' },
      );

      checkList.push({
        tip: `有${
          waitConfirmMs?.length
        }条待发起套外业绩物料<span style="color: #FF8400;">（已选择<span id="choose-len">${
          isChooseMaterials ? chooseMaterials.length : 0
        }</span>条物料）</span>${btnHtml}`,
        status: 'success',
      });
    }

    checkList.push(...chooseMonthRes.fileCheckList);

    if (hasApplyRecord) {
      if (hasApplyRecord.status === 1) {
        checkList.push({
          status: 'error',
          ignore: true,
          tip: '存在审核中业绩申请，暂时无法再次发起',
        });
      } else if (hasApplyRecord.status === 3) {
        const { reason = '' } = JSON.parse(hasApplyRecord.data || '{}') || {};
        checkList.push({
          status: 'success',
          tip: `存在审核不通过业绩申请，可再次发起; <p style="margin-left: 14px; color: red;">原因: <span style="font-weight: bold;">${reason}</span></p>`,
        });
      }
    }

    let status = 'disabled'; // disabled enabled applyEd
    if (checkList.find((v) => v.status === 'error' && !v.ignore)) {
      status = 'disabled'; // 不可发起
    } else {
      if (hasApplyRecord?.status === 1) {
        status = 'applyEd'; // 已发起
      } else {
        status = 'enabled'; // 可以发起
      }
    }

    const html = `
        <div style = "width: 100%;height: 470px;overflow: auto;padding: 10px;display:flex;gap:10px;flex-wrap:wrap;align-content: flex-start;" class="beauty-scroll" >
          <div style="position: relative; margin-bottom: 14px; display: inline-flex; width: 100%; gap: 21px;">
            <div style="flex: 1; display: flex; align-items: center; border-radius: 4px; padding: 8px 15px; background: #FFF0E9; border: 1px solid #FF5B58;">
              <div style="margin-right: 8px; display: flex; height: 44px; width: 44px; align-items: center; justify-content: center; background-color: #FFDAC9; border-radius: 50%;">
                <span style="background: url('${ctx.helper.getProdFileUrl(
                  '/public/upload/file/13/0/2024-07-19-09-11-50-b7173c7c-58ac-41a4-9dfa-becc0209dbfa.png',
                )}'); background-size: 100%; 100%; width: 17px; height: 22px; margin-top: -1px; display: inline-block;" />
              </div>
              <div style="margin-right: 15px;">
                <div style="
                  font-size: 20px;
                  font-weight: 500;
                  line-height: 14px;
                  color: #FF5B58;
                  margin-bottom: 4px;
                ">
                  ${waitConfirmMs
                    .reduce((acc, cur) => {
                      acc += +cur.amount;
                      return acc;
                    }, 0)
                    .toFixed(2)}
                </div>
                <div style="
                  font-size: 12px;
                  line-height: 14px;
                  color: #17233E;
                ">
                  待确认套外业绩
                </div>
              </div>
              <div >
                <div style="
                  font-size: 20px;
                  font-weight: 500;
                  line-height: 14px;
                  color: #FF5B58;
                  margin-bottom: 4px;
                ">
                  ${waitConfirmMs.length}
                </div>
                <div style="
                  font-size: 12px;
                  line-height: 14px;
                  color: #17233E;
                ">
                  套外物料数
                </div>
              </div>
            </div>
            <div style="flex: 1; display: flex; align-items: center; border-radius: 4px; padding: 8px 15px; background: #E5F6FF; border: 1px solid #3175FB;">
              <div style="margin-right: 10px; display: flex; height: 40px; width: 40px; align-items: center; justify-content: center; background-color: #B7E6FF; border-radius: 50%;">
                <span style="background: url('${ctx.helper.getProdFileUrl(
                  '/public/upload/file/13/0/2024-07-19-09-15-15-acf77172-b235-47af-8297-b577d50103ff.png',
                )}'); background-size: 100%; 100%; width: 17px; height: 22px; margin-top: -1px; display: inline-block;" />
              </div>

              <div style="margin-right: 15px;">
                <div style="
                  font-size: 20px;
                  font-weight: 500;
                  line-height: 14px;
                  color: #3175FB;
                  margin-bottom: 4px;
                ">
                  ${confirmMs
                    .reduce((acc, cur) => {
                      acc += +cur.amount;
                      return acc;
                    }, 0)
                    .toFixed(2)}
                </div>
                <div style="
                  font-size: 12px;
                  line-height: 14px;
                  color: #17233E;
                ">
                  已确认套外业绩
                </div>
              </div>
              <div >
                <div style="
                  font-size: 20px;
                  font-weight: 500;
                  line-height: 14px;
                  color: #3175FB;
                  margin-bottom: 4px;
                ">
                  ${confirmMs.length}
                </div>
                <div style="
                  font-size: 12px;
                  line-height: 14px;
                  color: #17233E;
                ">
                  套外物料数
                </div>
              </div>
            </div>
          </div>

          ${renderCheckList(checkList)}

          ${renderActionByStatus(
            status,
            `
              <div style="width: 100%; padding: 10px 20px; font-size: 16px; font-weight: 500; line-height: 17px; color: #5FB88A; border-radius: 2px; opacity: 1; background: #E9F9EE; border: 1px solid #5FB88A;">
                    订单信息正常${
                      ['designer', 'systemAdmin', 'superAdmin'].includes(
                        role?.type,
                      )
                        ? '，可点击下方按钮发起业绩申请。'
                        : '。'
                    }
                </div>

                <!-- 选择月份 -->
                ${
                  ['designer', 'systemAdmin', 'superAdmin'].includes(role?.type)
                    ? chooseMonthRes.html
                    : ''
                }
                <!-- 确认发起审核按钮 -->
                ${
                  ['designer', 'systemAdmin', 'superAdmin'].includes(role?.type)
                    ? renderButton('己确认无误，申请发起业绩确认', {
                        handleType: 'runFormatFunction',
                        params: {
                          flowId: 'nprvkg9y0wvrftgl',
                          type: 3,
                        },
                      })
                    : ''
                }
            `,
          )}
            ${
              hasApplyRecord?.status === 1
                ? `
              <!-- 业绩申请审核中 展示取消按钮 -->
              <div>
              ${getButton1(
                getIconText('close-fill', '点击取消当前申请', '#00CD66', 20),
                undefined,
                {
                  handleType: 'runFormatFunction',
                  params: {
                    // 取消业绩当前申请
                    flowId: 'csnkmdzf03calv2j',
                  },
                },
              )}
              </div>
            `
                : ''
            }
        </div>
    `;

    return {
      render: {
        handleType: 'showHtml',
        dialogProps: {
          title: '套外业绩查询结果',
          width: '580px',
          height: '550px',
          noPadding: true,
          hideFooter: true,
          fitUse: chooseMonthRes.lastMonthStatus.status,
        },
        htmlStr: html,
      },
      status,
      hasApplyRecord,
      chooseMonthRes,
      allMaterials: outMaterialRes.rows,
      debug: {
        chooseMonthRes,
        confirmMs,
        waitConfirmMs,
      },
    };
  }

  // 设计费业绩
  async function getType4View(orderId, orderDesignPrice) {
    const isBeforeCreatedStatus = [
      {
        title: '未发起',
        value: -1,
        props: {
          color: '#58637D33',
          style: 'color: #58637D',
        },
      },
      {
        title: '驳回',
        value: 0,
        props: {
          color: '#FF5B5833',
          style: 'color: #FF5B58',
        },
      },
      {
        title: '已发起',
        value: 1,
        props: {
          color: '#3175FB33',
          style: 'color: #3175FB',
        },
      },
      {
        title: '已完成',
        value: 2,
        props: {
          color: '#83C44733',
          style: 'color: #83C447',
        },
      },
      {
        title: '已超时',
        value: 4,
        props: {
          color: '#FF5B5833',
          style: 'color: #FF5B58',
        },
      },
      {
        title: '已作废',
        value: 5,
        props: {
          color: '#58637D33',
          style: 'color: #58637D',
        },
      },
      {
        title: '线下已发',
        value: 6,
        props: {
          color: '#58637D33',
          style: 'color: #58637D',
        },
      },
    ];

    const checkList = [];
    const [designPriceAmount, record, hasApplyRecord, chooseMonthRes] =
      await Promise.all([
        getDesignPriceAmount(orderId),
        ctx.model.Record.findOne({
          where: {
            targetId: orderId,
            type: 54,
            houseType: 4,
            status: {
              [Op.in]: isBeforeCreatedStatus.map((v) => v.value),
            },
          },
          order: [['fitUse', 'DESC']],
        }),
        ctx.model.Record.findOne({
          where: {
            type: 51,
            targetId: orderId,
            houseType: 4,
          },
          order: [['createdAt', 'DESC']],
        }),
        getChooseMonth('设计费汇总', 'confirmShejifeiOrder', {
          type: 54,
          houseType: 4,
        }),
      ]);
    let isSuccess = true;
    if (orderDetail.designPrice) {
      if (orderDetail.designPriceAmount < orderDetail.designPrice) {
        isSuccess = false;
      }
    }
    const designTip = `设计费预收${normalizeAmount(
      orderDetail.designPrice,
    )} 元，实收${normalizeAmount(orderDetail.designPriceAmount)}元`;
    if (isSuccess) {
      checkList.push({
        tip: `${designTip}，满足业绩发起条件。`,
        status: 'success',
      });
    } else {
      checkList.push({
        tip: `${designTip}，预收与实收不一致不满足业绩发起条件。`,
        status: 'error',
      });
    }

    checkList.push(...chooseMonthRes.fileCheckList);

    let hasLastRecord = null;
    if (record) {
      const lastState = isBeforeCreatedStatus.find(
        ({ value }) => value === record.status,
      );
      const fitUse = `${record.fitUse}`;

      if (lastState !== -1) {
        const lastFitUse = `${fitUse.slice(0, 4)}年${fitUse.slice(4)}月`;

        checkList.push({
          status: 'error',
          tip: `订单已发起过确认,确认月份: ${lastFitUse}，状态为<span
          style="
            margin-left: 5px;
            border-radius: 4px;
            display: inline-block;
            line-height: 21px;
            height: 21px;
            padding: 0 7px;
            background-color: ${lastState.props.color};
            ${lastState.props.style};
          "
        >
          ${lastState?.title}
        </span>`,
        });
        hasLastRecord = record;
      } else {
        checkList.push({
          status: 'success',
          tip: '订单未发起过确认～',
        });
      }
    } else {
      checkList.push({
        status: 'success',
        tip: '订单未发起过确认！',
      });
    }

    if (hasApplyRecord) {
      if (hasApplyRecord.status === 1) {
        checkList.push({
          status: 'error',
          ignore: true,
          tip: '存在审核中业绩申请，暂时无法再次发起',
        });
      } else if (hasApplyRecord.status === 3) {
        const { reason = '' } = JSON.parse(hasApplyRecord.data || '{}') || {};
        checkList.push({
          status: 'success',
          tip: `存在审核不通过业绩申请，可再次发起; <p style="margin-left: 14px; color: red;">原因: <span style="font-weight: bold;">${reason}</span></p>`,
        });
      }
    }

    let status = 'disabled'; // disabled enabled applyEd
    if (checkList.find((v) => v.status === 'error' && !v.ignore)) {
      status = 'disabled'; // 不可发起
      if (hasLastRecord) {
        status = 'done'; // 往月已经发起了，不可再此发起
      }
    } else {
      if (hasApplyRecord?.status === 1) {
        status = 'applyEd'; // 已发起
      } else {
        status = 'enabled'; // 可以发起
      }
    }

    async function getDetailProp(orderId, hasLastRecord, hasApplyRecord) {
      let detailProps = null;
      if (hasLastRecord || hasApplyRecord?.status === 1) {
        const recordId = hasLastRecord?.id || null;
        const fileId = JSON.parse(hasLastRecord?.data || '{}')?.fileId || null;
        const rowData = {
          id: orderId,
        };
        rowData.recordId = recordId;
        const params = {
          flowId: 'cy097kkz8tv1plts', // 获取设计费业绩 详情  TODO: 上线修改获取ID
          rowData: JSON.stringify(rowData),
          user_type: 1,
        };
        if (fileId) params.fileId = fileId;

        const res = await ctx.service.common.runFlowByParams(params);
        detailProps = {
          res,
          pageJsonData: {
            // id: "c5u6w21axhpi8rl9",
            type: 'wujie',
            config: {},
            customConfig: {
              src: 'performance/personDetail',
            },
          },
          dialogType: 'xxxxxxx',
          showFooter: false,
          width: '1200px',
          title: `${res.month}设计费业绩确认 ${res.order?.number}`,
          formDataKey: 'customerId',
          'no-click-animation': true,
          persistent: true,
          height: '80vh',
          params: {
            order: `${JSON.stringify(res.order)}`,
            amount: `${JSON.stringify(res.amount)}`,
            record: `${JSON.stringify(res.record)}`,
            type: 'watch',
            user_type: 2,
            performanceType: 4,
          },
        };
      }
      return detailProps;
    }

    const detailProps = await getDetailProp(
      orderId,
      hasLastRecord,
      hasApplyRecord,
    );

    function getPerDetailButton() {
      return `
        ${getButton1(
          getIconText('info', '查看业绩详情', '#00CD66', 20),
          undefined,
          {
            handleType: 'runFormatFunction',
            params: {
              flowId: 'ljdr37vejf3lkxqr',
            },
          },
        )}
    `;
    }

    const html = `
        <div style = "width: 100%;height: 470px;overflow: auto;padding: 10px;display:flex;gap:10px;flex-wrap:wrap;align-content: flex-start;" class="beauty-scroll" >
          ${renderCheckList(checkList)}

          ${renderActionByStatus(
            status,
            `
              <div style="width: 100%; padding: 10px 20px; font-size: 16px; font-weight: 500; line-height: 17px; color: #5FB88A; border-radius: 2px; opacity: 1; background: #E9F9EE; border: 1px solid #5FB88A;">
                  订单信息正常${
                    ['designer', 'systemAdmin', 'superAdmin'].includes(
                      role?.type,
                    )
                      ? '，可点击下方按钮发起业绩申请。'
                      : '。'
                  }
              </div>

              <!-- 选择月份 -->
              ${
                ['designer', 'systemAdmin', 'superAdmin'].includes(role?.type)
                  ? chooseMonthRes.html
                  : ''
              }
              <!-- 确认发起审核按钮 -->
              ${
                ['designer', 'systemAdmin', 'superAdmin'].includes(role?.type)
                  ? renderButton('己确认无误，申请发起业绩确认', {
                      handleType: 'runFormatFunction',
                      params: {
                        flowId: 'nprvkg9y0wvrftgl',
                        type: 4,
                      },
                    })
                  : ''
              }
            `,
          )}
            ${
              hasApplyRecord?.status === 1
                ? `
              <!-- 业绩申请审核中 展示取消按钮 -->
              <div>
              ${getButton1(
                getIconText('close-fill', '点击取消当前申请', '#00CD66', 20),
                undefined,
                {
                  handleType: 'runFormatFunction',
                  params: {
                    // 取消业绩当前申请
                    flowId: 'csnkmdzf03calv2j',
                  },
                },
              )}
              </div>
            `
                : ''
            }
          ${
            hasLastRecord || hasApplyRecord?.status === 1
              ? getPerDetailButton()
              : ''
          }
        </div>
    `;

    return {
      render: {
        handleType: 'showHtml',
        dialogProps: {
          title: '设计费业绩查询结果',
          width: '580px',
          height: '550px',
          noPadding: true,
          hideFooter: true,
          fitUse: chooseMonthRes.lastMonthStatus.status,
          props: detailProps,
        },
        htmlStr: html,
      },
      status,
      hasApplyRecord,
      chooseMonthRes,
      debug: {
        chooseMonthRes,
      },
    };
  }

  // 套内增项业绩
  async function getType5View(
    orderId,
    isChooseMaterials = false,
    chooseMaterials = [],
  ) {
    const isBeforeCreatedStatus = [
      {
        title: '未发起',
        value: -1,
        props: {
          color: '#58637D33',
          style: 'color: #58637D',
        },
      },
      {
        title: '驳回',
        value: 0,
        props: {
          color: '#FF5B5833',
          style: 'color: #FF5B58',
        },
      },
      {
        title: '已发起',
        value: 1,
        props: {
          color: '#3175FB33',
          style: 'color: #3175FB',
        },
      },
      {
        title: '已完成',
        value: 2,
        props: {
          color: '#83C44733',
          style: 'color: #83C447',
        },
      },
      {
        title: '已超时',
        value: 4,
        props: {
          color: '#FF5B5833',
          style: 'color: #FF5B58',
        },
      },
      {
        title: '已作废',
        value: 5,
        props: {
          color: '#58637D33',
          style: 'color: #58637D',
        },
      },
      {
        title: '线下已发',
        value: 6,
        props: {
          color: '#58637D33',
          style: 'color: #58637D',
        },
      },
    ];

    const checkList = [];
    const [hasApplyRecord, materialRes, chooseMonthRes, records] =
      await Promise.all([
        ctx.model.Record.findOne({
          where: {
            type: 51,
            targetId: orderId,
            houseType: 5,
          },
          order: [['createdAt', 'DESC']],
        }),
        ctx.service.common.runFlowByParams({
          flowId: 'nf57lljtzxj3eyj4', // 获取套内增项已收齐物料数据 TODO: 上线替换线上ID
          orderId: orderId,
          type: 5,
        }),
        getChooseMonth('增项汇总', 'confirmTaoneiZengxiangOrder', {
          type: 54,
          houseType: 2,
        }),
        ctx.model.Record.findAll({
          where: {
            targetId: orderId,
            type: 54,
            houseType: 2,
          },
          order: [['fitUse', 'DESC']],
        }),
      ]);
    const confirmMs = records
      .map((v) =>
        (JSON.parse(v.data || '{}').materials || []).filter((m) => {
          return [2].includes(m.status);
        }),
      )
      .flat();
    const cancelIds = records
      .map((v) =>
        (JSON.parse(v.data || '{}').materials || []).filter((m) => {
          return [7].includes(m.status);
        }),
      )
      .flat()
      .map((v) => v.id);
    const waitConfirmMs = (materialRes.rows || []).filter(
      (v) => !confirmMs.find((m) => m.id == v.id) && !cancelIds.includes(v.id),
    );
    if (!materialRes?.count) {
      checkList.push({
        tip: `该订单没有已收款增项材料，不满足增项业绩发起条件`,
        status: 'error',
      });
    } else {
      const btnHtml = renderButton(
        '选择/查看发起业绩物料',
        {
          handleType: 'runFormatFunction',
          params: {
            flowId: 'aazmqkr49noyur3m',
            defaultCheckList: chooseMaterials,
          },
        },
        { size: 'small', style: 'margin-right: 0;' },
      );

      checkList.push({
        tip: `有${
          waitConfirmMs?.length
        }条待发起增项业绩物料<span style="color: #FF8400;">（已选择<span id="choose-len">${
          isChooseMaterials ? chooseMaterials.length : 0
        }</span>条物料）</span>${btnHtml}`,
        status: 'success',
      });
    }

    checkList.push(...chooseMonthRes.fileCheckList);

    if (hasApplyRecord) {
      if (hasApplyRecord.status === 1) {
        checkList.push({
          status: 'error',
          ignore: true,
          tip: '存在审核中业绩申请，暂时无法再次发起',
        });
      } else if (hasApplyRecord.status === 3) {
        const { reason = '' } = JSON.parse(hasApplyRecord.data || '{}') || {};
        checkList.push({
          status: 'success',
          tip: `存在审核不通过业绩申请，可再次发起; <p style="margin-left: 14px; color: red;">原因: <span style="font-weight: bold;">${reason}</span></p>`,
        });
      }
    }

    let status = 'disabled'; // disabled enabled applyEd
    if (checkList.find((v) => v.status === 'error' && !v.ignore)) {
      status = 'disabled'; // 不可发起
    } else {
      if (hasApplyRecord?.status === 1) {
        status = 'applyEd'; // 已发起
      } else {
        status = 'enabled'; // 可以发起
      }
    }

    const html = `
        <div style = "width: 100%;height: 470px;overflow: auto;padding: 10px;display:flex;gap:10px;flex-wrap:wrap;align-content: flex-start;" class="beauty-scroll" >
          <div style="position: relative; margin-bottom: 14px; display: inline-flex; width: 100%; gap: 21px;">
            <div style="flex: 1; display: flex; align-items: center; border-radius: 4px; padding: 8px 15px; background: #FFF0E9; border: 1px solid #FF5B58;">
              <div style="margin-right: 8px; display: flex; height: 44px; width: 44px; align-items: center; justify-content: center; background-color: #FFDAC9; border-radius: 50%;">
                <span style="background: url('${ctx.helper.getProdFileUrl(
                  '/public/upload/file/13/0/2024-07-19-09-11-50-b7173c7c-58ac-41a4-9dfa-becc0209dbfa.png',
                )}'); background-size: 100%; 100%; width: 17px; height: 22px; margin-top: -1px; display: inline-block;" />
              </div>
              <div style="margin-right: 15px;">
                <div style="
                  font-size: 20px;
                  font-weight: 500;
                  line-height: 14px;
                  color: #FF5B58;
                  margin-bottom: 4px;
                ">
                  ${waitConfirmMs
                    .reduce((acc, cur) => {
                      acc += +cur.amount;
                      return acc;
                    }, 0)
                    .toFixed(2)}
                </div>
                <div style="
                  font-size: 12px;
                  line-height: 14px;
                  color: #17233E;
                ">
                  待确认增项业绩
                </div>
              </div>
              <div >
                <div style="
                  font-size: 20px;
                  font-weight: 500;
                  line-height: 14px;
                  color: #FF5B58;
                  margin-bottom: 4px;
                ">
                  ${waitConfirmMs.length}
                </div>
                <div style="
                  font-size: 12px;
                  line-height: 14px;
                  color: #17233E;
                ">
                  增项材料数
                </div>
              </div>
            </div>
            <div style="flex: 1; display: flex; align-items: center; border-radius: 4px; padding: 8px 15px; background: #E5F6FF; border: 1px solid #3175FB;">
              <div style="margin-right: 10px; display: flex; height: 40px; width: 40px; align-items: center; justify-content: center; background-color: #B7E6FF; border-radius: 50%;">
                <span style="background: url('${ctx.helper.getProdFileUrl(
                  '/public/upload/file/13/0/2024-07-19-09-15-15-acf77172-b235-47af-8297-b577d50103ff.png',
                )}'); background-size: 100%; 100%; width: 17px; height: 22px; margin-top: -1px; display: inline-block;" />
              </div>

              <div style="margin-right: 15px;">
                <div style="
                  font-size: 20px;
                  font-weight: 500;
                  line-height: 14px;
                  color: #3175FB;
                  margin-bottom: 4px;
                ">
                  ${confirmMs
                    .reduce((acc, cur) => {
                      acc += +cur.amount;
                      return acc;
                    }, 0)
                    .toFixed(2)}
                </div>
                <div style="
                  font-size: 12px;
                  line-height: 14px;
                  color: #17233E;
                ">
                  已确认增项业绩
                </div>
              </div>
              <div >
                <div style="
                  font-size: 20px;
                  font-weight: 500;
                  line-height: 14px;
                  color: #3175FB;
                  margin-bottom: 4px;
                ">
                  ${confirmMs.length}
                </div>
                <div style="
                  font-size: 12px;
                  line-height: 14px;
                  color: #17233E;
                ">
                  增项材料数
                </div>
              </div>
            </div>
          </div>

          ${renderCheckList(checkList)}

          ${renderActionByStatus(
            status,
            `
              <div style="width: 100%; padding: 10px 20px; font-size: 16px; font-weight: 500; line-height: 17px; color: #5FB88A; border-radius: 2px; opacity: 1; background: #E9F9EE; border: 1px solid #5FB88A;">
                    订单信息正常${
                      ['designer', 'systemAdmin', 'superAdmin'].includes(
                        role?.type,
                      )
                        ? '，可点击下方按钮发起业绩申请。'
                        : '。'
                    }
                </div>

                <!-- 选择月份 -->
                ${
                  ['designer', 'systemAdmin', 'superAdmin'].includes(role?.type)
                    ? chooseMonthRes.html
                    : ''
                }
                <!-- 确认发起审核按钮 -->
                ${
                  ['designer', 'systemAdmin', 'superAdmin'].includes(role?.type)
                    ? renderButton('己确认无误，申请发起业绩确认', {
                        handleType: 'runFormatFunction',
                        params: {
                          flowId: 'nprvkg9y0wvrftgl',
                          type: 5,
                        },
                      })
                    : ''
                }
            `,
          )}
            ${
              hasApplyRecord?.status === 1
                ? `
              <!-- 业绩申请审核中 展示取消按钮 -->
              <div>
              ${getButton1(
                getIconText('close-fill', '点击取消当前申请', '#00CD66', 20),
                undefined,
                {
                  handleType: 'runFormatFunction',
                  params: {
                    // 取消业绩当前申请
                    flowId: 'csnkmdzf03calv2j',
                  },
                },
              )}
              </div>
            `
                : ''
            }
        </div>
    `;

    return {
      render: {
        handleType: 'showHtml',
        dialogProps: {
          title: '套内增项业绩查询结果',
          width: '580px',
          height: '550px',
          noPadding: true,
          hideFooter: true,
          fitUse: chooseMonthRes.lastMonthStatus.status,
        },
        htmlStr: html,
      },
      status,
      hasApplyRecord,
      chooseMonthRes,
      allMaterials: materialRes.rows,
      debug: {
        chooseMonthRes,
        confirmMs,
        waitConfirmMs,
      },
    };
  }

  // 竣工业绩
  async function getType6View(orderId, newSignRecord) {
    const isBeforeCreatedStatus = [
      {
        title: '未发起',
        value: -1,
        props: {
          color: '#58637D33',
          style: 'color: #58637D',
        },
      },
      {
        title: '驳回',
        value: 0,
        props: {
          color: '#FF5B5833',
          style: 'color: #FF5B58',
        },
      },
      {
        title: '已发起',
        value: 1,
        props: {
          color: '#3175FB33',
          style: 'color: #3175FB',
        },
      },
      {
        title: '已完成',
        value: 2,
        props: {
          color: '#83C44733',
          style: 'color: #83C447',
        },
      },
      {
        title: '已超时',
        value: 4,
        props: {
          color: '#FF5B5833',
          style: 'color: #FF5B58',
        },
      },
      {
        title: '已作废',
        value: 5,
        props: {
          color: '#58637D33',
          style: 'color: #58637D',
        },
      },
      {
        title: '线下已发',
        value: 6,
        props: {
          color: '#58637D33',
          style: 'color: #58637D',
        },
      },
      {
        title: '已作废',
        value: 7,
        props: {
          color: '#58637D33',
          style: 'color: #58637D',
        },
      },
    ];

    const checkList = [];

    if (![1, 2, 3].includes(newSignRecord?.status)) {
      checkList.push({
        tip: '新签业绩未发起，不满足业绩发起条件。',
        status: 'error',
      });
    }

    const [record, hasApplyRecord, chooseMonthRes] = await Promise.all([
      ctx.model.Record.findOne({
        where: {
          targetId: orderId,
          type: 54,
          houseType: 5,
          status: {
            [Op.in]: isBeforeCreatedStatus.map((v) => v.value),
          },
        },
        order: [['fitUse', 'DESC']],
      }),
      ctx.model.Record.findOne({
        where: {
          type: 51,
          targetId: orderId,
          houseType: 6,
        },
        order: [['createdAt', 'DESC']],
      }),
      getChooseMonth('竣工汇总', 'confirmJunGongOrder', {
        type: 54,
        houseType: 5,
      }),
    ]);
    const endNode = projects?.find((v) => v.name === '竣工验收');
    if (endNode?.status === 2) {
      checkList.push({
        tip: `工程已完工`,
        status: 'success',
      });
    } else {
      checkList.push({
        tip: `工程未完工，不满足业绩发起条件。`,
        status: 'error',
      });
    }
    if (!qualityContract?.length) {
      checkList.push({
        tip: `订单未签署质保合同，不满足业绩发起条件。`,
        status: 'error',
      });
    } else {
      checkList.push({
        tip: `订单已签署质保合同`,
        status: 'success',
      });
    }
    const junGongTip = `合同实收款达到: ${decimalToPercent(
      orderDetail.handselAndContractAmount / orderDetail.baseAmonut,
    )}`;
    // 竣工使用竣工额
    if (orderDetail.handselAndContractAmount / orderDetail.baseAmonut >= 1) {
      checkList.push({
        tip: junGongTip,
        status: 'success',
      });
    } else {
      checkList.push({
        tip: `${junGongTip}，不符合业绩发起条件。如有问题请联系管理员`,
        status: 'error',
      });
    }
    checkList.push(...chooseMonthRes.fileCheckList);

    let hasLastRecord = null;
    if (record) {
      const lastState = isBeforeCreatedStatus.find(
        ({ value }) => value === record.status,
      );
      const fitUse = `${record.fitUse}`;

      if (lastState !== -1) {
        const lastFitUse = `${fitUse.slice(0, 4)}年${fitUse.slice(4)}月`;

        checkList.push({
          status: 'error',
          tip: `订单已发起过确认,确认月份: ${lastFitUse}，状态为<span
          style="
            margin-left: 5px;
            border-radius: 4px;
            display: inline-block;
            line-height: 21px;
            height: 21px;
            padding: 0 7px;
            background-color: ${lastState.props.color};
            ${lastState.props.style};
          "
        >
          ${lastState?.title}
        </span>`,
        });
        hasLastRecord = record;
      } else {
        checkList.push({
          status: 'success',
          tip: '订单未发起过确认～',
        });
      }
    } else {
      checkList.push({
        status: 'success',
        tip: '订单未发起过确认！',
      });
    }

    if (hasApplyRecord) {
      if (hasApplyRecord.status === 1) {
        checkList.push({
          status: 'error',
          ignore: true,
          tip: '存在审核中业绩申请，暂时无法再次发起',
        });
      } else if (hasApplyRecord.status === 3) {
        const { reason = '' } = JSON.parse(hasApplyRecord.data || '{}') || {};
        checkList.push({
          status: 'success',
          tip: `存在审核不通过业绩申请，可再次发起; <p style="margin-left: 14px; color: red;">原因: <span style="font-weight: bold;">${reason}</span></p>`,
        });
      }
    }

    let status = 'disabled'; // disabled enabled applyEd
    if (checkList.find((v) => v.status === 'error' && !v.ignore)) {
      status = 'disabled'; // 不可发起
      if (hasLastRecord) {
        status = 'done'; // 往月已经发起了，不可再此发起
      }
    } else {
      if (hasApplyRecord?.status === 1) {
        status = 'applyEd'; // 已发起
      } else {
        status = 'enabled'; // 可以发起
      }
    }

    async function getDetailProp(orderId, hasLastRecord, hasApplyRecord) {
      let detailProps = null;
      if (hasLastRecord || hasApplyRecord?.status === 1) {
        const recordId = hasLastRecord?.id || null;
        const fileId = JSON.parse(hasLastRecord?.data || '{}')?.fileId || null;
        const rowData = {
          id: orderId,
        };
        rowData.recordId = recordId;
        const params = {
          flowId: 'hnx6y7w8he51yfvv', // 获取竣工业绩 详情  TODO: 上线修改获取ID
          rowData: JSON.stringify(rowData),
          user_type: 1,
        };
        if (fileId) params.fileId = fileId;

        const res = await ctx.service.common.runFlowByParams(params);
        detailProps = {
          res,
          pageJsonData: {
            // id: "c5u6w21axhpi8rl9",
            type: 'wujie',
            config: {},
            customConfig: {
              src: 'performance/personDetail',
            },
          },
          dialogType: 'xxxxxxx',
          showFooter: false,
          width: '1200px',
          title: `${res?.month}竣工业绩确认 ${res?.order?.number}`,
          formDataKey: 'customerId',
          'no-click-animation': true,
          persistent: true,
          height: '80vh',
          params: {
            order: `${JSON.stringify(res?.order)}`,
            amount: `${JSON.stringify(res?.amount)}`,
            record: `${JSON.stringify(res?.record)}`,
            type: 'watch',
            user_type: 2,
            performanceType: 6,
          },
        };
      }
      return detailProps;
    }

    const detailProps = await getDetailProp(
      orderId,
      hasLastRecord,
      hasApplyRecord,
    );

    function getPerDetailButton() {
      return `
        ${getButton1(
          getIconText('info', '查看业绩详情', '#00CD66', 20),
          undefined,
          {
            handleType: 'runFormatFunction',
            params: {
              flowId: 'ljdr37vejf3lkxqr',
            },
          },
        )}
    `;
    }

    const html = `
        <div style = "width: 100%;height: 470px;overflow: auto;padding: 10px;display:flex;gap:10px;flex-wrap:wrap;align-content: flex-start;" class="beauty-scroll" >
          ${renderCheckList(checkList)}

          ${renderActionByStatus(
            status,
            `
              <div style="width: 100%; padding: 10px 20px; font-size: 16px; font-weight: 500; line-height: 17px; color: #5FB88A; border-radius: 2px; opacity: 1; background: #E9F9EE; border: 1px solid #5FB88A;">
                  订单信息正常${
                    ['designer', 'systemAdmin', 'superAdmin'].includes(
                      role?.type,
                    )
                      ? '，可点击下方按钮发起业绩申请。'
                      : '。'
                  }
              </div>

              <!-- 选择月份 -->
              ${
                ['designer', 'systemAdmin', 'superAdmin'].includes(role?.type)
                  ? chooseMonthRes.html
                  : ''
              }
              <!-- 确认发起审核按钮 -->
              ${
                ['designer', 'systemAdmin', 'superAdmin'].includes(role?.type)
                  ? renderButton('己确认无误，申请发起业绩确认', {
                      handleType: 'runFormatFunction',
                      params: {
                        flowId: 'nprvkg9y0wvrftgl',
                        type: 6,
                      },
                    })
                  : ''
              }
            `,
          )}
            ${
              hasApplyRecord?.status === 1
                ? `
              <!-- 业绩申请审核中 展示取消按钮 -->
              <div>
              ${getButton1(
                getIconText('close-fill', '点击取消当前申请', '#00CD66', 20),
                undefined,
                {
                  handleType: 'runFormatFunction',
                  params: {
                    // 取消业绩当前申请
                    flowId: 'csnkmdzf03calv2j',
                  },
                },
              )}
              </div>
            `
                : ''
            }

            ${
              hasLastRecord || hasApplyRecord?.status === 1
                ? getPerDetailButton()
                : ''
            }
        </div>
    `;

    return {
      render: {
        handleType: 'showHtml',
        dialogProps: {
          title: '竣工业绩查询结果',
          width: '580px',
          height: '550px',
          noPadding: true,
          hideFooter: true,
          props: detailProps,
          fitUse: chooseMonthRes.lastMonthStatus.status,
        },
        htmlStr: html,
      },
      status,
      hasApplyRecord,
      chooseMonthRes,
      debug: {
        chooseMonthRes,
      },
    };
  }

  // 新签业绩 相关数据
  const type1View = await getType1View(
    orderId,
    orderInfo.designPrice,
    body.isChooseContractFile,
    body.relationContractFile,
  );

  const [
    // 开工
    type2View,
    // 套外
    type3View,
    // 设计费
    type4View,
    // 套内增项
    type5View,
    // 竣工
    type6View,
  ] = await Promise.all([
    // 开工
    getType2View(orderId, orderTotalPrice, type1View.hasLastRecord),
    // 套外
    getType3View(orderId, !!+body.isChooseOutMaterials, body.materials),
    // 设计费
    getType4View(orderId, orderInfo.designPrice),
    // 套内增项
    getType5View(orderId, !!+body.isChooseAddMaterials, body.materials),
    // 竣工
    getType6View(orderId, type1View.hasLastRecord),
  ]);

  const showType = +body.showType;
  const showViewData = [
    // 新签业绩 相关数据
    type1View,
    // 开工
    type2View,
    // 套外
    type3View,
    // 设计费
    type4View,
    // 套内增项
    type5View,
    // 竣工
    type6View,
  ][showType - 1];

  const domain = ctx.helper.webUrl
    ? ctx.helper.webUrl()
    : ctx.helper.getCodeUrl();

  if (body.isConfirmApply === 1) {
    // 发起[开工|竣工]业绩确认申请 showType === 2 | showType === 6
    async function addKaiGongOrJunGongApply(
      showType,
      order,
      fitUse,
      totalPrice,
      newSignRecord,
    ) {
      const orderId = order.id;
      const adminId = (await ctx.helper.getMsg(ctx)).id;

      const area = order.area;
      const customer = order.customer;

      const designPrice = +order.designPrice;
      const firstPrice = +order.firstPrice;

      let [
        // 特殊优惠金额
        { specTaskCount: taskCount, specialOfferAmount, tasks },
        department,
        saleDepartment,
        /**
         * 首期系统应收款
         */
        contractTotalAmount = 0,
        // 退款总金额
        { ids: refundIds, amount: refundAmount, count: refundCount },
        /**
         * 设计费实收金额
         */
        designPriceAmount = 0,
      ] = await Promise.all([
        getSpecialOfferAmount(orderId),
        findType6Department(customer.designGroupId),
        findType6Department(customer.saleGroupId),
        getFirstRealReceiveAmountTotal(orderId, [302]),
        getRefundAmounts(orderId),
        getDesignPriceAmount(orderId),
      ]);

      designPriceAmount -= refundAmount.refundAmount403;

      contractTotalAmount -= refundAmount.refundAmount402;
      contractTotalAmount -= refundAmount.refundAmount401;

      const { amount: { upstairsFee = 0, remoteFee = 0 } = {} } =
        JSON.parse(newSignRecord?.data || '{}') || {};
      const effectivePerformanceAmount =
        totalPrice - specialOfferAmount - upstairsFee - remoteFee;

      const amount = {
        // 设计费
        designFee: parseInt(designPrice),
        // 设计费实收金额
        designPriceAmount: +(+designPriceAmount).toFixed(0),
        // 签单额度
        signingAmount: parseInt(totalPrice),
        // 合同款累计实收
        contractTotalAmount: parseInt(contractTotalAmount),
        // 合同款累计实收比例
        contractTotalAmountRate: +String(
          ((+contractTotalAmount / +totalPrice) * 100) / 100,
        ).replace(/.\d+$/, (match, $1) => match.slice(0, 5)),
        // 特殊优惠金额
        specialOfferAmount: parseInt(specialOfferAmount),
        // 竣工额
        totalPrice: order.totalPrice || 0,
        // 生效业绩额（元）
        effectivePerformanceAmount: parseInt(effectivePerformanceAmount),
        upstairsFee,
        remoteFee,

        // 退款总金额
        refundAmount: parseInt(refundAmount.refundAmount),
        // 401 退款定金
        refundAmount401: parseInt(refundAmount.refundAmount401),
        // 402 退款合同款
        refundAmount402: parseInt(refundAmount.refundAmount402),
        // 403 退款设计费
        refundAmount403: parseInt(refundAmount.refundAmount403),
      };

      const jsonDataObj = {
        fileId: null,
        fitUse,
        id: orderId,
        order_number: order.number,
        orderStatus: order?.status,
        customer: {
          department: department?.name ?? '',
          departmentId: department?.id ?? '',

          designDepartment: department?.name ?? '',
          designDepartmentId: department?.id ?? '',
          designGroupName: customer.designGroupName,
          designGroupId: customer.designGroupId,
          designLeaderName: customer.designLeaderName,
          designerName: customer.designerName,
          designerId: customer.designerId,

          saleDepartment: saleDepartment?.name ?? '',
          saleDepartmentId: saleDepartment?.id ?? '',
          saleGroupName: customer.saleGroupName,
          saleGroupId: customer.saleGroupId,
          saleLeaderName: customer.saleLeaderName,
          salerId: customer.salerId,
          salerName: customer.salerName,

          noSalePersonName: order.noSalePersonName,
          noSalePersonId: order.noSalePersonInfo?.id,

          name: customer.name,
          mobile: customer.mobile,
          id: customer.id,
          customerChannel: customer.source,
          customerSignType: order.productName ?? '',
          type: customer.type,
          area,
        },
        amount,
        refundIds,
        taskCount,
        refundCount,
      };

      // 添加业绩申请
      const newRecord = await ctx.service.base.create({
        model: 'Record',
        body: {
          type: 51,
          adminId,
          data: JSON.stringify(jsonDataObj),
          status: 1,
          targetId: orderId,
          houseType: showType,
        },
      });

      await ctx.service.notice.create({
        type: 22,
        targetId: newRecord.id,
        userIds: [1180, 2], // 测试环境 固定 zy TODO: 上线修改 uid
        title: `设计师${
          jsonDataObj.customer.designerName || '-'
        }发起业绩确认申请，快去审核吧～`,
        description: `<div class="highlight">【客户姓名】:${
          jsonDataObj.customer.name
        }</div><div class="highlight">【客户电话】:${
          jsonDataObj.customer.mobile ?? '-'
        }</div><div class="highlight">【订单号】:${
          jsonDataObj.order_number || '无'
        }</div>`,
        url: `${domain}/m/#/pgds/confirmOrder/dbefjm38r9zjwxks`,
        btnText: '查看',
      });

      return getTipText(
        'success',
        `订单${showType === 2 ? '开工' : '竣工'}业绩申请已发起，请等待审核`,
        `订单${showType === 2 ? '开工' : '竣工'}业绩申请已发起，请等待审核`,
      );
    }

    if (showType) {
      const fitUse =
        body.formData?.month ||
        (showViewData.chooseMonthRes.nowMonthStatus.status === 'success'
          ? showViewData.chooseMonthRes.nowMonthStatus.date
          : '') ||
        (showViewData.chooseMonthRes.lastMonthStatus.status === 'success'
          ? showViewData.chooseMonthRes.lastMonthStatus.date
          : '');
      if (showType === 1) {
        // 发起新签业绩确认
        async function applyNewSign(
          order,
          bodyFormData,
          fitUse,
          totalPrice,
          relationContractFile,
        ) {
          const orderId = order.id;
          const adminId = (await ctx.helper.getMsg(ctx)).id;

          const area = order.area;
          const customer = order.customer;

          const designPrice = +order.designPrice;
          const firstPrice = +order.firstPrice;

          const upstairsFee = +(bodyFormData?.upFee || 0);
          const remoteFee = +(bodyFormData?.remoteFee || 0);

          // 特殊优惠金额
          let [
            { specTaskCount: taskCount, specialOfferAmount, tasks },
            department,
            saleDepartment,
            /**
             * 首期系统应收款
             */
            theFirstInstallmentIsReceivedByTheSystem = 0,
            // 退款总金额
            { ids: refundIds, amount: refundAmount, count: refundCount },
            /**
             * 设计费实收金额
             */
            designPriceAmount = 0,
          ] = await Promise.all([
            getSpecialOfferAmount(orderId),
            findType6Department(customer.designGroupId),
            findType6Department(customer.saleGroupId),
            getFirstRealReceiveAmountTotal(orderId),
            getRefundAmounts(orderId),
            getDesignPriceAmount(orderId),
          ]);

          designPriceAmount -= refundAmount.refundAmount403;

          theFirstInstallmentIsReceivedByTheSystem -=
            refundAmount.refundAmount402;
          theFirstInstallmentIsReceivedByTheSystem -=
            refundAmount.refundAmount401;

          const effectivePerformanceAmount =
            totalPrice - specialOfferAmount - upstairsFee - remoteFee;

          const amount = {
            // 设计费
            designFee: parseInt(designPrice),
            // 首签额
            firstSignatureAmount: parseInt(firstPrice),
            // 签单
            signingAmount: parseInt(totalPrice),
            // 首期款系统实收
            theFirstInstallmentIsReceivedByTheSystem: parseInt(
              theFirstInstallmentIsReceivedByTheSystem,
            ),
            // 首期款实收比例
            firstPeriodRate: +String(
              ((+theFirstInstallmentIsReceivedByTheSystem / +totalPrice) *
                100) /
                100,
            ).replace(/.\d+$/, (match, $1) => match.slice(0, 5)),
            // 设计费实收金额
            designPriceAmount: +(+designPriceAmount).toFixed(0),
            // 上楼费
            upstairsFee: parseInt(upstairsFee),
            // 远程费
            remoteFee: parseInt(remoteFee),
            // 特殊优惠金额
            specialOfferAmount: parseInt(specialOfferAmount),
            // 生效业绩额（元）
            effectivePerformanceAmount: parseInt(effectivePerformanceAmount),
            // 退款总金额
            refundAmount: parseInt(refundAmount.refundAmount),
            // 401 退款定金
            refundAmount401: parseInt(refundAmount.refundAmount401),
            // 402 退款合同款
            refundAmount402: parseInt(refundAmount.refundAmount402),
            // 403 退款设计费
            refundAmount403: parseInt(refundAmount.refundAmount403),
          };

          const jsonDataObj = {
            fileId: null,
            fitUse,
            id: orderId,
            order_number: order.number,
            orderStatus: order?.status,
            relationNumber: orderInfo.relationNumber,
            customer: {
              department: department?.name ?? '',
              departmentId: department?.id ?? '',

              designDepartment: department?.name ?? '',
              designDepartmentId: department?.id ?? '',
              designGroupName: customer.designGroupName,
              designGroupId: customer.designGroupId,
              designLeaderName: customer.designLeaderName,
              designerName: customer.designerName,
              designerId: customer.designerId,

              saleDepartment: saleDepartment?.name ?? '',
              saleDepartmentId: saleDepartment?.id ?? '',
              saleGroupName: customer.saleGroupName,
              saleGroupId: customer.saleGroupId,
              saleLeaderName: customer.saleLeaderName,
              salerId: customer.salerId,
              salerName: customer.salerName,

              noSalePersonName: order.noSalePersonName,
              noSalePersonId: order.noSalePersonInfo?.id,

              name: customer.name,
              mobile: customer.mobile,
              id: customer.id,
              customerChannel: customer.source,
              customerSignType: order.productName ?? '',
              type: customer.type,
              area,
            },
            amount,
            refundIds,
            taskCount,
            refundCount,
          };

          if (orderInfo.relationNumber && relationContractFile) {
            jsonDataObj.relationContractDate =
              relationContractFile?.fileCreatedAt;
            jsonDataObj.relationContractFile = {
              url: relationContractFile?.fileUrl,
              name: relationContractFile?.name,
              id: relationContractFile?.id,
            };
          }
          // 添加业绩申请
          // type 51 业绩确认申请 targetId 订单id data 确认信息数据 status 1 审核中  2  通过  3 不通过 0 取消
          const newRecord = await ctx.service.base.create({
            model: 'Record',
            body: {
              type: 51,
              adminId,
              data: JSON.stringify(jsonDataObj),
              status: 1,
              targetId: orderId,
              // houseType: null & 1 新签业绩申请 2 开工业绩申请 3 套外业绩申请 4 设计费业绩申请  5 套内增项业绩申请 6 竣工业绩申请
              houseType: showType,
            },
          });

          await ctx.service.notice.create({
            type: 22,
            targetId: newRecord.id,
            userIds: [1180, 2], // 测试环境 固定 zy TODO: 上线修改 uid
            title: `设计师${
              jsonDataObj.customer.designerName || '-'
            }发起业绩确认申请，快去审核吧～`,
            description: `<div class="highlight">【客户姓名】:${
              jsonDataObj.customer.name
            }</div><div class="highlight">【客户电话】:${
              jsonDataObj.customer.mobile ?? '-'
            }</div><div class="highlight">【订单号】:${
              jsonDataObj.order_number || '无'
            }</div>`,
            url: `${domain}/m/#/pgds/confirmOrder/dbefjm38r9zjwxks`,
            btnText: '查看',
          });

          return getTipText(
            'success',
            '订单业绩申请已发起，请等待审核',
            '订单业绩申请已发起，请等待审核',
          );
        }

        return await applyNewSign(
          orderInfo,
          body.formData || {},
          fitUse,
          orderTotalPrice,
          // orderInfo.relationNumber
          body.relationContractFile,
        );
      } else if (showType === 2) {
        // 发起 开工业绩确认
        return await addKaiGongOrJunGongApply(
          showType,
          orderInfo,
          fitUse,
          orderTotalPrice,
          type1View.hasLastRecord,
        );
      } else if (showType === 3) {
        // 发起 套外业绩确认
        async function addOutsApply(
          order,
          fitUse,
          totalPrice,
          materialIds,
          allMaterials,
        ) {
          const orderId = order.id;
          const adminId = (await ctx.helper.getMsg(ctx)).id;

          const area = order.area;
          const customer = order.customer;

          const designPrice = +order.designPrice;

          let [
            // 特殊优惠金额
            { specialOfferAmount },
            department,
            saleDepartment,
            // 退款总金额
            { ids: refundIds, amount: refundAmount, count: refundCount },
            /**
             * 设计费实收金额
             */
            designPriceAmount = 0,
            /**
             * 首期系统应收款
             */
            contractTotalAmount = 0,
          ] = await Promise.all([
            getSpecialOfferAmount(orderId),
            findType6Department(customer.designGroupId),
            findType6Department(customer.saleGroupId),
            getRefundAmounts(orderId),
            getDesignPriceAmount(orderId),
            getFirstRealReceiveAmountTotal(orderId, [302]),
          ]);

          designPriceAmount -= refundAmount.refundAmount403;

          contractTotalAmount -= refundAmount.refundAmount402;
          contractTotalAmount -= refundAmount.refundAmount401;

          const amount = {
            // 设计费
            designFee: parseInt(designPrice),
            // 设计费实收金额
            designPriceAmount: +(+designPriceAmount).toFixed(0),
            designPriceTime: Date.now(), // TODO: 替换时间
            // 签单额度
            signingAmount: parseInt(totalPrice),
            // 合同款累计实收
            contractTotalAmount: parseInt(contractTotalAmount),
            // 合同款累计实收比例
            contractTotalAmountRate: +String(
              ((+contractTotalAmount / +totalPrice) * 100) / 100,
            ).replace(/.\d+$/, (match, $1) => match.slice(0, 5)),
            // 特殊优惠金额
            specialOfferAmount: parseInt(specialOfferAmount),
            // 竣工额
            totalPrice: order.totalPrice || 0,

            // 退款总金额
            refundAmount: parseInt(refundAmount.refundAmount),
            // 401 退款定金
            refundAmount401: parseInt(refundAmount.refundAmount401),
            // 402 退款合同款
            refundAmount402: parseInt(refundAmount.refundAmount402),
            // 403 退款设计费
            refundAmount403: parseInt(refundAmount.refundAmount403),
          };

          const materials = allMaterials.filter((m) => {
            return materialIds.map(Number).includes(m.id);
          });

          const jsonDataObj = {
            fileId: null,
            fitUse,
            id: orderId,
            order_number: order.number,
            orderStatus: order?.status,
            customer: {
              department: department?.name ?? '',
              departmentId: department?.id ?? '',

              designDepartment: department?.name ?? '',
              designDepartmentId: department?.id ?? '',
              designGroupName: customer.designGroupName,
              designGroupId: customer.designGroupId,
              designLeaderName: customer.designLeaderName,
              designerName: customer.designerName,
              designerId: customer.designerId,

              saleDepartment: saleDepartment?.name ?? '',
              saleDepartmentId: saleDepartment?.id ?? '',
              saleGroupName: customer.saleGroupName,
              saleGroupId: customer.saleGroupId,
              saleLeaderName: customer.saleLeaderName,
              salerId: customer.salerId,
              salerName: customer.salerName,

              noSalePersonName: order.noSalePersonName,
              noSalePersonId: order.noSalePersonInfo?.id,

              name: customer.name,
              mobile: customer.mobile,
              id: customer.id,
              customerChannel: customer.source,
              customerSignType: order.productName ?? '',
              type: customer.type,
              area,
            },
            amount,
            refundIds,
            refundCount,
            materials,
          };

          // 添加业绩申请
          const newRecord = await ctx.service.base.create({
            model: 'Record',
            body: {
              type: 51,
              adminId,
              data: JSON.stringify(jsonDataObj),
              status: 1,
              targetId: orderId,
              houseType: showType,
            },
          });

          await ctx.service.notice.create({
            type: 22,
            targetId: newRecord.id,
            userIds: [1180, 2], // 测试环境 固定 zy TODO: 上线修改 uid
            title: `设计师${
              jsonDataObj.customer.designerName || '-'
            }发起业绩确认申请，快去审核吧～`,
            description: `<div class="highlight">【客户姓名】:${
              jsonDataObj.customer.name
            }</div><div class="highlight">【客户电话】:${
              jsonDataObj.customer.mobile ?? '-'
            }</div><div class="highlight">【订单号】:${
              jsonDataObj.order_number || '无'
            }</div>`,
            url: `${domain}/m/#/pgds/confirmOrder/dbefjm38r9zjwxks`,
            btnText: '查看',
          });

          return getTipText(
            'success',
            '订单套外业绩申请已发起，请等待审核',
            '订单套外业绩申请已发起，请等待审核',
          );
        }
        return await addOutsApply(
          orderInfo,
          fitUse,
          orderTotalPrice,
          body.materials,
          type3View.allMaterials,
        );
      } else if (showType === 4) {
        // 发起 设计费业绩确认
        async function addDesignFeeApply(order, fitUse, totalPrice) {
          const orderId = order.id;
          const adminId = (await ctx.helper.getMsg(ctx)).id;

          const area = order.area;
          const customer = order.customer;

          const designPrice = +order.designPrice;

          let [
            // 特殊优惠金额
            { specialOfferAmount },
            department,
            saleDepartment,
            // 退款总金额
            { ids: refundIds, amount: refundAmount, count: refundCount },
            /**
             * 设计费实收金额
             */
            designPriceAmount = 0,
            /**
             * 首期系统应收款
             */
            contractTotalAmount = 0,
          ] = await Promise.all([
            getSpecialOfferAmount(orderId),
            findType6Department(customer.designGroupId),
            findType6Department(customer.saleGroupId),
            getRefundAmounts(orderId),
            getDesignPriceAmount(orderId),
            getFirstRealReceiveAmountTotal(orderId, [302]),
          ]);

          designPriceAmount -= refundAmount.refundAmount403;

          contractTotalAmount -= refundAmount.refundAmount402;
          contractTotalAmount -= refundAmount.refundAmount401;

          const amount = {
            // 设计费
            designFee: parseInt(designPrice),
            // 设计费实收金额
            designPriceAmount: +(+designPriceAmount).toFixed(0),
            designPriceTime: Date.now(), // TODO: 替换时间
            // 签单额度
            signingAmount: parseInt(totalPrice),
            // 合同款累计实收
            contractTotalAmount: parseInt(contractTotalAmount),
            // 合同款累计实收比例
            contractTotalAmountRate: +String(
              ((+contractTotalAmount / +totalPrice) * 100) / 100,
            ).replace(/.\d+$/, (match, $1) => match.slice(0, 5)),
            // 特殊优惠金额
            specialOfferAmount: parseInt(specialOfferAmount),
            // 竣工额
            totalPrice: order.totalPrice || 0,

            // 退款总金额
            refundAmount: parseInt(refundAmount.refundAmount),
            // 401 退款定金
            refundAmount401: parseInt(refundAmount.refundAmount401),
            // 402 退款合同款
            refundAmount402: parseInt(refundAmount.refundAmount402),
            // 403 退款设计费
            refundAmount403: parseInt(refundAmount.refundAmount403),
          };

          const jsonDataObj = {
            fileId: null,
            fitUse,
            id: orderId,
            order_number: order.number,
            orderStatus: order?.status,
            customer: {
              department: department?.name ?? '',
              departmentId: department?.id ?? '',

              designDepartment: department?.name ?? '',
              designDepartmentId: department?.id ?? '',
              designGroupName: customer.designGroupName,
              designGroupId: customer.designGroupId,
              designLeaderName: customer.designLeaderName,
              designerName: customer.designerName,
              designerId: customer.designerId,

              saleDepartment: saleDepartment?.name ?? '',
              saleDepartmentId: saleDepartment?.id ?? '',
              saleGroupName: customer.saleGroupName,
              saleGroupId: customer.saleGroupId,
              saleLeaderName: customer.saleLeaderName,
              salerId: customer.salerId,
              salerName: customer.salerName,

              noSalePersonName: order.noSalePersonName,
              noSalePersonId: order.noSalePersonInfo?.id,

              name: customer.name,
              mobile: customer.mobile,
              id: customer.id,
              customerChannel: customer.source,
              customerSignType: order.productName ?? '',
              type: customer.type,
              area,
            },
            amount,
            refundIds,
            refundCount,
          };

          // 添加业绩申请
          const newRecord = await ctx.service.base.create({
            model: 'Record',
            body: {
              type: 51,
              adminId,
              data: JSON.stringify(jsonDataObj),
              status: 1,
              targetId: orderId,
              houseType: showType,
            },
          });

          await ctx.service.notice.create({
            type: 22,
            targetId: newRecord.id,
            userIds: [1180, 2], // 测试环境 固定 zy TODO: 上线修改 uid
            title: `设计师${
              jsonDataObj.customer.designerName || '-'
            }发起业绩确认申请，快去审核吧～`,
            description: `<div class="highlight">【客户姓名】:${
              jsonDataObj.customer.name
            }</div><div class="highlight">【客户电话】:${
              jsonDataObj.customer.mobile ?? '-'
            }</div><div class="highlight">【订单号】:${
              jsonDataObj.order_number || '无'
            }</div>`,
            url: `${domain}/m/#/pgds/confirmOrder/dbefjm38r9zjwxks`,
            btnText: '查看',
          });

          return getTipText(
            'success',
            '订单设计费业绩申请已发起，请等待审核',
            '订单设计费业绩申请已发起，请等待审核',
          );
        }
        return await addDesignFeeApply(orderInfo, fitUse, orderTotalPrice);
      } else if (showType === 5) {
        // 发起 套内增项业绩确认
        async function addAddsApply(
          order,
          fitUse,
          totalPrice,
          materialIds,
          allMaterials,
        ) {
          const orderId = order.id;
          const adminId = (await ctx.helper.getMsg(ctx)).id;

          const area = order.area;
          const customer = order.customer;

          const designPrice = +order.designPrice;

          let [
            // 特殊优惠金额
            { specialOfferAmount },
            department,
            saleDepartment,
            // 退款总金额
            { ids: refundIds, amount: refundAmount, count: refundCount },
            /**
             * 设计费实收金额
             */
            designPriceAmount = 0,
            /**
             * 首期系统应收款
             */
            contractTotalAmount = 0,
          ] = await Promise.all([
            getSpecialOfferAmount(orderId),
            findType6Department(customer.designGroupId),
            findType6Department(customer.saleGroupId),
            getRefundAmounts(orderId),
            getDesignPriceAmount(orderId),
            getFirstRealReceiveAmountTotal(orderId, [302]),
          ]);

          designPriceAmount -= refundAmount.refundAmount403;

          contractTotalAmount -= refundAmount.refundAmount402;
          contractTotalAmount -= refundAmount.refundAmount401;

          const amount = {
            // 设计费
            designFee: parseInt(designPrice),
            // 设计费实收金额
            designPriceAmount: +(+designPriceAmount).toFixed(0),
            designPriceTime: Date.now(), // TODO: 替换时间
            // 签单额度
            signingAmount: parseInt(totalPrice),
            // 合同款累计实收
            contractTotalAmount: parseInt(contractTotalAmount),
            // 合同款累计实收比例
            contractTotalAmountRate: +String(
              ((+contractTotalAmount / +totalPrice) * 100) / 100,
            ).replace(/.\d+$/, (match, $1) => match.slice(0, 5)),
            // 特殊优惠金额
            specialOfferAmount: parseInt(specialOfferAmount),
            // 竣工额
            totalPrice: order.totalPrice || 0,

            // 退款总金额
            refundAmount: parseInt(refundAmount.refundAmount),
            // 401 退款定金
            refundAmount401: parseInt(refundAmount.refundAmount401),
            // 402 退款合同款
            refundAmount402: parseInt(refundAmount.refundAmount402),
            // 403 退款设计费
            refundAmount403: parseInt(refundAmount.refundAmount403),
          };

          const materials = allMaterials.filter((m) => {
            return materialIds.map(Number).includes(m.id);
          });

          const jsonDataObj = {
            fileId: null,
            fitUse,
            id: orderId,
            order_number: order.number,
            orderStatus: order?.status,
            customer: {
              department: department?.name ?? '',
              departmentId: department?.id ?? '',

              designDepartment: department?.name ?? '',
              designDepartmentId: department?.id ?? '',
              designGroupName: customer.designGroupName,
              designGroupId: customer.designGroupId,
              designLeaderName: customer.designLeaderName,
              designerName: customer.designerName,
              designerId: customer.designerId,

              saleDepartment: saleDepartment?.name ?? '',
              saleDepartmentId: saleDepartment?.id ?? '',
              saleGroupName: customer.saleGroupName,
              saleGroupId: customer.saleGroupId,
              saleLeaderName: customer.saleLeaderName,
              salerId: customer.salerId,
              salerName: customer.salerName,

              noSalePersonName: order.noSalePersonName,
              noSalePersonId: order.noSalePersonInfo?.id,

              name: customer.name,
              mobile: customer.mobile,
              id: customer.id,
              customerChannel: customer.source,
              customerSignType: order.productName ?? '',
              type: customer.type,
              area,
            },
            amount,
            refundIds,
            refundCount,
            materials,
          };

          // 添加业绩申请
          const newRecord = await ctx.service.base.create({
            model: 'Record',
            body: {
              type: 51,
              adminId,
              data: JSON.stringify(jsonDataObj),
              status: 1,
              targetId: orderId,
              houseType: showType,
            },
          });

          await ctx.service.notice.create({
            type: 22,
            targetId: newRecord.id,
            userIds: [1180, 2], // 测试环境 固定 zy TODO: 上线修改 uid
            title: `设计师${
              jsonDataObj.customer.designerName || '-'
            }发起业绩确认申请，快去审核吧～`,
            description: `<div class="highlight">【客户姓名】:${
              jsonDataObj.customer.name
            }</div><div class="highlight">【客户电话】:${
              jsonDataObj.customer.mobile ?? '-'
            }</div><div class="highlight">【订单号】:${
              jsonDataObj.order_number || '无'
            }</div>`,
            url: `${domain}/m/#/pgds/confirmOrder/dbefjm38r9zjwxks`,
            btnText: '查看',
          });

          return getTipText(
            'success',
            '订单增项业绩申请已发起，请等待审核',
            '订单增项业绩申请已发起，请等待审核',
          );
        }
        return await addAddsApply(
          orderInfo,
          fitUse,
          orderTotalPrice,
          body.materials,
          type5View.allMaterials,
        );
      } else if (showType === 6) {
        // 发起 竣工业绩确认
        return await addKaiGongOrJunGongApply(
          showType,
          orderInfo,
          fitUse,
          orderTotalPrice,
          type1View.hasLastRecord,
        );
      }
    }
  }

  // 弹出 发起业绩申请二次确认弹窗
  if (body.showConfirm === 1) {
    return {
      handleType: 'showConfirm',
      confirmProps: {
        title: '确认发起业绩确认',
        tipText: '业绩确认无误，确认发起业绩？',
        confirmSendKey: 'isConfirmApply',
      },
    };
  }

  // 取消新签业绩确认申请
  if (body.isConfirmCancel === 1) {
    if (!showViewData.hasApplyRecord) {
      return {
        handleError: '业绩申请不存在',
      };
    }
    if (showViewData.hasApplyRecord.status !== 1) {
      return {
        handleError: '业绩申请不可取消',
      };
    }
    return ctx.service.common.runFlowByParams({
      flowId: 'zgbqtwm1oyqglt6a', // 取消业绩申请 TODO: 上线替换线上ID
      id: showViewData.hasApplyRecord.id,
    });
  }

  // 弹出 取消业绩申请二次确认弹窗
  if (body.showCancelConfirm === 1) {
    return {
      handleType: 'showConfirm',
      confirmProps: {
        title: '确认取消当前业绩申请',
        tipText: '确定要取消当前业绩申请吗？(如有信息错误，可重新发起)',
        confirmSendKey: 'isConfirmCancel',
      },
    };
  }

  // 二次弹窗确认是否选择这些物料
  // if (body.isChooseOutMaterials) {
  //   return {
  //     handleType: 'showConfirm',
  //     confirmProps: {
  //       title: '确认选择物料',
  //       tipText: `确认选择这${body.materials.length}条物料吗？`,
  //       confirmSendKey: 'isConfirmChooseMaterials',
  //     },
  //   };
  // }

  if (!showType) {
    // disabled 不可发起 enabled 待发起（可以发起） applyEd 已发起 some-enabled 有待发起
    function getViewStatusProps(viewStatus) {
      return {
        color: {
          disabled: '#FF5B58',
          'some-enabled': '#FF5B58',
          enabled: '#FF8400',
          applyEd: '#5FB88A',
          done: '#5FB88A',
        }[viewStatus],
        text: {
          disabled: '暂无发起',
          'some-enabled': '有待发起',
          enabled: '待发起',
          applyEd: '已发起',
          done: '已完成',
        }[viewStatus],
        bgColor: {
          disabled: '#FF5B5833',
          'some-enabled': '#FF5B5833',
          enabled: '#FF840033',
          applyEd: '#5FB88A33',
          done: '#5FB88A33',
        }[viewStatus],
      };
    }

    const views = [
      {
        type: 1,
        title: '新签业绩',
        icon: ctx.helper.getProdFileUrl(
          '/public/upload/file/13/0/2024-07-18-10-43-15-35c3d9ce-9bf2-4f7e-9770-565faa11b48e-100x100.png',
        ),
        statusProps: getViewStatusProps(type1View.status),
      },
      {
        type: 2,
        title: '开工业绩',
        icon: ctx.helper.getProdFileUrl(
          '/public/upload/file/13/0/2024-07-18-10-43-15-c1e36440-866f-4ede-9466-8c4cc8be3ab9.png',
        ),
        statusProps: getViewStatusProps(type2View.status),
      },
      {
        type: 3,
        title: '套外业绩',
        icon: ctx.helper.getProdFileUrl(
          '/public/upload/file/13/0/2024-07-18-10-43-15-d030cfe9-60fa-4a9a-9eee-8b40f02ced1f.png',
        ),
        statusProps: getViewStatusProps(type3View.status),
      },
      {
        type: 4,
        title: '设计费业绩',
        icon: ctx.helper.getProdFileUrl(
          '/public/upload/file/13/0/2024-07-18-10-43-15-39d86d85-2971-484d-8dd5-3d0365a24a25.png',
        ),
        statusProps: getViewStatusProps(type4View.status),
      },
      {
        type: 5,
        title: '套内增项业绩',
        icon: ctx.helper.getProdFileUrl(
          '/public/upload/file/13/0/2024-07-18-10-43-15-36efa446-4431-4281-810d-62c24dfb6e73.png',
        ),
        statusProps: getViewStatusProps(type5View.status),
      },
      {
        type: 6,
        title: '竣工业绩',
        icon: ctx.helper.getProdFileUrl(
          '/public/upload/file/13/0/2024-07-18-10-43-15-58c387f6-50ac-4aec-9a8b-9e489d235f95.png',
        ),
        statusProps: getViewStatusProps(type6View.status),
      },
    ];

    function getViewCards(views) {
      return views
        .map((v) => {
          return `
          <div
            class="wrap"
            ${buttonClick({
              handleType: 'runFormatFunction',
              params: {
                flowId: 'buxblf085okscbb6',
                type: v.type,
              },
            })}
            style="
                  position: relative;
                  min-width: 240px;
                  height: 85px;
                  box-sizing: border-box;
                  display: flex;
                  border-radius: 4px;
                  opacity: 1;
                  background: #f7fafe;
                  border: 1px solid #ebeef5;
                  cursor: pointer;
              "
          >
            <div
              style="
                  margin-left: 15px;
                  margin-top: 6px;
                  margin-right: 14px;
                  width: 72px;
                  height: 72px;
                  opacity: 1;
                  background: url('${v.icon}');
                  background-size: 100% 100%;
                  "
            ></div>
            <div>
              <div
                style="
                      margin-top: 20px;
                      font-size: 14px;
                      font-weight: normal;
                      line-height: 24px;
                      color: #17233e;
                  "
              >
                ${v.title}
              </div>
              <div
                style="
                      font-size: 10px;
                      font-weight: normal;
                      line-height: 20px;
                      color: #3175fb;
                      cursor: pointer;
                      display: flex;
                      align-items: center;
                  "
              >
                <span>点击查看</span>
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="7" height="9" viewBox="0 0 7 9"><g transform="matrix(0,1,-1,0,7,-7)"><path d="M11.5,4.9738e-16L15.39711,5.25L7.602886,5.25L11.5,4.9738e-16Z" fill="#3175FB" fill-opacity="1" /></g></svg>
              </div>
            </div>

            <div
              style="
                  position: absolute;
                  right: 0px;
                  top: 0px;
                  width: 51px;
                  height: 16px;
                  border-radius: 0px 4px 0px 10px;
                  font-size: 10px;
                  line-height: 14px;
                  text-align: center;
                  background: ${v.statusProps.bgColor};
                  color: ${v.statusProps.color};
                  "
            >
              ${v.statusProps.text}
            </div>
          </div>
        `;
        })
        .join('\n');
    }

    const chooseModuleHtmlStr = `
      <style>
        .wrap:hover {
          box-shadow: 0px 4px 10px 0px rgba(49, 117, 251, 0.2);
          border-color: #3175fb33 !important;
        }
      </style>

      <div
        style="
          padding: 28px 40px;
          display: flex;
          gap: 20px;
          box-sizing: border-box;
          flex-wrap: wrap;
          user-select: none;
          background: url('${ctx.helper.getProdFileUrl(
            '/public/upload/file/13/0/2024-07-18-05-31-25-b78bc504-1c9e-49ce-a739-4c3cd1e7a8d2.png',
          )}');
          background-size: 100% 100%;
        "
        class="beauty-scroll"
      >
        ${getViewCards(views)}
      </div>
    `;
    return {
      handleType: 'showHtml',
      dialogProps: {
        title: '业绩查询',
        width: '580px',
        height: '430px',
        noPadding: true,
        hideFooter: true,
      },
      htmlStr: chooseModuleHtmlStr,
      debug: {
        type1View,
        type2View,
        type3View,
        type4View,
        type5View,
        type6View,
        helper: ctx.helper.getProdFileUrl.toString(),
      },
    };
  } else if (showType === 1) {
    return type1View.render;
  } else if (showType === 2) {
    return type2View.render;
  } else if (showType === 3) {
    return type3View.render;
  } else if (showType === 4) {
    return type4View.render;
  } else if (showType === 5) {
    return type5View.render;
  } else if (showType === 6) {
    return type6View.render;
  }
} catch (error) {
  return { error, handleError: `run: ${error.message}` };
}
