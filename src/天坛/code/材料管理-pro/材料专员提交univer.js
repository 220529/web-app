/**
 * @flowId 511
 * @flowKey od7uo357idc15d8r
 * @flowName 材料专员_提交数据_保存材料数据_同步数据
 * @flowNodeName 函数名称
 * @flowNodeType funEditNode
 * @flowNodeId 1
 * @updateTime 2025-09-20 09:40:38
 */

try {
  let {
    sheetData,
    companyId,
    fitType,
    brandId,
    id,
    title,
    handleType = 'const-submit',
  } = body;

  let recordData = {};
  let sheetList = [];
  try {
    recordData = JSON.parse(body.data);
    if (Array.isArray(recordData)) {
      recordData = recordData[0];
    }
  } catch (e) {}
  companyId = companyId || recordData.targetId;
  brandId = brandId || recordData.fitUse;
  id = id || recordData.id;
  const isMainMaterial = +(fitType || recordData.fitType) === 1; // 1主材 2基材
  const isMainOutMaterial = +(fitType || recordData.fitType) === 3; // 3套外主材
  const { id: adminId, name: adminName } = await ctx.helper.getMsg(ctx);

  if (handleType === 'const-submit') {
    const saveRecordInfo = await ctx.model.Workfile.findOne({
      where: { type: 'materialsManagement', targetId: id },
    });
    if (!saveRecordInfo || !saveRecordInfo.data) {
      return {
        handleError: '没有需要更新的数据',
      };
    }
    sheetList = JSON.parse(saveRecordInfo.data).sheets['sheet-01'].cellData;

    if (Object.values(sheetList).length === 2) {
      let flage = Object.values(sheetList['1'])
        .map((item) => item?.v || item?.p?.body?.dataStream || '')
        .some((item) => item);
      if (!flage)
        return {
          handleError: '没有需要更新的数据',
        };
    }
  } else if (handleType === 'delete') {
    const saveRecordInfo = await ctx.model.Workfile.findOne({
      where: { type: 'materialsManagement', targetId: id },
    });
    if (!saveRecordInfo?.id) {
      return {
        handleError: '暂无需要同步的数据',
      };
    }
    let data = await ctx.service.workfile.update({
      id: saveRecordInfo.id,
      updates: { data: '' },
    });
    return data;
  } else {
    sheetList = sheetData.sheets['sheet-01'].cellData;
  }
  const getDiff = (obj1, obj2, keys) => {
    const diff = [];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key === 'saleMethod') {
        const v1 = (obj1[key]?.split(',') || [])
          .filter(Boolean)
          .map(Number)
          .sort();
        const v2 = (obj2[key]?.split(',') || [])
          .filter(Boolean)
          .map(Number)
          .sort();
        // 对比数组是否一致
        if (v1.length !== v2.length) {
          diff.push({
            key,
            value1: obj1[key],
            value2: obj2[key],
          });
        } else {
          // 对比数组中的每一项是否一致
          for (let i = 0; i < v1.length; i++) {
            const item = v1[i];
            if (item !== v2[i]) {
              diff.push({
                key,
                value1: obj1[key],
                value2: obj2[key],
              });
              break;
            }
          }
        }
      } else {
        if (obj1[key] !== obj2[key]) {
          if (
            (obj1[key] === null || obj1[key] === '') &&
            (obj2[key] === null || obj2[key] === '')
          ) {
          } else {
            diff.push({
              key,
              value1: obj1[key],
              value2: obj2[key],
            });
          }
        }
      }
    }
    return diff;
  };
  async function getDictsByCompanyId(companyId) {
    const companyIds = [...new Set([companyId, 0])];
    const allCategory = await ctx.model.Dict.findAll({
      where: {
        type: {
          [Op.in]: [1, 2, 3, 4, 9, 10, 19, 20],
        },
        companyId: {
          [Op.in]: companyIds,
        },
      },
    });
    const categoryMap = {
      /**
       * 主材一级分类
       */
      1: [],
      /**
       * 主材二级分类
       */
      2: [],
      /**
       * 品牌
       */
      3: [],
      /**
       * 单位
       */
      4: [],
      /**
       * 基材一级分类
       */
      9: [],
      /**
       * 基材二级分类
       */
      10: [],
      /**
       * 套外主材一级分类
       */
      19: [],
      /**
       * 套外主材二级分类
       */
      20: [],
    };
    allCategory.forEach((item) => {
      categoryMap[+item.type].push(item);
    });
    return categoryMap;
  }
  async function getSupplierListByCompanyId(companyId) {
    const suppliers = await ctx.model.Supplier.findAll({
      where: {
        companyId: {
          [Op.in]: [...new Set([companyId, 0])],
        },
        status: 1,
        // 1 主材 3 基材
        kind: isMainMaterial || isMainOutMaterial ? 1 : 3,
      },
    });
    // 结算供应商
    const suppliers1 = [];
    // 配送供应商
    const suppliers2 = [];
    suppliers.forEach((item) => {
      if (item.type.includes(1)) suppliers1.push(item);

      if (item.type.includes(2)) suppliers2.push(item);
    });
    return [suppliers1, suppliers2];
  }
  async function getMaterialsByCompanyId(companyId, isMainMaterial, numbers) {
    const materials = ctx.helper.copy(
      await ctx.model.Material.findAll({
        where: {
          type: isMainMaterial ? 1 : 3,
          number: {
            [Op.in]: [...new Set(numbers)],
          },
          companyId: {
            [Op.in]: [...new Set([companyId, 0])],
          },
        },
      }),
    );
    const ids = [...new Set(materials.map((v) => v.id))];
    const [materialDepartments] = ids.length
      ? await ctx.model.query(`
      SELECT
        md.*,
        d.NAME AS departmentName
      FROM
        material_departments AS md
        LEFT JOIN departments AS d ON md.departmentId = d.id
      WHERE
        md.materialId IN ( ${ids.join(',')} )
    `)
      : [[]];
    const materials1 = [];
    const materials3 = [];
    materials.forEach((item) => {
      const deps = materialDepartments
        .filter((md) => md.materialId === item.id)
        .sort((a, b) => a.departmentId - b.departmentId);
      item.departmentIds = deps.map((v) => v.departmentId).join(',');
      item.departmentIdsStr = deps.map((v) => v.departmentName).join(',');

      if (+item.type === 1) materials1.push(item);

      if (+item.type === 3) materials3.push(item);
    });
    return [isMainMaterial ? materials1 : materials3];
  }
  async function getSaleMethodsByCompanyId(companyId) {
    const saleMethods = await ctx.model.Product.findAll({
      where: {
        companyId: {
          [Op.in]: [...new Set([companyId, 0])],
        },
        type: 2,
      },
    });
    return { saleMethods };
  }
  async function getDepartmentListByCompanySupplierId(companyId, supplierId) {
    const [configs, departments] = await Promise.all([
      ctx.model.Config.findAll({
        where: {
          type: 33,
          targetId: companyId,
        },
        attributes: [
          'createdAt',
          'updatedAt',
          'id',
          'data',
          'targetId',
          'type',
        ],
        order: [['updatedAt', 'desc']],
      }),
      ctx.model.Department.findAll({
        where: {
          type: 6,
          companyId,
        },
      }),
    ]);

    const filterConfig = configs.find((c) => {
      c.data = JSON.parse(c.data);
      return c.data.setSupplierIds.includes(supplierId);
    });
    const config = filterConfig
      ? { ...filterConfig.data, ...filterConfig }
      : null;
    if (config) {
      config.setStores = config.setStoreIds.map((id) => {
        return departments.find((d) => d.id === id);
      });
      config.defaultStores = config.defaultStoreIds.map((id) => {
        return departments.find((d) => d.id === id);
      });
      config.stores = departments;
    }

    return [config, departments];
  }
  const supplierId = await ctx.service.config.getSupplierConfigIdByUserId(
    +adminId,
    companyId,
  );
  const [
    {
      1: dict1,
      2: dict2,
      4: dictUnits,
      9: dict3,
      10: dict4,
      19: dict11,
      20: dict21,
    },
    [supplier1, supplier2],
    { saleMethods },
    [departmentConfig, departments],
  ] = await Promise.all([
    getDictsByCompanyId(companyId),
    getSupplierListByCompanyId(companyId),
    getSaleMethodsByCompanyId(companyId),
    getDepartmentListByCompanySupplierId(companyId, +supplierId),
  ]);
  //判断是否需要推送  需要推送的要添加关联编码
  async function getInternalSuppliers(supplierId) {
    const data = await ctx.model.Supplier.findOne({
      where: {
        id: supplierId,
        needPush: true,
      },
    });
    return Boolean(data?.id);
  }
  const isInternalSuppliers = await getInternalSuppliers(supplierId);
  const isCanSet = departmentConfig ? +departmentConfig?.isCanSet === 1 : false;
  const typeClassOptions = isMainMaterial
    ? dict1
    : isMainOutMaterial
      ? dict11
      : dict3;
  const classOptions = isMainMaterial
    ? dict2
    : isMainOutMaterial
      ? dict21
      : dict4;
  function isChildClass(id1, id2) {
    if (Array.isArray(id2)) {
      return id2.find((id) => {
        return +classOptions.find((v) => +v.id === +id)?.pid === +id1;
      });
    } else {
      return +classOptions.find((v) => +v.id === +id2)?.pid === +id1;
    }
  }
  const fields = [
    {
      type: 1,
      field_name: '编码',
      column: 'number',
    },
    ...(isInternalSuppliers
      ? [
          {
            type: 1,
            field_name: '关联编码',
            column: 'relatedNumber',
          },
        ]
      : []),
    {
      type: 1,
      field_name: '型号',
      column: 'model',
    },
    {
      type: 1,
      field_name: '名称',
      required: true,
      column: 'name',
    },
    {
      type: 18,
      field_name: '一级分类',
      options: typeClassOptions,
      ui_type: 'SingleSelect',
      required: true,
      column: 'typeClass',
      column2: 'typeClassStr',
    },
    {
      type: 18,
      field_name: '二级分类',
      options: classOptions,
      ui_type: 'SingleSelect',
      required: true,
      column: 'class',
      column2: 'classStr',
    },
    {
      type: 1,
      field_name: '规格',
      column: 'spec',
    },
    // {
    //   type: 1,
    //   field_name: '材质',
    //   column: 'materialQuality',
    // },
    // {
    //   type: 1,
    //   field_name: '颜色',
    //   column: 'color',
    // },
    {
      type: 18,
      field_name: '单位',
      options: dictUnits,
      ui_type: 'SingleSelect',
      required: true,
      column: 'unit',
      column2: 'unitStr',
    },
    {
      type: 18,
      field_name: '销售方式',
      options: saleMethods,
      ui_type: 'MultiSelect',
      column: 'saleMethod',
      column2: 'saleMethodStr',
    },
    ...(isCanSet
      ? [
          {
            type: 18,
            field_name: '可使用店面',
            options:
              (supplierId ? departmentConfig?.setStores : departments) || [],
            ui_type: 'MultiSelect',
            column: 'departmentIds',
            column2: 'departmentIdsStr',
          },
        ]
      : []),
    {
      type: 2,
      field_name: '采购价',
      ui_type: 'Number',
      required: true,
      property: {
        min: 0,
      },
      column: 'purchasePrice',
    },
    {
      type: 2,
      field_name: '未税采购价',
      ui_type: 'Number',
      property: {
        min: 0,
      },
      column: 'untaxedPurchasePrice',
    },
    {
      type: 2,
      field_name: '税点',
      ui_type: 'Number',
      property: {
        min: 0,
      },
      column: 'taxRate',
    },
    {
      type: 2,
      field_name: '项目经理价',
      ui_type: 'Number',
      required: true,
      property: {
        min: 0,
      },
      column: 'managerPrice',
    },

    {
      type: 2,
      field_name: '销售价',
      ui_type: 'Number',
      required: true,
      property: {
        min: 0,
      },
      column: 'price',
    },
    {
      type: 2,
      field_name: '折项价',
      ui_type: 'Number',
      required: true,
      property: {
        min: 0,
      },
      column: 'removePrice',
    },
    {
      type: 2,
      field_name: '备货天数',
      ui_type: 'Number',
      required: true,
      property: {
        min: 0,
      },
      column: 'stockDays',
    },
    {
      type: 2,
      field_name: '变更天数',
      ui_type: 'Number',
      required: true,
      property: {
        min: 0,
      },
      column: 'changeDays',
    },
    {
      type: 18,
      field_name: '配送供应商',
      options: supplier2,
      ui_type: 'SingleSelect',
      required: true,
      column: 'distributionId',
      column2: 'distributionStr',
    },
    {
      type: 18,
      field_name: '结算供应商',
      options: supplier1,
      ui_type: 'SingleSelect',
      required: true,
      column: 'supplierId',
      column2: 'supplierStr',
    },
    {
      field_name: '说明',
      type: 1,
      column: 'explain',
    },
    {
      field_name: '状态',
      type: 3,
      column: 'status',
      required: true,
      property: {
        options: [
          {
            name: '启用',
          },
          {
            name: '停用',
          },
        ],
      },
    },
  ];
  const unValidRows = [];
  const records = [];
  function formatseeth(data, item) {
    const fields = {};
    data.forEach((v, index) => {
      let strText = item ? item[index] || '' : '';
      fields[v.column] = strText;
      fields[v.field_name] = strText;
      if (v.column2) {
        fields[v.column] = strText;
      }
    });
    return { fields };
  }
  // let flage = true;
  sheetList = Array.isArray(sheetList) ? sheetList : Object.values(sheetList);
  for (let index = 0; index < sheetList.length; index++) {
    let sheetRow = Object.keys(sheetList[0]).length;
    let item = sheetList[index];
    let data = [];
    // let fliterList = [6, 7];
    if (index) {
      for (let i = 0; i < sheetRow; i++) {
        let reslut = item[i]?.v || item[i]?.p?.body?.dataStream || '';
        // if (sheetRow === 20) {
        //   if (fliterList.includes(i)) {
        //     if (reslut) {
        //       flage = false;
        //       break;
        //     } else {
        //       continue;
        //     }
        //   } else {
        //     data.push(reslut);
        //   }
        // } else {
        // }
        data.push(reslut);
      }
      // if (!flage) {
      //   break;
      // }
      if ([...new Set(data)].length === 1 && [...new Set(data)][0] === '') {
      } else {
        records.push(formatseeth(fields, data));
      }
    }
  }

  // if (!flage) {
  //   return {
  //     handleError: '存在 材质 颜色 错误数据 请同步数据后重新提交！',
  //     showTip: {
  //       text: '存在 材质 颜色 错误数据 请同步数据后重新提交！',
  //     },
  //     tipText: '存在 材质 颜色 错误数据 请同步数据后重新提交！',
  //   };
  // }

  records.forEach((record, i) => {
    const unValidRow = [];
    fields.forEach((field) => {
      let item = JSON.parse(JSON.stringify(record.fields));
      let field_value = item[field.field_name] || '';
      const column = field.column;
      let valid = true;
      switch (field.type) {
        // 文本
        case 1:
          field_value = field_value?.toString() || '';
          if (field.required && !field_value?.trim?.()) {
            field_value = field_value?.trim?.()?.replace(/\s+/g, ' ') || '';
            unValidRow.push({
              message: `字段: ${field.field_name} 是必填项; `,
              value: field_value,
              source: { field, column: field.column, fields: record },
            });
          } else {
            if (field.column === 'name' && field_value?.length > 100) {
              unValidRow.push({
                message: `字段: ${field.field_name} 的最大长度为100 `,
                value: field_value,
                source: { field, column: field.column, fields: record },
              });
            } else if (field.column === 'model' && field_value?.length > 40) {
              unValidRow.push({
                message: `字段: ${field.field_name} 的最大长度为40 `,
                value: field_value,
                source: { field, column: field.column, fields: record },
              });
            } else if (field.column === 'spec' && field_value?.length > 200) {
              unValidRow.push({
                message: `字段: ${field.field_name} 的最大长度为200 `,
                value: field_value,
                source: { field, column: field.column, fields: record },
              });
            } else if (
              field.column === 'number' &&
              ((isMainMaterial && field_value?.startsWith('WG')) ||
                (isMainOutMaterial && !field_value?.startsWith('WG')))
            ) {
              if (
                isMainMaterial &&
                field_value?.trim?.() &&
                field_value?.startsWith('WG')
              ) {
                unValidRow.push({
                  message: `编码: ${field.field_name}为套外产品, 请在该品牌套外表格中维护`,
                  value: field_value,
                  source: { field, column: field.column, fields: record },
                });
              } else if (
                isMainOutMaterial &&
                field_value?.trim?.() &&
                !field_value?.startsWith('WG')
              ) {
                unValidRow.push({
                  message: `编码: ${field.field_name}非套外产品, 请在该品牌套内表格中维护`,
                  value: field_value,
                  source: { field, column: field.column, fields: record },
                });
              }
            } else {
              record.fields[column] = field_value;
            }
          }
          break;
        // 数字
        case 2:
          field_value = field_value !== null ? +field_value : field_value;
          record.fields[field.field_name] = field_value;
          const min = field.property?.min;
          // 验证逻辑：如果是必填字段，检查非空且满足最小值；如果非必填字段，只检查最小值（如果有值的话）
          valid = field.required
            ? field_value !== null &&
              ((min !== undefined && field_value >= min) || min === undefined)
            : field_value === null ||
              field_value === '' ||
              (min !== undefined ? field_value >= min : true);
          if (!valid) {
            unValidRow.push({
              message: `字段: ${field.field_name} 必须大于等于${min}; `,
              value: field_value,
              source: { field, column: field.column, fields: record },
            });
          } else {
            record.fields[field.field_name] = field_value;
            record.fields[column] = field_value;
          }
          break;
        // 下拉框
        case 18:
          if (field.ui_type === 'MultiSelect') {
            field_value += '';
            const text_arr = field_value ? field_value?.split(',') : '';
            if (text_arr.length) {
              const isExited = field.options.filter((option) =>
                text_arr.find((v) => v?.trim() === option.name?.trim()),
              );
              valid = text_arr.length === isExited?.length;
              if (valid) {
                record.fields[`${field.field_name}_IDS`] = isExited.map(
                  (v) => v.id,
                );
                record.fields[column] =
                  isExited.map((v) => v.id)?.join(',') ?? '';
              } else {
                record.fields[column] = '';
                unValidRow.push({
                  message: `字段: ${field.field_name} ${
                    field_value || '-'
                  } 必须是已存在的数据; `,
                  value: field_value,
                  source: { field, column: field.column, fields: record },
                });
              }
            } else {
              record.fields[column] = '';
            }
          } else {
            const isExited = field.options?.filter(
              (option) => option.name?.trim() === field_value?.trim?.(),
            );
            valid = field_value && isExited.length;
            if (!valid) {
              if (field.required) {
                unValidRow.push({
                  message: `字段: ${field.field_name} ${
                    field_value || '-'
                  } 必须是已存在的数据; `,
                  value: field_value,
                  source: { field, column: field.column, fields: record },
                });
              }
              record.fields[column] = '';
            } else {
              if (column === 'class') {
                const ids = isExited.map((v) => v.id);
                const child = isChildClass(record.fields['一级分类_ID'], ids);
                if (child > 0) {
                  record.fields[`${field.field_name}_ID`] = child;
                  record.fields[`${field.field_name}_IDS`] = ids;
                } else {
                  record.fields[`${field.field_name}_ID`] = isExited[0].id;
                }
              } else {
                record.fields[`${field.field_name}_ID`] = isExited[0].id;
              }
              record.fields[column] = isExited[0].id;
            }
          }
          break;
        case 3:
          if (field.required) {
            valid = field_value !== null;
            if (!valid) {
              unValidRow.push({
                message: `字段: ${field.field_name} 是必选项;`,
                value: field_value,
                source: { field, column: field.column, fields: record },
              });
            } else {
              record.fields[field.field_name] = field_value;
              record.fields[column] =
                field_value == '启用'
                  ? true
                  : field_value == '停用'
                    ? false
                    : undefined;
            }
          } else {
            record.fields[field.field_name] = field_value;
            record.fields[column] = field_value == '启用' ? true : false;
          }
      }
    });

    if (record.fields['一级分类_ID'] && record.fields['二级分类_ID']) {
      if (
        !isChildClass(
          record.fields['一级分类_ID'],
          record.fields['二级分类_IDS'],
        )
      ) {
        unValidRow.push({
          message: `字段: 所选二级分类${
            record.fields['二级分类'] ?? '-'
          } 不是一级分类${record.fields['一级分类'] ?? '-'}的子分类; `,
          value: [
            record.fields['一级分类'],
            record.fields['一级分类_ID'],
            record.fields['二级分类'],
            record.fields['二级分类_ID'],
          ],
        });
      }
    }

    if (unValidRow.length) {
      unValidRows.push({
        message: `第${i + 2}条数据,存在以下问题：\n${unValidRow
          .map((item) => item.message)
          .join('\n')}`,
        valid: unValidRow,
        index: i,
      });
    }
  });
  //存储表格顺序
  async function sheetDataSort(sheetData) {
    const data = Object.values(sheetData?.sheets['sheet-01']?.cellData).map(
      (item) => Object.values(item)?.map((v) => v?.v || ''),
    );
    const result = []; //最终结果
    const xingHaoIndex = data[0].findIndex((item) => item === '型号');
    const nameIndex = data[0].findIndex((item) => item === '名称');
    data.forEach((item, index) => {
      if (!index) return false;
      if (item[0]) return result.push(item[0]);
      if (item[nameIndex]?.trim?.())
        return result.push([
          item[xingHaoIndex]?.trim?.(),
          item[nameIndex]?.trim?.(),
        ]);
    });
    const logInfo = await ctx.model.Record.findOne({ where: { id } });
    await ctx.service.base.update({
      model: 'Record',
      where: { id },
      body: {
        data: JSON.stringify({
          ...JSON.parse(logInfo?.data || '{}'),
          sheetSort: result,
        }),
      },
    });
  }
  //保存优先执行
  if (handleType === 'content-save') {
    if (unValidRows.length) {
      return {
        handleType: 'showHtml',
        dialogProps: {
          style: {
            whiteSpace: 'pre-wrap',
          },
          headerIcon: 'mdi-tooltip-question',
          title: '提示',
          width: '400px',
          height: '300px',
          noPadding: true,
          contentFullAndScroll: true,
          hideFooter: true,
        },
        htmlStr: `${unValidRows.map((v) => `<p>${v.message}</p>`)}`,
        unValidRows,
      };
    }

    const saveRecordInfo = await ctx.model.Workfile.findOne({
      where: { type: 'materialsManagement', targetId: id },
    });
    await sheetDataSort(sheetData);
    // fields
    let data = await ctx.service.workfile.update({
      id: saveRecordInfo.id,
      updates: { data: JSON.stringify(sheetData) },
    });
    return data;
  }
  if (unValidRows.length) {
    return {
      tipText: `${unValidRows
        .map((v) => v.message)
        .join('\n----------------------------------\n')}`,
      tipProps: {
        style: {
          whiteSpace: 'pre-wrap',
        },
        showFooter: false,
        scrollable: true,
      },
      unValidRows,
      records: records.filter((v, i) => unValidRows.find((v) => v.index === i)),
    };
  }
  const allNumbers = records.reduce((acc, v) => {
    !!v.fields['编码']?.trim() && acc.push(v.fields['编码']?.trim());
    return acc;
  }, []);
  const [materials] = await getMaterialsByCompanyId(
    companyId,
    isMainMaterial || isMainOutMaterial,
    allNumbers,
  );
  // 获取材料审批人员配置
  const { auditNodes } = await ctx.service.common.runFlowByParams({
    flowId: 'szvglo7bggtoxug5',
  });
  const create = [];
  const update = [];
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const recordFields = record.fields;
    const code = recordFields['编码']?.trim();
    if (code) {
      const material = materials.find((v) => v.number === code);
      if (material) {
        const updateBody = {};

        const keys = [];
        fields.forEach((field) => {
          const column = field.column;
          const field_value = recordFields[column];
          const isSelect = field.type === 18;
          if (['材质', '颜色'].includes(field.field_name)) {
            updateBody[column] = field_value || '';
          } else if (field.field_name === '状态') {
            if (typeof recordFields['状态'] !== undefined) {
              keys.push(field.column);
              updateBody[column] = field_value;
            }
          } else if (['一级分类', '二级分类'].includes(field.field_name)) {
            keys.push(column);
            updateBody[column] = field_value;
            updateBody[column] = recordFields[`${field.field_name}_ID`] ?? '';
            updateBody[`${column}Str`] = recordFields[field.field_name] ?? '';
          } else {
            keys.push(field.column);
            updateBody[column] = field_value;
            if (isSelect) {
              if (field.ui_type === 'MultiSelect')
                updateBody[column] = recordFields[column] ?? '';
              else
                updateBody[column] =
                  recordFields[`${field.field_name}_ID`] ?? '';

              updateBody[`${column}Str`] = recordFields[field.field_name] ?? '';
            }
          }
        });
        const hasStatus = typeof updateBody.status !== 'undefined';

        const diff = getDiff(
          {
            ...material,
            status: hasStatus ? (material.status ? '启用' : '停用') : undefined,
          },
          {
            ...updateBody,
            status: hasStatus
              ? updateBody.status
                ? '启用'
                : '停用'
              : undefined,
          },
          keys,
        );
        if (diff.length) {
          const newMaterial = {
            ...updateBody,
            model: updateBody.model ?? '',
            spec: updateBody.spec ?? '',
            materialQuality: updateBody.materialQuality ?? '',
            color: updateBody.color ?? '',
            explain: updateBody.explain ?? '',
          };
          if (!isCanSet) {
            newMaterial.departmentIds = material.departmentIds;
            newMaterial.departmentIdsStr = material.departmentIdsStr;
          }
          if (typeof updateBody.status !== 'undefined') {
            newMaterial.status = updateBody.status;
          }
          update.push({
            record_id: record.id,
            id: material.id,
            material: newMaterial,
            diff,
            index: i + 1,
          });
        }
      }
    } else {
      if (!isCanSet) {
        recordFields['可使用店面_IDS'] = departmentConfig?.defaultStoreIds;
        recordFields['可使用店面'] =
          departmentConfig?.defaultStores.map((v) => v.name)?.join(',') || '';
      }
      const material = {
        number: '',
        relatedNumber: recordFields['关联编码']?.trim?.() || '',
        brand: brandId, // 品牌
        name: recordFields['名称'],
        model: recordFields['型号'] ?? '',
        typeClass: recordFields['一级分类_ID'],
        typeClassStr: recordFields['一级分类'] ?? '',
        class: recordFields['二级分类_ID'],
        classStr: recordFields['二级分类'] ?? '',
        spec: recordFields['规格'] ?? '',
        unit: recordFields['单位_ID'],
        unitStr: recordFields['单位'] ?? '',
        // TODO
        // materialQuality: recordFields['材质'] || '',
        // color: recordFields['颜色'] || '',
        // TODO
        saleMethod: recordFields['销售方式_IDS']?.join(',') || '',
        saleMethodStr: recordFields['销售方式'] ?? '',

        departmentIds: recordFields['可使用店面_IDS']?.join(',') || '',
        departmentIdsStr: recordFields['可使用店面'] ?? '',

        purchasePrice: +recordFields['采购价'],
        untaxedPurchasePrice: +recordFields['未税采购价'] || 0,
        taxRate: +recordFields['税点'] || 0,
        managerPrice: +recordFields['项目经理价'],
        price: +recordFields['销售价'],
        removePrice: +recordFields['折项价'],

        stockDays: +recordFields['备货天数'],
        changeDays: +recordFields['变更天数'],

        distributionId: recordFields['配送供应商_ID'],
        distributionIdStr: recordFields['配送供应商'] ?? '',
        supplierId: recordFields['结算供应商_ID'],
        supplierIdStr: recordFields['结算供应商'] ?? '',

        explain: recordFields['说明'] ?? '',
        status:
          recordFields['状态'] === 'undefined' || recordFields['状态'] === ''
            ? 1
            : recordFields['status'] === '停用'
              ? 0
              : 1,
      };
      create.push({
        record_id: record.id,
        index: i + 1,
        material,
      });
    }
  }

  if (update.length || create.length) {
    const domain = ctx.helper.webUrl
      ? ctx.helper.webUrl()
      : ctx.helper.getCodeUrl();

    const createRes = await ctx.model.Record.create({
      type: 43,
      title: title,
      targetId: recordData.id,
      adminId,
      status: 1,
      houseType: 3, // 使用新的审批逻辑
      data: JSON.stringify({
        update,
        create,
        auditNodes,
        auditRecords: [],
        submitReason: recordData.submitReason || '',
      }),
    });

    async function sendWxNotice() {
      const isTestEnv = ctx.helper.isDev();
      if (isTestEnv) return { message: '测试环境。', data: null, code: 200 };
      const wxuserids = ['15711052218']; // 胡舒婷 线上账号 TODO:
      const access_token_v2 = await ctx.service.user.checkWxTokenV2();
      return await ctx.curl(
        `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${access_token_v2}`,
        {
          // 必须指定 method
          method: 'POST',
          // 通过 contentType 告诉 HttpClient 以 JSON 格式发送
          contentType: 'json',
          data: {
            touser: wxuserids.join('|'),
            msgtype: 'textcard',
            agentid: process.env.WECOM_AGENT_ID || 1000022,
            textcard: {
              title: '系统通知: 商家发起材料审批',
              description: `<div class="highlight">【品牌】:${
                recordData.brandName
              }</div><div class="highlight">【材料类型】:${
                recordData.fitTypeStr ?? '-'
              }</div><div class="highlight">【提交人】:${adminName}</div>`,
              url: `${domain}/#/function`,
              btntxt: '查看',
            },
            safe: 0,
          },
          // 明确告诉 HttpClient 以 JSON 格式处理返回的响应 body
          dataType: 'json',
        },
      );
    }

    // 正常创建
    return {
      create: createRes,
      // 发送通知 信息部审批人 发送企微需绑定微信才可以接收
      notice: await sendWxNotice(),
    };
  } else {
    return {
      handleError: '没有需要更新的数据',
    };
  }
} catch (error) {
  return {
    handleError: error.message,
    showTip: {
      text: error.message,
    },
    tipText: error.message,
  };
}
