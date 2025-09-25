try {
  const { fitType, brand, companyId, id: targetId, title, isInternal = "" } = body;
  const isMainMaterial = +fitType === 1;
  const isMainOutMaterial = +fitType === 3;
  const type = [1, 3].includes(+fitType) ? 1 : 3; //1套内主材3套外主材   2基材
  //表配置
  const sheetData = {
    id: `workbook-${targetId}`,
    promiseBookOrSheet: {
      WorkbookCreateSheetPermission: false,
      WorkbookManageCollaboratorPermission: false,
    },
    registerPluginConfig: {
      UniverSheetsDataValidationPlugin: {
        showEditOnDropdown: false,
        menu: {
          'data-validation.operation.open-validation-panel': {
            disabled: true,
          },
          'data-validation.command.addRuleAndOpen': {
            disabled: true,
          },
        },
      },
    },
    sheetOrder: [],
    name: '材料管理',
    appVersion: '',
    allowAddSheet: false,
    locale: 'zhCN',
    styles: {
      '9zf0O0': {
        vt: 2,
      },
      _HapSr: { vt: 2 },
      '6RlLfw': {
        vt: 2,
        n: {
          pattern: '#,##0.00_);[Red](#,##0.00)',
        },
      },
    },
    sheets: {
      'sheet-01': {
        name: title || '材料管理',
        id: 'sheet-01',
        tabColor: '',
        hidden: 0,
        zoomRatio: 1,
        freeze: { xSplit: 1, ySplit: 1, startRow: 1, startColumn: 1 },
        scrollTop: 0,
        scrollLeft: 0,
        defaultColumnWidth: 100,
        defaultRowHeight: 30,
        mergeData: [],
        cellData: {},
        columnData: {},
      },
    },
    resources: [],
  };
  async function getSupplierListByCompanyId(companyId) {
    const suppliers = await ctx.model.Supplier.findAll({
      where: {
        companyId: {
          [Op.in]: [...new Set([companyId, 0])],
        },
        status: 1,
        kind: isMainMaterial || isMainOutMaterial ? 1 : 3,
      },
    });
    // 结算供应商
    const suppliers1 = [];
    // 配送供应商
    const suppliers2 = [];
    suppliers.forEach((item) => {
      if (item.type.includes(1)) suppliers1.push(item.name);

      if (item.type.includes(2)) suppliers2.push(item.name);
    });
    return [suppliers1, suppliers2];
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
    return saleMethods.map((item) => item.name);
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
      config.setStoreNames = config.setStores.map((v) => v.name).join(',');
      config.defaultStores = config.defaultStoreIds.map((id) => {
        return departments.find((d) => d.id === id);
      });
      config.defaultStoreNames = config.defaultStores
        .map((v) => v.name)
        .join(',');
    }

    return [config, departments];
  }
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
  //判断是否需要推送  需要推送的要添加关联编码
  async function getInternalSuppliers(supplierId) {
    const data = await ctx.model.Supplier.findOne({
      where: {
        id: supplierId,
        needPush: true
      }
    })
    return Boolean(data?.id);
  }
  const { id: adminId } = await ctx.helper.getMsg(ctx);

  const [[supplier1, supplier2], saleMethods, supplierId] = await Promise.all([
    getSupplierListByCompanyId(companyId),
    getSaleMethodsByCompanyId(companyId),
    ctx.service.config.getSupplierConfigIdByUserId(+adminId, companyId),
  ]);
  const isInternalSuppliers = await getInternalSuppliers(supplierId)
  const [
    {
      1: dict1,
      2: dict2,
      4: dicUnits,
      9: dict3,
      10: dict4,
      19: dict11,
      20: dict21,
    },
    [departmentConfig, departments],
  ] = await Promise.all([
    getDictsByCompanyId(companyId),
    getDepartmentListByCompanySupplierId(companyId, +supplierId),
  ]);

  const units = dicUnits.map((item) => item.name);
  const typeClasses = (
    isMainMaterial ? dict1 : isMainOutMaterial ? dict11 : dict3
  ).map((item) => item.name);

  const classes = (
    isMainMaterial ? dict2 : isMainOutMaterial ? dict21 : dict4
  ).map((item) => item.name);
  const saveRecordInfo = await ctx.model.Workfile.findOne({
    where: { type: 'materialsManagement', targetId },
  });
  const isCanSet = departmentConfig ? +departmentConfig?.isCanSet === 1 : false;
  function getResources(dataResLength) {

    let departmentColIndex = isCanSet ? 8 : 7;
    if (isInternalSuppliers) departmentColIndex++;

    const SHEET_DATA_VALIDATION_PLUGIN = {
      'sheet-01': [
        {
          // 一级分类 下拉选项
          uid: '6oF9t3',
          type: 'list',
          formula1: [...new Set(typeClasses)].join(','),
          ranges: [
            {
              startRow: 1,
              startColumn: isInternalSuppliers ? 4 : 3,
              endRow: dataResLength,
              endColumn: isInternalSuppliers ? 4 : 3,
              rangeType: 0,
              unitId: sheetData.id,
              sheetId: 'sheet-01',
            },
          ],
          formula2: ',',
          errorStyle: 1,
        },
        {
          // 二级分类 下拉选项
          uid: '6oF9t4',
          type: 'list',
          formula1: [...new Set(classes)].join(','),
          ranges: [
            {
              startRow: 1,
              startColumn: isInternalSuppliers ? 5 : 4,
              endRow: dataResLength,
              endColumn: isInternalSuppliers ? 5 : 4,
              rangeType: 0,
              unitId: sheetData.id,
              sheetId: 'sheet-01',
            },
          ],
          formula2: ',',
          errorStyle: 1,
        },
        {
          // 单位 下拉选项
          uid: '6oF9t8',
          type: 'list',
          formula1: [...new Set(units)].join(','),
          ranges: [
            {
              startRow: 1,
              startColumn: isInternalSuppliers ? 7 : 6,
              endRow: dataResLength,
              endColumn: isInternalSuppliers ? 7 : 6,
              rangeType: 0,
              unitId: sheetData.id,
              sheetId: 'sheet-01',
            },
          ],
          formula2: ',',
          errorStyle: 1,
        },
        {
          // 销售方式 下拉选项
          uid: '6oF9t9',
          type: 'listMultiple',
          formula1: [...new Set(saleMethods)].join(','),
          ranges: [
            {
              startRow: 1,
              startColumn: isInternalSuppliers ? 8 : 7,
              endRow: dataResLength,
              endColumn: isInternalSuppliers ? 8 : 7,
              rangeType: 0,
              unitId: sheetData.id,
              sheetId: 'sheet-01',
            },
          ],
          formula2: ',',
          errorStyle: 1,
        },
        ...(isCanSet
          ? [
            {
              // 可使用门店 下拉选项
              uid: '6oF9t10',
              type: 'listMultiple',
              formula1:
                (supplierId
                  ? departmentConfig?.setStoreNames
                  : departments.map((v) => v.name).join(',')) || '',
              // defaultStoreNames.map(v => v.name).join(','),
              ranges: [
                {
                  startRow: 1,
                  startColumn: departmentColIndex,
                  endRow: dataResLength,
                  endColumn: departmentColIndex,
                  rangeType: 0,
                  unitId: sheetData.id,
                  sheetId: 'sheet-01',
                },
              ],
              formula2: ',',
              errorStyle: 1,
            },
          ]
          : []),
        {
          // 配送供应商 下拉选项
          uid: '6oF9t16',
          type: 'list',
          formula1: [...new Set(supplier2)].join(','),
          ranges: [
            {
              startRow: 1,
              startColumn: departmentColIndex + 7,
              endRow: dataResLength,
              endColumn: departmentColIndex + 7,
              rangeType: 0,
              unitId: sheetData.id,
              sheetId: 'sheet-01',
            },
          ],
          formula2: ',',
          errorStyle: 1,
        },
        {
          // 结算供应商下拉选项
          uid: '6oF9t18',
          type: 'list',
          formula1: [...new Set(supplier1)].join(','),
          ranges: [
            {
              startRow: 1,
              startColumn: departmentColIndex + 8,
              endRow: dataResLength,
              endColumn: departmentColIndex + 8,
              rangeType: 0,
              unitId: sheetData.id,
              sheetId: 'sheet-01',
            },
          ],
          formula2: ',',
          errorStyle: 1,
        },
        {
          // 状态 单选
          uid: '6oF9t20',
          type: 'checkbox',
          formula1: '启用',
          ranges: [
            {
              startColumn: departmentColIndex + 10,
              endColumn: departmentColIndex + 10,
              startRow: 1,
              endRow: dataResLength,
            },
          ],
          formula2: '停用',
          errorStyle: 1,
          showErrorMessage: true,
        },
      ],
    };

    const SHEET_RANGE_PROTECTION_PLUGIN = {
      'sheet-01': [],
    };
    for (let i = 0; i <= dataResLength; i++) {
      SHEET_RANGE_PROTECTION_PLUGIN['sheet-01'].push({
        unitId: sheetData.id,
        subUnitId: 'sheet-01',
        unitType: 3,
        ranges: [
          {
            startRow: i,
            endRow: i,
            startColumn: 0,
            endColumn: i === 0 ? 18 : 0,
            startAbsoluteRefType: 0,
            endAbsoluteRefType: 0,
            rangeType: 0,
          },
        ],
      });
    }
    // 物料编码禁用

    return [
      {
        name: 'SHEET_DATA_VALIDATION_PLUGIN',
        data: JSON.stringify(SHEET_DATA_VALIDATION_PLUGIN),
      },
      {
        name: 'SHEET_RANGE_PROTECTION_PLUGIN',
        data: JSON.stringify(SHEET_RANGE_PROTECTION_PLUGIN),
      },
    ];
  }
  if (saveRecordInfo?.id && saveRecordInfo?.data) {
    let sheetData = JSON.parse(saveRecordInfo.data);
    //对数据进行重组
    // if (isCanSet || isInternalSuppliers) {
    const maxLength = Object.values(sheetData.sheets['sheet-01'].cellData[0])?.length;
    const cellData = Object.values(sheetData.sheets['sheet-01'].cellData)?.map(v => {
      const result = new Array(maxLength).fill({
        s: '_HapSr',
        v: '',
        w: 300,
      });
      for (let i = 0; i < maxLength; i++) {
        if (v[i]) {
          result[i] = v[i];
        }
      }
      return result;
    });
    let isCanSetIndex = isInternalSuppliers ? 9 : 8;//可使用店面 索引
    let isInternalSuppliersIndex = 1; //关联编码 索引
    let isInterFlag = cellData[0][isInternalSuppliersIndex]?.v === "关联编码"; //当前数据是否有关联编码
    let isFlagCan = cellData[0][(!isInternalSuppliers && isInterFlag) ? (isCanSetIndex + 1) : isCanSetIndex]?.v === "可使用店面"; //当前数据是否有可使用店面
    cellData.forEach((item, index) => {
      //优先判断删除逻辑
      if (!isInternalSuppliers && isInterFlag) {
        item.splice(isInternalSuppliersIndex, 1);
      }
      //优先判断删除逻辑
      if (!isCanSet && isFlagCan) {
        item.splice(isCanSetIndex, 1);
      }
      if (isInternalSuppliers && !isInterFlag) {
        item.splice(isInternalSuppliersIndex, 0, !index ? {
          s: '9zf0O0',
          v: '关联编码',
        } : {
          s: '_HapSr',
          v: '',
          w: 300,
        })
      }
      if (isCanSet && !isFlagCan) {
        item.splice(isCanSetIndex, 0, !index ? {
          s: '9zf0O0',
          v: '可使用店面',
        } : {
          s: '_HapSr',
          v: '',
          w: 300,
        })
      }
    })
    sheetData.sheets['sheet-01'].cellData = cellData.reduce((acc, cur, i) => {
      acc[i] = cur.reduce((a, b, j) => {
        a[j] = b;
        return a;
      }, {});
      return acc
    }, {})
    sheetData.sheets['sheet-01'].columnCount = Object.values(
      cellData[0] || {},
    ).length;
    sheetData.resources = sheetData.resources.map((item) => {
      // if (item.name != 'SHEET_RANGE_PROTECTION_PLUGIN') {
      return (
        getResources(
          Object.keys(sheetData?.sheets['sheet-01'].cellData || {}).length,
        ).find((v) => v.name === item.name) || item
      );
      // }
      // return item;
    });
    return sheetData;
  } else {
    const dataRes = await getSheetData();
    const dataResLength = dataRes.length ? dataRes.length : 1;
    const kvs = {
      number: '编码',
      ...(isInternalSuppliers ? { relatedNumber: '关联编码' } : {}),
      model: '型号',
      name: '名称',
      typeClassStr: '一级分类',
      classStr: '二级分类',
      spec: '规格',
      // materialQuality: '材质',
      // color: '颜色',
      unitStr: '单位',
      saleMethodStr: '销售方式',
      ...(isCanSet ? { departmentIdsStr: '可使用店面' } : {}),
      purchasePrice: '采购价',
      managerPrice: '项目经理价',
      price: '销售价',
      removePrice: '折项价',
      stockDays: '备货天数',
      changeDays: '变更天数',
      distributionStr: '配送供应商',
      supplierStr: '结算供应商',
      explain: '说明',
      status: '状态',
      // updateTime: '更新时间',
      // createTime: '创建时间',
    };
    const columnWidth = {
      name: 300,
      saleMethodStr: 300,
      distributionStr: 300,
      supplierStr: 300,
      explain: 300,
      ...(isCanSet ? { departmentIdsStr: 300 } : {}),
    };
    Object.keys(kvs).forEach((v, i) => {
      sheetData.sheets['sheet-01'].columnData[i] = {
        w: columnWidth[v] || 150,
      };
    });
    const formatData = function (value, key) {
      if (key === 'saleMethodStr') {
        return (value || '')
          .split(',')
          .map((item) => item.trim())
          .join(',');
      }
      if (key === 'status') {
        return value ? '启用' : '停用';
      }
      return value;
    };
    sheetData.resources = getResources(dataResLength);
    const cellData = {};
    if (!dataRes.length) {
      let obj = {};
      Object.keys(kvs).forEach((item) => {
        obj[item] = '';
      });
      dataRes.push(obj);
    }
    const dataList = [Object.values(kvs), ...dataRes];
    let list = [];
    if (isCanSet || isInternalSuppliers) {
      list = (isCanSet && isInternalSuppliers) ? [10, 11, 12, 13] : [9, 10, 11, 12];
    } else {
      list = [8, 9, 10, 11];
    }
    dataList.forEach((item, index) => {
      if (!cellData[index]) cellData[index] = {};
      Object.keys(kvs).forEach((v, i) => {
        cellData[index][i] = {
          ...(i === 0 || index === 0 ? { s: '9zf0O0' } : { s: '_HapSr' }),
          v:
            typeof item[v] === 'object' && item[v] !== null
              ? JSON.stringify(item[v])
              : item[v] || item[v] === 0 || item[v] === false
                ? formatData(item[v], v)
                : item[i] || '',
        };
        if (i === 0 || index === 0) {
          cellData[index][i].s = '9zf0O0';
        } else if (index != 0 && list.includes(i)) {
          cellData[index][i].s = '6RlLfw';
          cellData[index][i].t = 2;
        } else {
          cellData[index][i].s = '_HapSr';
        }
      });
    });

    sheetData.sheets['sheet-01'].rowCount = dataList.length;
    sheetData.sheets['sheet-01'].columnCount = Object.keys(kvs).length;
    sheetData.sheets['sheet-01'].cellData = cellData;
    if (saveRecordInfo?.id) {
      await ctx.service.workfile.update({
        id: saveRecordInfo.id,
        updates: { data: JSON.stringify(sheetData) },
      });
    } else {
      await ctx.service.workfile.create({
        title,
        adminId,
        type: 'materialsManagement',
        targetId,
        data: JSON.stringify(sheetData),
      });
    }
  }

  async function getSheetData() {
    let sql = `SELECT
        m.*, typeClass.name as typeClassStr, class.name as classStr, brand.name as brandStr,unit.name as unitStr, distribution.name as distributionStr,supplier.name as supplierStr,  (SELECT GROUP_CONCAT(DISTINCT sm.name ORDER BY sm.name SEPARATOR ', ')
         FROM products AS sm
         WHERE FIND_IN_SET(sm.id, m.saleMethod)) AS saleMethodStr,
        GROUP_CONCAT(dps.name) as departmentIdsStr`;
    let sqlText = ` FROM materials as m
    LEFT JOIN dicts as typeClass ON m.typeClass = typeClass.id
    LEFT JOIN dicts as class ON m.class = class.id
    LEFT JOIN dicts as brand ON m.brand = brand.id
    LEFT JOIN dicts as unit ON m.unit = unit.id
    LEFT JOIN suppliers as distribution ON m.distributionId = distribution.id
    LEFT JOIN suppliers as supplier ON m.supplierId = supplier.id
    LEFT JOIN material_departments as mds ON m.id = mds.materialId
    LEFT JOIN departments as dps ON dps.id = mds.departmentId
    WHERE m.companyId = :companyId AND m.type = :type AND m.brand = :brand
    ${isInternal === "内部" ?
        "AND m.relatedNumber IS NOT NULL AND TRIM(m.relatedNumber) != ''" :
        "AND (m.relatedNumber = '' OR m.relatedNumber IS NULL)"
      }`;

    // ${isInternal === "内部" ? "AND m.relatedNumber IS NOT NULL AND TRIM(m.relatedNumber) != '';" : "AND m.relatedNumber = '' OR m.relatedNumber = NULL;"}
    const replacements = {
      brand,
      companyId,
      type,
    };
    sql += sqlText;
    sql += ' GROUP BY m.id';
    sql += ' ORDER BY m.updatedAt DESC';

    let dataRes = await ctx.model.query(sql, {
      replacements,
      type: ctx.model.QueryTypes.SELECT,
    });
    const { dataFormatHandler } = ctx.helper;
    const tasks = {
      'times-*': [
        'parseTime',
        [
          ['updatedAt', 'updateTime'],
          ['createdAt', 'createTime'],
        ],
        'id',
      ],
    };
    try {
      dataRes = await dataFormatHandler(dataRes, tasks, ctx);
      dataRes = dataRes
        .filter((item) => {
          if (isMainMaterial) {
            // 套内主材
            return !item.number.startsWith('WG');
          } else if (isMainOutMaterial) {
            // 套外主材
            return item.number.startsWith('WG');
          } else {
            // 基材
            return true;
          }
        })
        .map((item) => {
          return item;
        });
    } catch (error) {
      console.log('获取数据错误', error);
      throw new Error('获取数据错误', error);
    }
    const { data } = await ctx.model.Record.findOne({ where: { id: targetId } })
    const sheetSort = JSON.parse(data || '{}')?.sheetSort || [];
    if (sheetSort?.length) {
      const result = [];
      sheetSort.forEach(item => {
        let index = dataRes.findIndex(v => {
          if (Array.isArray(item)) {
            return item[0] === v?.model && item[1] === v?.name
          } else {
            return v?.number === item
          }
        })
        if (index != -1) {
          result.push(...dataRes.splice(index, 1))
        }
      });
      return [...result, ...dataRes]
    }
    return dataRes
  }

  return sheetData;
} catch (error) {
  return { message: error.message, error };
}