/**
 * @flowId 453
 * @flowName 业绩_人力录入部门数据
 * @flowNodeName 函数名称
 * @flowNodeType funEditNode
 * @flowNodeId 1
 * @updateTime 2025-03-04 15:52:20
 */

const { sheetData, groupType = 2, departmentId, fitUse, houseType } = body;

try {
  if (!departmentId) return { handleError: "分店ID不能为空" };

  if (!sheetData || !sheetData.length) return { handleError: "数据不能为空" };

  if (groupType !== 2 && groupType !== 3 && groupType !== 4) return { handleError: "业绩类型错误" };

  if (!fitUse) return { handleError: "业绩归属月份不能为空" };

  const isDesign = +groupType === 2;
  const isSale = +groupType === 3;
  const isNoSale = +groupType === 4;

  const departmentRecord = await ctx.model.Record.findOne({
    where: { targetId: departmentId, fitUse, type: 37, houseType },
  });
  // houseSpace: '2,3' 代表设计部，渠道部全部录入完成
  // houseSpace: '2' 代表只有设计部录入完成
  // houseSpace: '3' 代表只有渠道部录入完成

  if (String(departmentRecord?.houseSpace || "").includes(groupType)) {
    return {
      handleError: `该分店${isDesign ? "设计部" : isSale ? "渠道部" : "非渠道"}已录入过该业绩数据`,
    };
  }

  const unValidRows = [];
  const unValue = "#VALUE!";
  /**
   * 校验并处理百分比数据
   */
  function checkParseNumber(value, rowIndex, name) {
    const newVal = parseFloat(value);
    const unValid = isNaN(newVal) || value === unValue;
    if (unValid) {
      unValidRows.push({
        rowIndex,
        name,
        value,
        message: `第${rowIndex}行的 ${name}输入不正确`,
      });
    }
    return newVal;
  }

  // 只有新签业绩会同时出现 新签类型 和 增项 类型业绩
  const records = await ctx.model.Record.findAll({
    where: {
      id: {
        [Op.in]: sheetData.map(v => v[1].v),
      },
    },
  });

  // 根据 id 找到对应的 material
  function getValueByField(row, field) {
    for (const key in row) {
      if (row[key].field === field) {
        return row[key];
      }
    }
    return null; // 如果找不到对应的 field，返回 null 或者其他默认值
  }
  let data = [];
  if (houseType === 3) {
    // 套外 业绩
    const sheetRecords = Array.from(new Set(sheetData.map(v => v[1].v)));

    data = sheetRecords.map(id => {
      const record = records.find(r => r.id == id);

      const sheetMaterials = [];

      for (let i = 0; i < sheetData.length; i++) {
        const sheetMaterial = sheetData[i];
        if (sheetMaterial[1].v === id) {
          sheetMaterials.push({
            /** 实际在excel中的行数 */
            rowIndex: i,
            item: sheetMaterial,
          });
        }
      }

      return {
        id,
        materials: sheetMaterials.map(({ item, rowIndex }) => {
          const { 0: remark, 1: _id, 2: materialId } = item;
          const materialIndex = JSON.parse(record.data).materials.findIndex(
            m => m.id == materialId.v
          );

          const designTichengAmount = {
            /**
             * 试用期
             */
            isProbationPeriod: item[22].v,
            /**
             * 提成发放比
             */
            tc_ffb: checkParseNumber(item[23].v, rowIndex, "设计师提成发放比") * 100,
            /**
             * 业绩提点
             */
            yj_td:
              checkParseNumber(item[24].v, rowIndex, "设计师业绩提点") *
              (item[24].s === "Number_Formatter" ? 1 : 100),
            /**
             * 发放为比例OR固定金额
             */
            yj_td_type: item[24].s === "Number_Formatter" ? "amount" : "percent",
            /**
             * 配比后提点
             */
            pbh_td: checkParseNumber(item[25].v, rowIndex, "设计师配比后提点") * 100,
            /**
             * 设计师本次提点
             */
            sjs_bc_td: checkParseNumber(item[26].v, rowIndex, "设计师本次提点") * 100,
            /**
             * 业绩本次提成
             */
            yj_bc_tc: checkParseNumber(item[27].v, rowIndex, "业绩本次提成"),
            /**
             * 设计师提成合计
             */
            sjs_tc_hj: checkParseNumber(item[28].v, rowIndex, "设计师提成合计"),
          };
          const designLeaderTichengAmount = {
            /**
             * 提成发放比
             */
            tc_ffb: checkParseNumber(item[30].v, rowIndex, "设计部门经理提成发放比") * 100,
            /**
             * 业绩提点
             */
            yj_td: checkParseNumber(item[31].v, rowIndex, "设计部门经理业绩提点") * 100,
            /**
             * 配比后提点
             */
            pbh_td: checkParseNumber(item[32].v, rowIndex, "设计部门经理配比后提点") * 100,
            /**
             * 业绩提成
             */
            yj_tc: checkParseNumber(item[33].v, rowIndex, "设计部门经理业绩提成"),
            /**
             * 设计部门经理提成合计
             */
            sjbm_jl_tchj: checkParseNumber(item[34].v, rowIndex, "设计部门经理提成合计"),
          };

          return {
            designRemark: remark.v,
            id: materialId.v,
            designTichengAmount,
            designLeaderTichengAmount,
          };
        }),
      };
    });
  } else if (houseType === 1) {
    // 新签业绩 & 套内增项业绩
    const newSignSheetData = sheetData.filter(v => v[1].type === "newSign");
    data = newSignSheetData.map((item, index) => {
      const { 0: remark, 1: id } = item;
      const rowIndex = index + 2; // 实际在excel中的行数
      if (isSale) {
        // 渠道 只有新签
        const saleTichengAmount = {
          // 试用期
          isProbationPeriod: item[22].v,
          /**
           * 渠道专员提点
           */
          qdzy_td: checkParseNumber(item[23].v, rowIndex, "渠道专员提点") * 100,
          /**
           * 渠道专员提成
           */
          qdzy_tc: checkParseNumber(item[24].v, rowIndex, "渠道专员提成"),
        };
        const saleLeaderTichengAmount = {
          /**
           * 渠道经理提点
           */
          qdjl_td: checkParseNumber(item[26].v, rowIndex, "渠道经理提点") * 100,
          /**
           * 发放比例
           */
          distributionRatio: checkParseNumber(item[27].v, rowIndex, "渠道经理发放比例") * 100,
          /**
           * 渠道经理提成
           */
          qdjl_tc: checkParseNumber(item[28].v, rowIndex, "渠道经理提成"),
        };

        return {
          saleRemark: remark.v,
          id: id.v,
          saleTichengAmount,
          saleLeaderTichengAmount,
        };
      } else if (isDesign) {
        // 设计部
        const record = records.find(r => r.id == id.v);
        if (record) {
          // 新签业绩
          const designTichengAmount = {
            /**
             * 试用期
             */
            isProbationPeriod: item[23].v,
            /**
             * 提成发放比
             */
            tc_ffb: checkParseNumber(item[24].v, rowIndex, "设计师提成发放比") * 100,
            /**
             * 整装业绩提点
             */
            zz_yj_td: checkParseNumber(item[25].v, rowIndex, "设计师整装业绩提点") * 100,
            /**
             * 配比后提点
             */
            pbh_td: checkParseNumber(item[26].v, rowIndex, "设计师配比后提点") * 100,
            /**
             * 设计师本次提点
             */
            sjs_bc_td: checkParseNumber(item[27].v, rowIndex, "设计师本次提点") * 100,
            /**
             * 整装业绩本次提成
             */
            zz_yj_bc_tc: checkParseNumber(item[28].v, rowIndex, "整装业绩本次提成"),
            /**
             * 设计师提成合计
             */
            sjs_tc_hj: checkParseNumber(item[29].v, rowIndex, "设计师提成合计"),
          };
          const designLeaderTichengAmount = {
            /**
             * 提成发放比
             */
            tc_ffb: checkParseNumber(item[31].v, rowIndex, "设计部门经理提成发放比") * 100,
            /**
             * 整装业绩提点
             */
            zz_yj_td: checkParseNumber(item[32].v, rowIndex, "设计部门经理整装业绩提点") * 100,
            /**
             * 配比后提点
             */
            pbh_td: checkParseNumber(item[33].v, rowIndex, "设计部门经理配比后提点") * 100,
            /**
             * 整装业绩提成
             */
            zz_yj_tc: checkParseNumber(item[34].v, rowIndex, "设计部门经理整装业绩提成"),
            /**
             * 设计部门经理提成合计
             */
            sjbm_jl_tchj: checkParseNumber(item[35].v, rowIndex, "设计部门经理提成合计"),
          };
          const storeManager = {
            zz_yj_td: checkParseNumber(item[37].v, rowIndex, "店长整装业绩提点") * 100,
            zz_yj_tc: checkParseNumber(item[38].v, rowIndex, "店长整装业绩提成") * 100,
          };
          const deputyStoreManager = {
            zz_yj_td: checkParseNumber(item[40].v, rowIndex, "副店长整装业绩提点") * 100,
            zz_yj_tc: checkParseNumber(item[41].v, rowIndex, "副店长整装业绩提成"),
          };

          return {
            designRemark: remark.v,
            id: id.v,
            designTichengAmount,
            designLeaderTichengAmount,
            storeManager,
            deputyStoreManager,
          };
        }
      } else if (isNoSale) {
        // 非渠道 只有新签
        return {
          noSaleRemark: remark.v,
          id: id.v,
          noSaleTichengAmount: {
            /**
             * 非渠道派单提点
             */
            fqdpd_td: checkParseNumber(item[21].v, rowIndex, "非渠道派单提点") * 100,
            /**
             * 非渠道派单提成
             */
            fqdpd_tc: checkParseNumber(item[22].v, rowIndex, "非渠道派单提成"),
          },
        };
      }
    });
    if (isDesign) {
      const addMaterialSheetDataObj = {};

      for (let i = 0; i < sheetData.length; i++) {
        const item = sheetData[i];
        const { 0: _, 1: id } = item;
        const rowIndex = i + newSignSheetData.length + 2;
        if (id.type === "addMaterial") {
          addMaterialSheetDataObj[id.v] = addMaterialSheetDataObj[id.v] ?? {
            id: id.v,
            materials: [],
          };
          addMaterialSheetDataObj[id.v].materials.push({
            rowIndex,
            item,
            id: id.materialId,
          });
        }
      }

      data.push(
        ...Object.values(addMaterialSheetDataObj).map(({ id, materials }) => {
          const record = records.find(r => r.id == id);
          const jsonData = JSON.parse(record?.data || "{}") || {};

          return {
            id,
            materials: materials.map(({ item, rowIndex, id }) => {
              const { 0: remark } = item;
              const materialIndex = jsonData.materials.findIndex(m => m.id == id);

              const designTichengAmount = {
                /**
                 * 试用期
                 */
                isProbationPeriod: item[23].v,
                /**
                 * 提成发放比
                 */
                tc_ffb: checkParseNumber(item[24].v, rowIndex, "设计师提成发放比") * 100,
                /**
                 * 整装业绩提点
                 */
                zz_yj_td: checkParseNumber(item[25].v, rowIndex, "设计师整装业绩提点") * 100,
                /**
                 * 配比后提点
                 */
                pbh_td: checkParseNumber(item[26].v, rowIndex, "设计师配比后提点") * 100,
                /**
                 * 设计师本次提点
                 */
                sjs_bc_td: checkParseNumber(item[27].v, rowIndex, "设计师本次提点") * 100,
                /**
                 * 业绩本次提成
                 */
                yj_bc_tc: checkParseNumber(item[28].v, rowIndex, "业绩本次提成"),
                /**
                 * 设计师提成合计
                 */
                sjs_tc_hj: checkParseNumber(item[29].v, rowIndex, "设计师提成合计"),
              };
              const designLeaderTichengAmount = {
                /**
                 * 提成发放比
                 */
                tc_ffb: checkParseNumber(item[31].v, rowIndex, "设计部门经理提成发放比") * 100,
                /**
                 * 整装业绩提点
                 */
                zz_yj_td: checkParseNumber(item[32].v, rowIndex, "设计部门经理整装业绩提点") * 100,
                /**
                 * 配比后提点
                 */
                pbh_td: checkParseNumber(item[33].v, rowIndex, "设计部门经理配比后提点") * 100,
                /**
                 * 整装业绩提成
                 */
                zz_yj_tc: checkParseNumber(item[34].v, rowIndex, "设计部门经理整装业绩提成"),
                /**
                 * 设计部门经理提成合计
                 */
                sjbm_jl_tchj: checkParseNumber(item[35].v, rowIndex, "设计部门经理提成合计"),
              };

              return {
                designRemark: remark.v,
                id,
                designTichengAmount,
                designLeaderTichengAmount,
              };
            }),
          };
        })
      );
    }
  } else {
    // 其他业绩
    data = sheetData.map((item, index) => {
      const { 0: remark, 1: id } = item;
      const rowIndex = index + 2; // 实际在excel中的行数
      const record = records.find(r => r.id == id.v);

      if (record) {
        if (record.type === 54 && record.houseType === 4) {
          // 设计费业绩

          const isStart = getValueByField(item, "isStart")?.v === "是"; // 是否开工
          const paymentRatio = +getValueByField(item, "paymentRatio")?.v; // 交款比例
          const designPriceAmount = +getValueByField(item, "amount.designFee")?.v; // 设计费实收
          let fitType = record.fitType;

          if (fitType === null) {
            if (designPriceAmount < 8000) {
              fitType = 2;
            } else {
              if (paymentRatio >= 0.65 && isStart) {
                // 首次发放 大于 65 % 且开工, 全部发放
                fitType = 2;
              } else if (paymentRatio >= 0.3) {
                // 标记fitType = 1
                fitType = 1;
                // 发放25%
              }
            }
          } else if (fitType == 1) {
            // 发放第二批次 如果第二批次 还是小于 65 那么这个月不发放
            if (paymentRatio >= 0.65 && isStart) {
              fitType = 2;
              // 首次发放 大于 65 %, 全部发放
            }
          }

          const designTichengAmount = JSON.parse(record.data)?.designTichengAmount || {};

          if (fitType) {
            designTichengAmount[fitUse] = {
              /**
               * 设计费提点
               */
              sjf_td:
                checkParseNumber(
                  getValueByField(item, "designTichengAmount.sjf_td")?.v,
                  rowIndex,
                  "设计师设计费提点"
                ) * 100,
              sjf_tc_rate:
                checkParseNumber(
                  getValueByField(item, "designTichengAmount.sjf_tc_rate")?.v,
                  rowIndex,
                  "设计费发放比例"
                ) * 100,
              /**
               * 设计费提成
               */
              sjf_tc: checkParseNumber(
                getValueByField(item, "designTichengAmount.sjf_tc")?.v,
                rowIndex,
                "设计师设计费提成"
              ),
              /**
               * 设计费提成缓发
               */
              sjf_tc_hf: checkParseNumber(
                getValueByField(item, "designTichengAmount.sjf_tc_hf")?.v,
                rowIndex,
                "设计师设计费提成缓发"
              ),
              /**
               * 设计费提成实发
               */
              sjf_tc_sf: checkParseNumber(
                getValueByField(item, "designTichengAmount.sjf_tc_sf")?.sourceValue,
                rowIndex,
                "设计师设计费提成实发"
              ),
            };
          }

          const designLeaderTichengAmount =
            JSON.parse(record.data)?.designLeaderTichengAmount || {};

          if (fitType) {
            designLeaderTichengAmount[fitUse] = {
              /**
               * 设计费提点
               */
              sjf_td:
                checkParseNumber(
                  getValueByField(item, "designLeaderTichengAmount.sjf_td")?.v,
                  rowIndex,
                  "设计部门经理设计费提点"
                ) * 100,
              /**
               * 设计费提成
               */
              sjf_tc: checkParseNumber(
                getValueByField(item, "designLeaderTichengAmount.sjf_tc")?.sourceValue,
                rowIndex,
                "设计部门经理设计费提成"
              ),
            };
          }

          return {
            designRemark: remark.v,
            id: id.v,
            designTichengAmount,
            designLeaderTichengAmount,
            fitType,
          };
        } else if (record.type === 54 && record.houseType === 3) {
          // 开工业绩

          const designTichengAmount = {
            fitUse,
            designer_zz_td:
              checkParseNumber(
                getValueByField(item, "designTichengAmount.designer_zz_td")?.v,
                rowIndex,
                "设计师整装提点"
              ) * 100, // 设计师整装提点
            designer_bc_td:
              checkParseNumber(
                getValueByField(item, "designTichengAmount.designer_bc_td")?.v,
                rowIndex,
                "本次开工提点"
              ) * 100, // 设计师本次开工提点
            designer_bc_kg_tc: checkParseNumber(
              getValueByField(item, "designTichengAmount.designer_bc_kg_tc")?.v,
              rowIndex,
              "本次开工提成"
            ), // 设计师本次开工提成
            /**
             * 试用期
             */
            isProbationPeriod: item[23].v,
            /**
             * 提成发放比
             */
            tc_ffb: checkParseNumber(item[24].v, rowIndex, "设计师提成发放比") * 100,
            /**
             * 整装业绩提点
             */
            zz_yj_td: checkParseNumber(item[25].v, rowIndex, "设计师整装业绩提点") * 100,
            /**
             * 配比后提点
             */
            pbh_td: checkParseNumber(item[26].v, rowIndex, "设计师配比后提点") * 100,
            /**
             * 设计师本次提点
             */
            sjs_bc_td: checkParseNumber(item[27].v, rowIndex, "设计师本次提点") * 100,
            /**
             * 整装业绩本次提成
             */
            zz_yj_bc_tc: checkParseNumber(item[28].v, rowIndex, "整装业绩本次提成"),
            /**
             * 设计师提成合计
             */
            sjs_tc_hj: checkParseNumber(item[29].v, rowIndex, "设计师提成合计"),
          };
          const designLeaderTichengAmount = {
            /**
             * 提成发放比
             */
            tc_ffb: checkParseNumber(item[31].v, rowIndex, "设计部门经理提成发放比") * 100,
            /**
             * 整装业绩提点
             */
            zz_yj_td: checkParseNumber(item[32].v, rowIndex, "设计部门经理整装业绩提点") * 100,
            /**
             * 配比后提点
             */
            pbh_td: checkParseNumber(item[33].v, rowIndex, "设计部门经理配比后提点") * 100,
            /**
             * 整装业绩提成
             */
            zz_yj_tc: checkParseNumber(item[34].v, rowIndex, "设计部门经理整装业绩提成"),
            /**
             * 设计部门经理提成合计
             */
            sjbm_jl_tchj: checkParseNumber(item[35].v, rowIndex, "设计部门经理提成合计"),
          };

          return {
            designRemark: remark.v,
            id: id.v,
            designTichengAmount,
            designLeaderTichengAmount,
          };
        } else if (record.type === 54 && record.houseType === 6) {
          // 竣工业绩

          const designTichengAmount = {
            /**
             * 试用期
             */
            isProbationPeriod: item[23].v,
            /**
             * 提成发放比
             */
            tc_ffb: checkParseNumber(item[24].v, rowIndex, "设计师提成发放比") * 100,
            /**
             * 整装业绩提点
             */
            zz_yj_td: checkParseNumber(item[25].v, rowIndex, "设计师整装业绩提点") * 100,
            /**
             * 配比后提点
             */
            pbh_td: checkParseNumber(item[26].v, rowIndex, "设计师配比后提点") * 100,
            /**
             * 设计师本次提点
             */
            sjs_bc_td: checkParseNumber(item[27].v, rowIndex, "设计师本次提点") * 100,
            /**
             * 整装业绩本次提成
             */
            zz_yj_bc_tc: checkParseNumber(item[28].v, rowIndex, "整装业绩本次提成"),
            /**
             * 设计师提成合计
             */
            sjs_tc_hj: checkParseNumber(item[29].v, rowIndex, "设计师提成合计"),
          };
          const designLeaderTichengAmount = {
            /**
             * 提成发放比
             */
            tc_ffb: checkParseNumber(item[31].v, rowIndex, "设计部门经理提成发放比") * 100,
            /**
             * 整装业绩提点
             */
            zz_yj_td: checkParseNumber(item[32].v, rowIndex, "设计部门经理整装业绩提点") * 100,
            /**
             * 配比后提点
             */
            pbh_td: checkParseNumber(item[33].v, rowIndex, "设计部门经理配比后提点") * 100,
            /**
             * 整装业绩提成
             */
            zz_yj_tc: checkParseNumber(item[34].v, rowIndex, "设计部门经理整装业绩提成"),
            /**
             * 设计部门经理提成合计
             */
            sjbm_jl_tchj: checkParseNumber(item[35].v, rowIndex, "设计部门经理提成合计"),
          };

          return {
            designRemark: remark.v,
            id: id.v,
            designTichengAmount,
            designLeaderTichengAmount,
          };
        }
      }
    });
  }

  return { data, sheetData, records };

  if (unValidRows.length) {
    return {
      handleType: "showTipText",
      dialogProps: {
        showFooter: false,
        title: "请检查以下数据是否填写正确",
        noPadding: true,
        hideFooter: true,
        scrollable: true,
        width: "600px",
        height: "400px",
      },
      tipData: {
        text: `${Object.values(
          unValidRows.reduce((acc, cur) => {
            acc[cur.rowIndex] = acc[cur.rowIndex] || [];
            acc[cur.rowIndex].push(cur);
            return acc;
          }, {})
        )
          .map(row => row.map(v => v.message).join("\n"))
          .join("\n----------------------------------\n")}`,
      },
      data: {
        unValidRows,
        sourceData: sheetData,
        outData: data.filter((v, i) => unValidRows.find(v => v.index === i)),
      },
    };
  }

  records.forEach(record => {
    const itemIndex = data.findIndex(({ id }) => record.id === +id);
    if (itemIndex > -1) {
      const item = data[itemIndex];
      const id = item.id;
      delete item.id;
      const jsonData = JSON.parse(record.data);
      if (record.type === 54 && (record.houseType === 1 || record.houseType === 2)) {
        jsonData.materials = jsonData.materials.map(m => {
          const sheetMaterial = item.materials.find(material => material.id == m.id);
          return Object.assign(m, sheetMaterial);
        });
        delete item.materials;
      } else {
        Object.assign(jsonData, { ...item });
      }

      item.jsonData = jsonData;
      item.id = id;
      data[itemIndex] = item;
    }
  });

  const tasks = [
    ...data.map(v => {
      const body = {
        data: JSON.stringify(v.jsonData),
      };
      if (houseType === 4) {
        body.fitType = v.fitType;
      }
      return ctx.service.base.update({
        model: "Record",
        where: { id: v.id },
        body,
      });
    }),
  ];

  if (departmentRecord) {
    departmentRecord.houseSpace += departmentRecord.houseSpace ? `,${groupType}` : groupType;

    tasks.push(
      ctx.service.base.update({
        model: "Record",
        where: { id: departmentRecord.id },
        body: {
          houseSpace: departmentRecord.houseSpace,
        },
      })
    );
  } else {
    tasks.push(
      ctx.model.Record.create({
        title: "人力业绩确认记录",
        fitUse,
        type: 37,
        data: JSON.stringify({}),
        targetId: departmentId,
        status: 1,
        adminId: (await ctx.helper.getMsg(ctx)).id,
        houseSpace: `${groupType}`,
        houseType, // 业绩类型
      })
    );
  }

  const response = await Promise.all(tasks);
  return {
    response,
    data,
  };
} catch (error) {
  return error.message;
}
