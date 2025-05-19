/**
 * @flowId 639
 * @flowName 获取人力_套外业绩提点数据
 * @flowNodeName 函数名称
 * @flowNodeType funEditNode
 * @flowNodeId 1
 * @updateTime 2025-03-05 14:30:15
 */

const testData = {};

// fitUse = 202404
// groupType 2 设计
// departmentId 分店ID
const { groupType = 2, fitUse, departmentId, performanceType } = body;

function toFixed(val, num = 2) {
  return +(+(val || 0)).toFixed(num);
}

try {
  if (!fitUse || !departmentId) {
    return {
      handleError: "参数错误",
    };
  }
  const fitUseStr = String(fitUse).slice(0, 4) + "年" + String(fitUse).slice(4) + "月";

  const departmentRecords = await ctx.model.Record.findAll({
    where: {
      // fitUse,
      type: 35,
      houseType: 3, // 套外业绩
      status: 2, // 通过的
      title: {
        [Op.like]: `1_${departmentId},2_%`, // 只要当前分店所属的
      },
    },
  });
  const departmentIds = departmentRecords.map(v => +v.targetId);
  const record = await ctx.model.Record.findOne({
    where: {
      targetId: departmentId,
      type: 37,
      fitUse,
      houseType: performanceType,
    },
  });
  const isConfirm = Boolean(record?.houseSpace?.includes(groupType));
  const resultSql = `
    SELECT
      r.*
    FROM
      records AS r
    WHERE
          r.type = 54
      AND r.houseType = 1
      ${isConfirm ? "AND (r.fitType = 2)" : "AND (r.fitType IS NULL)"}
      AND r.data LIKE '%designDepartmentId":${departmentId},"designGroupName%'
  `;

  let [[rows], tichengRules] = await Promise.all([
    ctx.model.query(resultSql),
    ctx.service.common.runFlowByParams({
      flowId: 644,
      shopId: departmentId,
      houseType: performanceType,
    }),
  ]);

  // return {
  //   rows,
  //   departmentIds,
  // };

  const _rows = [...rows];
  rows = [];
  for (let i = 0; i < _rows.length; i++) {
    const v = _rows[i];
    v.data = JSON.parse(v.data || "{}") || {};
    const dId1 = v.data.customer.designGroupId;
    let passed = true;
    v.data.materials = v.data.materials.filter(v => v.status === 2);
    if (v.data.materials) {
      passed = true;
    }
    if (dId1 && !departmentIds.includes(+dId1)) passed = false;

    if (passed) {
      rows.push(v);
    }
  }

  if (!rows?.length) {
    return {
      handleError: "暂无数据",
    };
  }

  const customerIds = [...new Set(rows.map(v => v.data.customer?.id).filter(Boolean))];

  const designGroupIds = [
    ...new Set(rows.map(v => v.data.customer?.designGroupId).filter(Boolean)),
  ];

  const realPaymentAmountSql = `
    SELECT
      sum( amount ) AS realPaymentAmount,
      targetId AS orderId
    FROM
      bills
    WHERE
      targetId IN ( ${rows.map(v => v.targetId).join(",")} )
      AND type IN ( 302 ) -- 合同款 实收
      AND STATUS = 2 -- 通过的
    GROUP BY
      targetId
  `;
  const userSql = `
    SELECT
      *
    FROM users
    WHERE
      ${designGroupIds.map(id => `FIND_IN_SET(${id}, departmentId)`).join(" OR ")}
  `;

  const [areaRecords, [realPaymentAmounts], [users]] = await Promise.all([
    ctx.model.Record.findAll({
      where: {
        type: 1,
        targetId: {
          [Op.in]: customerIds,
        },
      },
    }),
    ctx.model.query(realPaymentAmountSql),
    ctx.model.query(userSql),
  ]);

  const realPaymentAmountObj = realPaymentAmounts.reduce((acc, cur) => {
    acc[cur.orderId] = cur;
    return acc;
  }, {});

  let monthSigningAmountObj = {}; // 对应id个人月签单金额
  let monthOutSigningAmountObj = {}; // 对应id个人月套外签单金额
  let departmentMonthTotalSigningAmountObj = {}; // 对应id部门总签单金额
  let departmentMonthTotalOutSigningAmountObj = {}; // 对应id部门总套外签单金额

  // 按照每个部门数据进行汇总
  const groupsData = rows.reduce((acc, cur, i) => {
    // id 不要
    const { id, ...jsonData } = cur.data;

    const groupId = jsonData.customer["designGroupId"];

    const area = areaRecords.find(a => a.targetId === jsonData.customer.id)?.area;

    const order_number = jsonData.order_number || "-";

    jsonData.customer.area = jsonData.customer.area ?? area;

    const realPaymentAmount = realPaymentAmountObj[cur.targetId]?.realPaymentAmount || 0;

    const paymentRatio = ((realPaymentAmount / jsonData.amount.signingAmount) * 100).toFixed(2);

    const discountAmount = jsonData.amount.signingAmount - jsonData.amount.specialOfferAmount;

    let userId = jsonData.customer["designerId"];
    // 累计个人签单额度 新签部分
    monthSigningAmountObj[userId] = monthSigningAmountObj[userId] ?? 0;

    // 累计部门签单额度 新签部分
    departmentMonthTotalSigningAmountObj[groupId] =
      departmentMonthTotalSigningAmountObj[groupId] ?? 0;

    if (!jsonData.customer.customerSignType.includes("+499")) {
      monthSigningAmountObj[userId] += jsonData.amount.signingAmount;
      departmentMonthTotalSigningAmountObj[groupId] += jsonData.amount.signingAmount;
    }

    // 累计个人签单额度 套外部分
    monthOutSigningAmountObj[userId] = monthOutSigningAmountObj[userId] ?? 0;
    // 累计部门签单额度 套外部分
    departmentMonthTotalOutSigningAmountObj[groupId] =
      departmentMonthTotalOutSigningAmountObj[groupId] ?? 0;

    const materials = jsonData.materials.map(m => {
      monthOutSigningAmountObj[userId] += +m.amount;
      departmentMonthTotalOutSigningAmountObj[groupId] += +m.amount;

      const item = {
        id: cur.id,
        ...jsonData,
        signDate: fitUseStr,
        order_number,
        monthSigningAmount: 0, // 个人月签单金额
        monthOutSigningAmount: 0, // 个人月套外签单金额
        departmentMonthTotalSigningAmount: 0, // 部门总签单金额
        departmentMonthTotalOutSigningAmount: 0, // 部门总套外签单金额
        realPaymentAmount, // 实缴金额
        paymentRatio, // 交款比例
        discountAmount, // 优惠后金额
        material: m,
        designLeaderTichengAmount: m.designLeaderTichengAmount,
        designTichengAmount: m.designTichengAmount,
        designRemark: m.designRemark,
      };

      return item;
    });

    acc[groupId] = [...(acc[groupId] || []), ...materials];
    return acc;
  }, {});

  testData.monthSigningAmountObj = monthSigningAmountObj;
  testData.departmentMonthTotalSigningAmountObj = departmentMonthTotalSigningAmountObj;

  function getSheet(rows) {
    return (
      ctx.helper
        .copy(rows)
        .map((v, i) => {
          const departmentUsers = users.filter(cur =>
            cur.departmentId.split(",").includes(String(v.customer.designGroupId))
          );

          if (!isConfirm) {
            // 该分店对应（设计部门）未确认,才会计算数据
            const userId = v.customer["designerId"];
            const groupId = v.customer["designGroupId"];

            /** 个人月签单金额 */
            const monthSigningAmount = monthSigningAmountObj[userId] || 0;
            /** 个人月套外签单总额 */
            const monthOutSigningAmount = monthSigningAmountObj[userId] || 0;
            v.monthSigningAmount = monthSigningAmount;
            v.monthOutSigningAmount = monthOutSigningAmount;

            /** 部门总签单金额 */
            v.departmentMonthTotalSigningAmount =
              departmentMonthTotalSigningAmountObj[groupId] || 0;
            /** 部门总套外签单金额 */
            v.departmentMonthTotalOutSigningAmount =
              departmentMonthTotalOutSigningAmountObj[groupId] || 0;

            // 根据提点阶段配置计算设计师提点
            const dConfig =
              tichengRules.designer.outRules.find(c => v.material.brandId === c.brandId) ||
              tichengRules.designer.defaultOutConfig;

            const designTichengAmount_tc_ffb =
              monthOutSigningAmount / monthSigningAmount >= 0.1 ? 100 : 80;

            const dfIsPercent = dConfig.type === "percent";

            const designTichengAmount_yj_td = dfIsPercent ? dConfig.percent : dConfig.amount;

            const designTichengAmount_pbh_td =
              (designTichengAmount_tc_ffb / 100) * (dfIsPercent ? designTichengAmount_yj_td : 100);

            const designTichengAmount_yj_bc_tc =
              ((dfIsPercent ? v.material.amount : designTichengAmount_yj_td) *
                designTichengAmount_pbh_td) /
              100;

            v.designTichengAmount = {
              tc_ffb: designTichengAmount_tc_ffb,
              yj_td: designTichengAmount_yj_td,
              yj_td_type: dConfig.type,
              pbh_td: designTichengAmount_pbh_td,
              sjs_bc_td: designTichengAmount_pbh_td,
              yj_bc_tc: toFixed(designTichengAmount_yj_bc_tc),
              sjs_tc_hj: toFixed(designTichengAmount_yj_bc_tc),
            };

            // 根据提点阶段配置计算设计部门经理提点
            const rate =
              (v.departmentMonthTotalSigningAmount
                ? v.departmentMonthTotalOutSigningAmount / v.departmentMonthTotalSigningAmount
                : 1) * 100;
            const dLConfig = tichengRules.designLeader.outRules.find(
              r => rate > r.min && rate <= r.max
            );

            /** 提成发放比 */
            const designLeaderTichengAmount_tc_ffb = rate >= 10 ? 100 : 80;

            /** 业绩提点 */
            const designLeaderTichengAmount_yj_td = dLConfig.percent;

            const designLeaderTichengAmount_pbh_td =
              (designLeaderTichengAmount_tc_ffb / 100) * designLeaderTichengAmount_yj_td;
            const designLeaderTichengAmount_yj_tc =
              (v.departmentMonthTotalSigningAmount * designLeaderTichengAmount_pbh_td) / 100;

            v.designLeaderTichengAmount = {
              /** 提成发放比 */
              tc_ffb: designLeaderTichengAmount_tc_ffb,
              /** 业绩提点 */
              yj_td: designLeaderTichengAmount_yj_td,
              pbh_td: designLeaderTichengAmount_pbh_td,
              yj_tc: toFixed(designLeaderTichengAmount_yj_tc),
            };

            v.designLeaderTichengAmount.sjbm_jl_tchj = toFixed(designLeaderTichengAmount_yj_tc);
          }

          return {
            departmentUsers: departmentUsers || [],
            ...v,
          };
        })
        // 按照每个设计师的月签单金额 从高到低 排序
        .sort((a, b) => b.monthSigningAmount - a.monthSigningAmount)
    );
  }

  function getCellData(tableHeaders, sourceData) {
    const getCell = (row, col, value, header, rowData = {}, rows = []) => {
      const { getF, getType, ...conf } = header?.config || {};
      if (getType) {
        header.type = getType(row + 1, rowData, value);
      }
      const isPercent = header.type === "percent";
      const isNumber = header.type === "number";

      const res = {
        v: isPercent ? (+value / 100).toFixed(2) : value.toString(),
      };
      if (getF) res.f = getF(row + 1, rowData, value);
      Object.assign(res, conf);

      if (isPercent) {
        res.t = 2;
        res.s = "Percent_Formatter";
      } else if (isNumber) {
        res.t = 2;
        res.s = "Number_Formatter";
      }
      return res;
    };

    const getDataByKeyPath = (data, path, defaultValue = "") => {
      return (
        path.split(".").reduce((acc, key) => {
          return acc?.[key];
        }, data) ?? defaultValue
      );
    };

    const tableHeaderCellData = tableHeaders.reduce((acc, header, index) => {
      acc[index] = {
        v: `${header.field_name}_${index} `,
        s: "Header_Formatter",
      };
      return acc;
    }, {});

    const realCellData = sourceData
      .map((row, rowIndex) => {
        const rowData = tableHeaders.map((header, colIndex) => {
          const val = getDataByKeyPath(row, header.field, header.defaultValue);
          return getCell(rowIndex + 1, colIndex, val, header, row, sourceData);
        });
        return rowData;
      })
      .flat();

    const data = realCellData;

    const colLength = tableHeaders.length;
    const rowLength = sourceData.length;

    const cellData = {
      0: tableHeaderCellData, // 表头
      // ...
      // ...realCellData, // 表格数据
    };
    for (let i = 1; i <= rowLength; i++) {
      const elements = data.slice(colLength * (i - 1), colLength * i);
      cellData[i] = elements.reduce((acc, cur, index) => {
        acc[index] = cur;
        return acc;
      }, {});
    }
    return cellData;
  }

  function getSheets(res) {
    const tableHeaders = [
      {
        field_name: "备注",
        field: "designRemark",
        width: 121,
      },
      {
        field_name: "ID",
        field: "id",
        locked: 1,
        width: 78,
      },
      {
        field_name: "物料ID",
        field: "material.id",
        locked: 1,
        width: 78,
      },
      {
        field_name: "序号",
        field: "index",
        locked: 1,
        width: 57,
      },
      {
        field_name: "签约产品",
        field: "material.brandName",
        locked: 1,
        width: 147,
      },
      {
        field_name: "签约日期",
        field: "signDate",
        locked: 1,
        width: 108,
      },
      {
        field_name: "合同编号",
        field: "order_number",
        locked: 1,
        width: 187,
      },
      {
        field_name: "客户来源",
        field: "customer.customerChannel",
        locked: 1,
        width: 112,
      },
      {
        field_name: "客户名称",
        field: "customer.name",
        locked: 1,
        width: 98,
      },
      {
        field_name: "签约面积",
        field: "customer.area",
        type: "number",
        locked: 1,
        width: 75,
      },
      {
        field_name: "签约类型",
        field: "customer.customerSignType",
        locked: 1,
        width: 141,
      },
      {
        field_name: "签约渠道",
        field: "customer.saleGroupName",
        locked: 1,
        width: 143,
      },
      {
        field_name: "渠道经理",
        field: "customer.saleLeaderName",
        locked: 1,
        width: 150,
      },
      {
        field_name: "渠道专员",
        field: "customer.salerName",
        locked: 1,
        width: 173,
      },
      {
        field_name: "签约金额",
        field: "material.amount",
        type: "number",
        locked: 1,
        width: 96,
      },
      {
        field_name: "实缴金额",
        field: "material.amount",
        type: "number",
        locked: 1,
        width: 96,
      },
      {
        field_name: "交款比例",
        field: "paymentRatio",
        type: "percent",
        locked: 1,
        width: 96,
      },
      {
        field_name: "业绩额",
        field: "material.amount",
        type: "number",
        locked: 1,
        width: 82,
      },
      {
        field_name: "开工",
        field: "amount.startWork", // TODO:
        locked: 1,
        width: 123,
      },
      {
        field_name: "店面",
        field: "customer.department",
        locked: 1,
        width: 173,
      },
      {
        field_name: "签约部门",
        field: "customer.designGroupName",
        locked: 1,
        width: 143,
      },
      {
        field_name: "签约设计师",
        field: "customer.designerName",
        locked: 1,
        width: 128,
      },
      {
        field_name: "试用期",
        field: "designTichengAmount.isProbationPeriod",
        width: 98,
      },
      {
        field_name: "提成发放比",
        field: "designTichengAmount.tc_ffb",
        type: "percent",
        width: 112,
      },
      {
        field_name: "设计师业绩提点",
        field: "designTichengAmount.yj_td",
        width: 169,
        config: {
          getType: (rowIndex, rowData, val) => {
            if (rowData.designTichengAmount.yj_td_type === "percent") {
              return "percent";
            } else {
              return "number";
            }
          },
        },
      },
      {
        field_name: "配比后提点",
        field: "designTichengAmount.pbh_td",
        type: "percent",
        config: {
          getF: (rowIndex, rowData, val) => {
            if (rowData.designTichengAmount.yj_td_type === "percent") {
              return `=X${rowIndex}*Y${rowIndex}`;
            } else {
              return `=X${rowIndex}`;
            }
          },
        },
        width: 92,
      },
      {
        field_name: "设计师本次提点",
        field: "designTichengAmount.sjs_bc_td",
        type: "percent",
        config: {
          getF: (rowIndex, rowData, val) => `=Z${rowIndex}`,
        },
        width: 126,
      },
      {
        field_name: "设计师业绩本次提成",
        field: "designTichengAmount.yj_bc_tc",
        type: "number",
        config: {
          getF: (rowIndex, rowData, val) => {
            if (rowData.designTichengAmount.yj_td_type === "percent") {
              return `=R${rowIndex}*AA${rowIndex}`;
            } else {
              return `=Y${rowIndex}*AA${rowIndex}`;
            }
          },
        },
        width: 207,
      },
      {
        field_name: "设计师提成合计",
        field: "designTichengAmount.sjs_tc_hj",
        type: "number",
        config: {
          getF: rowIndex => `=(AB${rowIndex})`,
        },
        width: 138,
      },
      {
        field_name: "设计部经理",
        field: "customer.designLeaderName",
        locked: 1,
        width: 124,
      },
      {
        field_name: "提成发放比",
        field: "designLeaderTichengAmount.tc_ffb",
        type: "percent",
        width: 100,
      },
      {
        field_name: "设计部经理业绩提点",
        field: "designLeaderTichengAmount.yj_td",
        type: "percent",
        width: 201,
      },
      {
        field_name: "配比后提点",
        field: "designLeaderTichengAmount.pbh_td",
        type: "percent",
        config: {
          getF: rowIndex => `=AE${rowIndex}*AF${rowIndex}`,
        },
        width: 110,
      },
      {
        field_name: "设计部经理业绩提成",
        field: "designLeaderTichengAmount.yj_tc",
        type: "number",
        config: {
          getF: rowIndex => `=R${rowIndex}*AG${rowIndex}`,
        },
        width: 205,
      },
      {
        field_name: "设计部经理提成合计",
        field: "designLeaderTichengAmount.sjbm_jl_tchj",
        type: "number",
        config: {
          getF: rowIndex => `=(AH${rowIndex})`,
        },
        width: 180,
      },
      // {
      //   field_name: '状态',
      //   field: 'departmentMonthTotalSigningAmount',
      //   locked: 1,
      //   width: 96,
      // },
    ];

    const cellData = getCellData(tableHeaders, res);

    const columnData = tableHeaders.reduce((acc, cur, index) => {
      acc[index] = { w: cur.width };
      return acc;
    }, {});

    // 暂时没有用处
    const hintText = isConfirm ? "业绩已确认，不可修改!" : "禁止修改系统数据!";

    const sheetId = "sheet_01";
    const resCount = res.length;
    const columnCount = tableHeaders.length;

    const authRanges = [];

    if (isConfirm) {
      authRanges.push({
        // 表头
        startRow: 0,
        startColumn: 0,
        endRow: resCount,
        endColumn: columnCount - 1,
        rangeType: 1,
        sheetId: sheetId,
      });
    } else {
      authRanges.push({
        // 表头
        startRow: 0,
        startColumn: 0,
        endRow: 0,
        endColumn: columnCount - 1,
        rangeType: 1,
        sheetId: sheetId,
      });
      const getRange = () => {
        return {
          startRow: 1,
          startColumn: -1,
          endRow: resCount,
          endColumn: -1,
          rangeType: 0,
          sheetId: sheetId,
        };
      };
      let temp_range = getRange();
      for (let i = 0; i < columnCount; i++) {
        const item = tableHeaders[i];
        if (item.locked) {
          if (temp_range.startColumn == -1) {
            temp_range.startColumn = i;
          } else {
            temp_range.endColumn = i;
          }
        } else {
          if (temp_range.endColumn !== -1 && temp_range.startColumn !== -1) {
            authRanges.push(temp_range);
            temp_range = getRange();
          } else if (temp_range.endColumn === -1 && temp_range.startColumn !== -1) {
            temp_range.endColumn = i - 1;
            authRanges.push(temp_range);
            temp_range = getRange();
          }
        }
      }
    }

    const sheetName = `${fitUseStr} 套外业绩确认 - 设计${isConfirm ? "（已录入）" : ""}`;
    return {
      name: sheetName,
      styles: {
        Header_Formatter: {
          // n:
        },
        Percent_Formatter: {
          n: {
            pattern: "0.00%",
          },
        },
        Number_Formatter: {
          n: {
            pattern: "0.00",
          },
        },
      },
      id: "workbook-639",
      appVersion: "",
      sheetOrder: [sheetId],
      sheets: {
        [sheetId]: {
          name: sheetName,
          id: sheetId,
          rowCount: resCount + 1, // +1 表头 多少行
          columnCount, // 多少列
          cellData,
          columnData,
          freeze: {
            startColumn: -1,
            startRow: 1,
            xSplit: 0,
            ySplit: 1,
          },
        },
      },
      resources: [
        {
          name: "SHEET_RANGE_PROTECTION_PLUGIN",
          data: JSON.stringify({
            [sheetId]: authRanges.map(item => {
              return {
                unitId: "workbook-639",
                subUnitId: sheetId,
                unitType: 3,
                ranges: [
                  {
                    ...item,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                  },
                ],
              };
            }),
          }),
        },
      ],
      payload: {
        authRanges,
      },
    };
  }

  const data = Object.values(groupsData)
    .map(rows => getSheet(rows))
    .flat()
    .map((v, i) => ({ ...v, index: i + 1 }));

  // const sheets = [getSheets(data)];
  return getSheets(data);
  // return { sheets, isConfirm, groupsData };
  // return {
  //   sheets,
  //   data,
  //   record,
  //   isConfirm,
  //   users,
  // };
} catch (error) {
  return {
    handleError: error.message,
  };
}
