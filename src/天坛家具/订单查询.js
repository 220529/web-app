  async function list(query) {
    try {
      // const ctx = ctx;
      const orderStatusArray = query.orderStatus.split(',');
      if (query.type === 'idList') {
        const res = ctx.model.Order.findAll({
          where: {
            companyId: query.companyId,
          },
          attributes: ['id'],
        });
        return res;
      }
      const time1 = new Date().getTime();
      const info = await ctx.helper.tokenInfo(ctx);
      const uid = info.message.id;
      const supplierId = info.message.supplierId;
      const { role, user } = await ctx.helper.getRole(ctx);
      if (!user) {
        ctx.throw(404, '未找到当前登录用户，请重新登录');
      }
      const cid = user.companyId;

      // 查询指定设计师和渠道，指定月份内的所有订单
      if (
        (query.deisgnerNames && query.salespersonNames && query.month) ||
        query.relationNumbers
      ) {
        const time = new Date(query.month);
        const checkResult = await ctx.model.query(`
        SELECT o.*, p.name as productName, c.name as name, c.mobile as mobile, saler.name as salespersonName, designer.name as designerName FROM orders as o
        LEFT JOIN customers as c ON o.customerId = c.id
        LEFT JOIN users as saler ON c.salerId = saler.id
        LEFT JOIN users as designer ON c.designerId = designer.id
        LEFT JOIN products as p ON o.productId = p.id
        WHERE (FIND_IN_SET(saler.name, '${
          query.salespersonNames
        }') AND FIND_IN_SET(designer.name, '${
          query.deisgnerNames
        }') AND DATE_FORMAT(o.createdAt, '%Y-%m') = '${time.getFullYear()}-${
          time.getMonth() + 1 < 10
            ? '0' + (time.getMonth() + 1)
            : time.getMonth() + 1
        }') OR FIND_IN_SET(o.number, '${query.relationNumbers}')
      `);
        return checkResult[0];
      } else if (query.getOrdersByDesignerName) {
        const checkResult = await ctx.model.query(`
        SELECT o.*, c.name as name, c.mobile as mobile, saler.name as salespersonName, designer.name as designerName FROM orders as o
        LEFT JOIN customers as c ON o.customerId = c.id
        LEFT JOIN users as saler ON c.salerId = saler.id
        LEFT JOIN users as designer ON c.designerId = designer.id
        WHERE designer.name = '${query.getOrdersByDesignerName}'
      `);
        return checkResult[0];
      }

      const $where = {
        companyId: cid,
        [Op.and]: [],
      };

      // 订单查询列表
      if (query.dataType === 'queryOrderList') {
        return this.getOrderList(
          {
            ...query,
          },
          'o.times, o.status, saleGroup.name as saleGroupName, designGroup.name as designGroupName,',
          `LEFT JOIN departments as saleGroup ON c.saleGroupId = saleGroup.id
LEFT JOIN departments as designGroup ON c.designGroupId = designGroup.id`,
        );
      }

      // 材料下单列表
      if (
        query.dataType === 'getOrderMaterInfo' ||
        query.dataType === 'getOrderZxMaterialInfo'
      ) {
        // return ctx.service.orderMaterial.list(query);
      }

      if (query.dataType === 'supervisorOrderList') {
        return this.getSupervisorOrderList(query);
      }

      if (query.dataType === 'supplierOrderList') {
        return this.getSupplierOrderList(query);
      }

      if (
        ['supplierUnSettlementList', 'supplierSettlementList'].includes(
          query.dataType,
        )
      ) {
        return this.getSupplierSettlementList(query);
        // if (!query.supplierId) {
        //   return {
        //     rows: [],
        //     count: 0,
        //   };
        // }
        // const supplier = await ctx.model.Supplier.findByPk(query.supplierId);
        // if (!supplier) {
        //   return {
        //     rows: [],
        //     count: 0,
        //   };
        // }
        // if (![ 1, 3 ].includes(supplier.kind)) {
        //   return {
        //     rows: [],
        //     count: 0,
        //   };
        // }
        // const QUERY_STR = `
        //   SELECT o.id as orderId, o.number as contractNumber, s.name as supplierName, m.supplierId, g.name as groupName,
        //     SUM(m.auditCount * m.getPrice) as settlementAmount, count(*) as countTotal, group_concat(m.id) as ids FROM groupmaterials as m
        //   LEFT JOIN suppliers as s ON s.id = m.supplierId
        //   LEFT JOIN \`groups\` as g ON m.groupId = g.id
        //   LEFT JOIN orders as o ON o.id = g.orderId
        //   LEFT JOIN bills as sb ON sb.targetId = ${query.supplierId} AND sb.type = 604 AND FIND_IN_SET(m.id, sb.data) AND FIND_IN_SET(sb.status, '-1,1,2')
        //   WHERE m.isOrder = 4 AND m.supplierId = ${query.supplierId} AND m.auditCount > 0 AND m.type = ${supplier.kind === 1 ? 1 : 4} AND sb.id IS NULL
        //   GROUP BY g.orderId
        // `;

        // // if (query.dataType === 'supplierSettlementList') {
        // //   QUERY_STR = `
        // //     SELECT
        // //   `
        // // }
        // const orders = await ctx.model.query(`
        //   ${QUERY_STR}
        //   LIMIT 0, 10
        // `, { type: Sequelize.QueryTypes.SELECT });

        // const count = await ctx.model.query(`
        //   SELECT count(*) as count FROM (${QUERY_STR}) as t
        // `, { type: Sequelize.QueryTypes.SELECT });

        // return {
        //   rows: orders,
        //   count: count[0].count,
        // };
      }

      if (query.dataType === 'foremanSettlementList') {
        return this.getForemanSettlementList(query);
      }

      if (role.type === 'salesperson') {
        $where.salerId = uid;
      }

      if (role.type === 'salespersonLeader') {
        const departmentIds = (user.departmentId || '').split(',');
        $where.saleGroupId = {
          [Op.in]: departmentIds,
        };
        $where.sendOrder = true;
      }

      if (role.type === 'designerLeader') {
        // 设计师组长获取 客户设计组id 在设计师组长的部门id内存在即可
        const departmentIds = (user.departmentId || '').split(',');
        $where.designGroupId = {
          [Op.in]: departmentIds,
        };
      }

      if (role.type === 'designer') {
        $where.designerId = uid;
      }

      if (role.type === 'foreman') {
        $where.foremanId = uid;
      } else if (role.type === 'supervisor') {
        $where.supervisorId = uid;
      } else if (
        role.type === 'subDepartment' ||
        role.type === 'finance' ||
        role.type === 'settlement'
      ) {
        // 下级部门查看权限，获取人员所在的所有部门的，包括所有的下级部门的id，设计部在这个里面就可以看到客户数据
        // 直接获取全部的部门，再循环获取下级部门，不进行多次查询
        const allDepartment = await ctx.model.Department.findAll({
          where: {
            companyId: cid,
          },
        });
        const childrenIds = ctx.helper.getChildrenIds(
          allDepartment,
          user.departmentId.split(',').map((v) => Number(v)),
        );
        $where[Op.and].push({
          [Op.or]: {
            [Op.and]: {
              // designGroupId: {
              //   [Op.is]: null,
              // },
              saleGroupId: {
                [Op.in]: childrenIds,
              },
            },
            designGroupId: {
              [Op.in]: childrenIds,
            },
          },
        });
      }

      if (Number($where.companyId) === 0) {
        delete $where.companyId;
      }
      // const orderOptions = {
      //   where: $where,
      //   attributes: [ 'id']
      // };
      // let customers = await ctx.model.Customer.findAll(orderOptions)
      // let customerIds = customers.map((v) => v.id)
      const type = ctx.request.query.type;
      testData.type = type;
      const $whereOrder = {
        // customerId: {
        //   [Op.in]: customerIds
        // }
        // [Op.and]: [],
      };
      if (query.confirmOrderId) {
        testData.idd = 1;
        $whereOrder.id = query.confirmOrderId;
      }
      // if (query.number) {
      //   $whereOrder.number = {
      //     [Op.like]: `%${query.number}%`,
      //   };
      // }
      if (query.name) {
        $where.name = {
          [Op.like]: `%${query.name}%`,
        };
      }
      if (query.mobile) {
        $where.mobile = {
          [Op.like]: `%${query.mobile}%`,
        };
      }
      if (query.location) {
        $where.address = {
          [Op.like]: `%${query.location}%`,
        };
      }
      if (query.search) {
        $where[Op.and].push({
          [Op.or]: {
            name: {
              [Op.like]: `%${query.search}%`,
            },
            mobile: {
              [Op.like]: `%${query.search}%`,
            },
          },
        });
      }
      if (query.keyword) {
        $where[Op.and].push({
          [Op.or]: {
            name: {
              [Op.like]: `%${query.keyword}%`,
            },
            mobile: {
              [Op.like]: `%${query.keyword}%`,
            },
          },
        });
      }
      if ($where[Op.and].length === 0) {
        delete $where[Op.and];
      }
      // if (query.startDate || query.endDate) {
      //   const keys = ['updatedAt', 'createdAt'];
      //   if ([1, 2].some((t) => t === Number(query.dateType))) {
      //     $whereOrder[keys[query.dateType - 1]] = {
      //       [Op.gt]: new Date(query.startDate),
      //       [Op.lt]: new Date(query.endDate),
      //     };
      //   } else {
      //     $where[keys[query.dateType - 1]] = {
      //       [Op.gt]: new Date(query.startDate),
      //       [Op.lt]: new Date(query.endDate),
      //     };
      //   }
      // }
      if (query.projectId) {
        $where.projectId = query.projectId;
      }
      // if (query.sendStatus) {
      //   if (Number(query.sendStatus) === 2) {
      //     $where.foremanId = {
      //       [Op.ne]: null,
      //     };
      //   } else {
      //     $where.foremanId = {
      //       [Op.is]: null,
      //     };
      //   }
      // }
      if (query.budgetAuditor) {
        testData.budgetAuditor = 1;
        $whereOrder.budgetAuditor = query.budgetAuditor;
      }
      // if (role.type === 'finance') {
      //   $whereOrder.status = {
      //     [Op.in]: [1, 2],
      //   };
      // }
      if (query.orderStatus) {
        // if (Number(query.orderStatus) === 12) {
        //   $whereOrder.completed = 2;
        // } else if (Number(query.orderStatus) === 13) {
        //   $whereOrder.completed = 3;
        // } else if (Number(query.orderStatus) === 11) {
        //   query.projectStatus = 2;
        // } else if (Number(query.orderStatus) === 21) {
        //   query.isStart = 1;
        // } else if (Number(query.orderStatus) === 22) {
        //   query.isScheduling = 1;
        // } else {
        //   $whereOrder.status = query.orderStatus;
        // }
        $whereOrder[Op.or] = $whereOrder[Op.or] || [];
        const status = [];
        // 报价中、已签单、已锁单
        if (orderStatusArray.includes('0')) {
          status.push(0);
        }
        if (orderStatusArray.includes('1')) {
          status.push(1);
        }
        if (orderStatusArray.includes('2')) {
          status.push(2);
        }
        if (status.length > 0) {
          $whereOrder[Op.or].push({
            status: {
              [Op.in]: status,
            },
          });
        }
        // 已竣工
        if (orderStatusArray.includes('11')) {
          query.projectStatus = 2;
        }
        // 已退单、已作废
        const completed = [];
        if (orderStatusArray.includes('12')) {
          completed.push(2);
        }
        if (orderStatusArray.includes('13')) {
          completed.push(3);
        }
        if (completed.length > 0) {
          testData.cc = 1;
          $whereOrder[Op.or].push({
            completed: {
              [Op.in]: completed,
            },
          });
        }
        // 已开工
        if (orderStatusArray.includes('21')) {
          query.isStart = 1;
        }
        // 已排期
        if (orderStatusArray.includes('22')) {
          query.isScheduling = 1;
        }
        testData.completed = completed;
        testData.status = status;
      }
      if (role.type === 'finance') {
        if (Number(query.orderStatus) === 0) {
          testData.s2 = 1;
          $whereOrder.status = {
            [Op.in]: [1, 2],
          };
        }
      }
      if (query.budgetStatus) {
        testData.b2 = 1;
        $whereOrder.auditStatus = query.budgetStatus;
      }
      if (['budget'].includes(type)) {
        testData.b3 = 1;
        $whereOrder.status = 1;
      }
      if (
        [
          'change',
          'customChange',
          'hchange',
          'allocation',
          'hMaterialAudit',
          'hMaterialPay',
          'hMaterialReceive',
          'distribution',
          'hdistribution',
          'replenishmentAudit',
          'supervise',
          'projectSettle',
          'projectSettleAudit',
          'projectSettleFinance',
          'out',
          'outOrderAudit',
          'outOrderPay',
          'remind',
          'remindAudit',
        ].some((t) => type === t)
      ) {
        testData.a1 = 1;
        $whereOrder.auditStatus = 2;
      }
      if (['finance', 'project'].some((v) => type === v)) {
        testData.s4 = 1;
        $whereOrder.status = {
          [Op.in]: [1, 2],
        };
      }
      if (['finalAccounts'].some((v) => type === v)) {
        testData.s5 = 1;
        $whereOrder.completed = true;
      }
      if (query.contractStatus) {
        testData.s6 = 1;
        $whereOrder.status = query.contractStatus;
      }
      if (query.completeStatus) {
        testData.s7 = 1;
        if (Number(query.completeStatus) === 1) {
          $whereOrder.completed = 1;
        }
        if (Number(query.completeStatus) === 2) {
          $whereOrder.completed = {
            [Op.or]: {
              [Op.ne]: 1,
              [Op.is]: null,
            },
          };
          $whereOrder.status = {
            [Op.in]: [1, 2],
          };
        }
      }
      if (Number(cid) !== 0) {
        testData.cid = cid;
        $whereOrder.companyId = cid;
      }
      if (query.companyId) {
        $whereOrder.companyId = query.companyId;
      }
      if (supplierId) {
        testData.s7 = 1;
        const supplier = await ctx.model.Supplier.findByPk(supplierId);
        $whereOrder.companyId = supplier.companyId;
      }

      // 项目经理和监理派单状态
      if (query.projectSendStatus) {
        testData.budgetAuditor = 1;
        if (Number(s8.projectSendStatus) === 1) {
          $where.foremanId = {
            [Op.is]: null,
          };
        } else if (Number(query.projectSendStatus) === 2) {
          $where.supervisorId = {
            [Op.is]: null,
          };
        } else if (Number(query.projectSendStatus) === 3) {
          $where.foremanId = {
            [Op.ne]: null,
          };
        } else if (Number(query.projectSendStatus) === 4) {
          $where.supervisorId = {
            [Op.ne]: null,
          };
        }
      }

      // 项目经理派单状态
      if (query.isSendForeman) {
        if (Number(query.isSendForeman) === 2) {
          $where.foremanId = {
            [Op.is]: null,
          };
        } else if (Number(query.isSendForeman) === 1) {
          $where.foremanId = {
            [Op.ne]: null,
          };
        }
      }

      // 监理派单状态
      if (query.isSendSupervisor) {
        if (Number(query.isSendSupervisor) === 2) {
          $where.supervisorId = {
            [Op.is]: null,
          };
        } else if (Number(query.isSendSupervisor) === 1) {
          $where.supervisorId = {
            [Op.ne]: null,
          };
        }
      }

      if (['customChange', 'custom', 'hchange'].includes(type)) {
        delete $where.designerId;
      }
      const { offset, limit } = ctx.helper.getPageLimit(query);
      const Order = ctx.model.Order;
      const Customer = ctx.model.Customer;
      const includes = [
        {
          association: Order.hasOne(Customer, {
            sourceKey: 'customerId',
            foreignKey: 'id',
          }),
          model: Customer,
          attributes: ['id', 'name', 'status'],
          where: $where,
        },
      ];

      if (query.designerName) {
        const User = ctx.model.User;
        includes[0].include = [
          {
            association: Customer.hasOne(User, {
              sourceKey: 'designerId',
              foreignKey: 'id',
            }),
            model: User,
            attributes: ['id', 'name'],
            where: {
              name: query.designerName,
            },
          },
        ];
      }

      // 定制设计师是否派单
      if (
        role.type === 'customDesigner' ||
        [1, 2].includes(Number(query.isSendCustomDesigner))
      ) {
        const UserRel = ctx.model.UserRel;
        const $urWhere = {
          type: 4,
        };
        if (role.type === 'customDesigner') {
          $urWhere.userId = uid;
        } else if (Number(query.isSendCustomDesigner) === 1) {
          $urWhere.targetId = {
            [Op.ne]: null,
          };
        }

        if (Order.associations && Order.associations.customDesignerRel) {
          delete Order.associations.customDesignerRel;
        }

        const includeItem = {
          association: Order.hasOne(UserRel, {
            as: 'customDesignerRel',
            sourceKey: 'id',
            foreignKey: 'targetId',
          }),
          model: UserRel,
          where: $urWhere,
        };

        if (
          Number(query.isSendCustomDesigner) === 2 &&
          role.type !== 'customDesigner'
        ) {
          includeItem.required = false;
          $whereOrder['$customDesignerRel.id$'] = {
            [Op.is]: null,
          };
        }
        includes.push(includeItem);
      }

      const processQuery = (query, property, type) => {
        testData.a2 = 1;
        if ([1, 2, 3].includes(Number(query[property]))) {
          const UserRel = ctx.model.UserRel;
          const $urWhere = {
            type,
          };

          if (Number(query[property]) === 1) {
            $whereOrder[`$${property}.id$`] = {
              [Op.ne]: null,
            };
          } else if (Number(query[property]) === 3) {
            $whereOrder[`$${property}.id$`] = {
              [Op.ne]: null,
            };
            $whereOrder[`$${property}.userId$`] = uid;
          }

          if (Order.associations && Order.associations[property]) {
            delete Order.associations[property];
          }

          const includeItem = {
            association: Order.hasOne(UserRel, {
              as: property,
              sourceKey: 'id',
              foreignKey: 'targetId',
            }),
            model: UserRel,
            where: $urWhere,
          };

          if (Number(query[property]) === 2) {
            includeItem.required = false;
            $whereOrder[`$${property}.id$`] = {
              [Op.is]: null,
            };
          }

          includes.push(includeItem);
        }
      };

      // processQuery(query, 'isGetMater', 1);
      // processQuery(query, 'isGetOutMater', 5);
      // processQuery(query, 'isGetBase', 2);
      // processQuery(query, 'isGetMaterAudit', 6);
      // processQuery(query, 'isGetOutMaterAudit', 7);
      // processQuery(query, 'isGetZxMater', 8);

      // 是否已排期
      if (Object.keys(query).includes('isScheduling')) {
        // let required = false;
        // const $whereRecord = {
        //   type: 18,
        // };
        // if (Number(query.schedulingStatus) === 1) {
        //   required = true;
        // } else if (Number(query.schedulingStatus) === 0) {
        //   $whereOrder['$record.id$'] = null;
        // }
        // const Record = ctx.model.Record;
        // includes.push({
        //   association: Order.hasOne(Record, { sourceKey: 'id', foreignKey: 'targetId' }),
        //   model: Record,
        //   required,
        //   includes: [ 'id' ],
        //   where: $whereRecord,
        // });
        testData.s9 = 1;
        if (query.orderStatus) {
          $whereOrder[Op.or].push({ isScheduling: Number(query.isScheduling) });
        } else {
          $whereOrder.isScheduling = Number(query.isScheduling);
        }
      }

      // 是否已开工
      if (Object.keys(query).includes('isStart')) {
        testData.d2 = 1;
        if (query.orderStatus) {
          $whereOrder[Op.or].push({ isStart: Number(query.isStart) });
        } else {
          $whereOrder.isStart = Number(query.isStart);
        }
      }

      // 工程状态
      if (
        Object.keys(query).includes('projectStatus') &&
        [0, 1, 2, 3].includes(Number(query.projectStatus))
      ) {
        const Record = ctx.model.Record;
        const $opsWhere = {
          type: 18,
          status: Number(query.projectStatus),
        };

        if (Order.associations && Order.associations.orderProjectStatus) {
          delete Order.associations.orderProjectStatus;
        }

        const includeItem = {
          association: Order.hasOne(Record, {
            as: 'orderProjectStatus',
            sourceKey: 'id',
            foreignKey: 'targetId',
          }),
          model: Record,
          where: $opsWhere,
        };

        if (query.orderStatus && query.projectStatus === 2) {
          includeItem.required = false;
          $whereOrder[Op.or].push({
            '$orderProjectStatus.targetId$': {
              [Op.ne]: null,
            },
          });
        }
        testData.query = query;

        includes.push(includeItem);
      }

      const options = {
        offset,
        limit,
        where: $whereOrder,
        model: Order,
        include: includes,
        order: [['updatedAt', 'desc']],
        // required: false,
      };
      testData.q1 = JSON.stringify($whereOrder[Op.or]);
      testData.q2 = Object.keys($whereOrder[Op.or]).length;
      testData.$whereOrder = $whereOrder[Op.or];

      // 预算审核文件
      if (
        Number(query.budgetReviewFileNum) === 2 ||
        Number(query.budgetReviewFileNum) === 1
      ) {
        testData.g = 1;
        const File = ctx.model.File;
        const $fileWhere = {
          type: 32,
        };

        if (Order.associations && Order.associations.budgetReviewFile) {
          delete Order.associations.budgetReviewFile;
        }

        const includeItem = {
          association: Order.hasOne(File, {
            as: 'budgetReviewFile',
            sourceKey: 'id',
            foreignKey: 'targetId',
          }),
          model: File,
          where: $fileWhere,
        };

        if (Number(query.budgetReviewFileNum) === 2) {
          includeItem.required = false;
          $whereOrder['$budgetReviewFile.id$'] = {
            [Op.is]: null,
          };
        } else if (Number(query.budgetReviewFileNum) === 1) {
          includeItem.required = true;
          $whereOrder['$budgetReviewFile.id$'] = {
            [Op.ne]: null,
          };
        }

        includes.push(includeItem);

        if (!options.group) {
          options.group = ['id'];
        }
      }

      let queryWaitDistributionMaterNum = query.waitDistributionMaterNum;

      if (
        [1, 2, 3, 4, 5, 6, 7].includes(Number(query.waitDistributionZxMaterNum))
      ) {
        queryWaitDistributionMaterNum = query.waitDistributionZxMaterNum;
      }

      // 套内复核 101 套外复核 102 套内复核通过 103 套外复核通过 104
      // 主材及配送单状态筛选
      let isFilterMaterialAndPsBillStatus = [
        1, 2, 3, 4, 5, 6, 7, 101, 103,
      ].includes(Number(queryWaitDistributionMaterNum));
      // 套外主材状态筛选
      const isFilterOutMaterialStatus = [102, 104].includes(
        Number(query.waitDistributionOutMaterNum),
      );
      // 主材除配送单状态筛选
      let isFilterMaterialStatusWithoutDistribution = [1, 101, 103].includes(
        Number(queryWaitDistributionMaterNum),
      );
      // 套内主材状态筛选
      const isFilterMaterialStatus = [101, 103].includes(
        Number(queryWaitDistributionMaterNum),
      );

      // 收货单状态筛选及待收货物料，不含收货审核中物料
      const isWaitReceiveMater = Number(query.isWaitReceiveMater) === 1;
      if (isWaitReceiveMater) {
        isFilterMaterialAndPsBillStatus = true;
        isFilterMaterialStatusWithoutDistribution = true;
      }

      // 配送单状态筛选

      // 配送状态
      if (
        isFilterMaterialAndPsBillStatus ||
        isFilterOutMaterialStatus ||
        [1, 2, 3, 4, 5, 6, 7].includes(Number(query.waitDistributionBaseNum))
      ) {
        testData.f = 1;
        const Bill = ctx.model.Bill;
        const Group = ctx.model.Group;
        const GroupMaterial = ctx.model.GroupMaterial;
        let $groupWhere = {};
        const $billWhere = {
          type: 711,
        };

        // $whereOrder.isUseDeliveryBill = 1;

        if (isFilterMaterialAndPsBillStatus || isFilterOutMaterialStatus) {
          $billWhere.kind = 1;
        } else if (
          [1, 2, 3, 4, 5, 6, 7].includes(Number(query.waitDistributionBaseNum))
        ) {
          $billWhere.kind = 2;
        }

        if (
          [1, 2, 3, 4, 5, 6, 7].includes(
            Number(query.waitDistributionZxMaterNum),
          )
        ) {
          $billWhere.kind = 3;
        }

        if (Order.associations && Order.associations.psBill) {
          delete Order.associations.psBill;
        }
        if (Order.associations && Order.associations.psGroup) {
          delete Order.associations.psGroup;
        }
        if (Group.associations && Group.associations.psMaterial) {
          delete Group.associations.psMaterial;
        }

        if (
          isFilterMaterialStatusWithoutDistribution ||
          isFilterOutMaterialStatus ||
          Number(query.waitDistributionBaseNum) === 1
        ) {
          testData.e = 1;
          if (
            (isFilterMaterialStatusWithoutDistribution ||
              isFilterOutMaterialStatus) &&
            Number(query.waitDistributionBaseNum) === 1
          ) {
            $groupWhere = {
              type: {
                [Op.notIn]: [17],
              },
            };
            if (Number(query.waitDistributionZxMaterNum) === 1) {
              $groupWhere = {
                type: 17,
              };
            }
          } else if (
            isFilterMaterialStatusWithoutDistribution ||
            isFilterOutMaterialStatus
          ) {
            $groupWhere = {
              type: {
                [Op.notIn]: [14, 17],
              },
            };
            if (Number(query.waitDistributionZxMaterNum) === 1) {
              $groupWhere = {
                type: 17,
              };
            }
          } else if (Number(query.waitDistributionBaseNum) === 1) {
            $groupWhere = {
              type: 14,
            };
          }

          let isOrderStatus = 2;

          if (isWaitReceiveMater) {
            isOrderStatus = 3;
          }

          let $whereAnd = [
            {
              type: 1,
              isOrder: isOrderStatus,
            },
          ];

          if (
            isFilterMaterialStatusWithoutDistribution ||
            isFilterOutMaterialStatus
          ) {
            if (isFilterMaterialStatus || isFilterOutMaterialStatus) {
              let $materialWhere = {};

              if (isFilterMaterialStatus && isFilterOutMaterialStatus) {
                $materialWhere = {};
              } else if (isFilterMaterialStatus) {
                $materialWhere = {
                  [Op.or]: [
                    {
                      [Op.and]: [
                        {
                          number: {
                            [Op.notLike]: 'WG%',
                          },
                        },
                        {
                          number: {
                            [Op.notLike]: 'DZ%',
                          },
                        },
                      ],
                    },
                    {
                      number: {
                        [Op.is]: null,
                      },
                    },
                  ],
                };
              } else if (isFilterOutMaterialStatus) {
                $materialWhere = {
                  [Op.or]: [
                    {
                      number: {
                        [Op.like]: 'WG%',
                      },
                    },
                    {
                      number: {
                        [Op.like]: 'DZ%',
                      },
                    },
                  ],
                };
              }

              $whereAnd = [
                {
                  isOrder: isOrderStatus,
                  auditStatus:
                    Number(query.waitDistributionOutMaterNum) === 104 ||
                    Number(queryWaitDistributionMaterNum) === 103
                      ? 2
                      : 1,
                  ...$materialWhere,
                },
              ];
            } else {
              $whereAnd = [
                {
                  isOrder: isOrderStatus,
                  auditStatus: {
                    [Op.ne]: 1,
                  },
                },
              ];
            }
          }

          if (process.env.EGG_SERVER_ENV !== 'test') {
            $whereAnd.push(
              Sequelize.where(
                Sequelize.literal(`(
                SELECT COUNT(*)
                FROM bills as b
                WHERE b.type = 711 AND FIND_IN_SET(\`psGroup->psMaterial\`.id, b.data) AND b.status <> 0
              )`),
                {
                  [Op.lt]: 1,
                },
              ),
            );
          }

          const materialRel = {
            association: Group.hasOne(GroupMaterial, {
              as: 'psMaterial',
              sourceKey: 'id',
              foreignKey: 'groupId',
            }),
            model: GroupMaterial,
            attributes: ['id'],
            required: true,
            where: {
              [Op.and]: $whereAnd,
            },
          };

          includes.push({
            association: Order.hasOne(Group, {
              as: 'psGroup',
              sourceKey: 'id',
              foreignKey: 'orderId',
            }),
            model: Group,
            attributes: ['id'],
            where: $groupWhere,
            include: [materialRel],
            required: true,
          });
        } else {
          testData.d = 1;
          if (
            [2, 3, 4, 5, 6, 7].includes(
              Number(queryWaitDistributionMaterNum),
            ) ||
            [2, 3, 4, 5, 6, 7].includes(Number(query.waitDistributionBaseNum))
          ) {
            $billWhere.status =
              Number(queryWaitDistributionMaterNum) - 1 ||
              Number(query.waitDistributionBaseNum) - 1;
          }

          $whereOrder['$psBill.id$'] = {
            [Op.ne]: null,
          };

          includes.push({
            association: Order.hasOne(Bill, {
              as: 'psBill',
              sourceKey: 'id',
              foreignKey: 'targetId',
            }),
            model: Bill,
            attributes: ['id'],
            where: $billWhere,
            required: false,
          });
        }
        if (!options.group) {
          options.group = ['id'];
        }
      }

      // 是否有待下单主材
      if (
        Number(query.isWaitOrderMater) === 1 ||
        Number(query.isWaitOrderBase) === 1 ||
        Number(query.isWaitOrderOutMater) === 1
      ) {
        testData.c = 1;
        const Group = ctx.model.Group;
        const GroupMaterial = ctx.model.GroupMaterial;
        let $groupWhere = {};
        let $materialWhere = {};
        if (
          (Number(query.isWaitOrderMater) === 1 ||
            Number(query.isWaitOrderOutMater) === 1) &&
          Number(query.isWaitOrderBase) === 1
        ) {
          $groupWhere = {};
        } else if (
          Number(query.isWaitOrderMater) === 1 ||
          Number(query.isWaitOrderOutMater) === 1
        ) {
          $groupWhere = {
            type: {
              [Op.ne]: 14,
            },
          };

          if (
            Number(query.isWaitOrderMater) === 1 &&
            Number(query.isWaitOrderOutMater) === 1
          ) {
            $materialWhere = {};
          } else if (Number(query.isWaitOrderMater) === 1) {
            $materialWhere = {
              [Op.or]: [
                {
                  [Op.and]: [
                    {
                      number: {
                        [Op.notLike]: 'WG%',
                      },
                    },
                    {
                      number: {
                        [Op.notLike]: 'DZ%',
                      },
                    },
                  ],
                },
                {
                  number: {
                    [Op.is]: null,
                  },
                },
              ],
            };
          } else if (Number(query.isWaitOrderOutMater) === 1) {
            $materialWhere = {
              [Op.or]: [
                {
                  number: {
                    [Op.like]: 'WG%',
                  },
                },
                {
                  number: {
                    [Op.like]: 'DZ%',
                  },
                },
              ],
            };
          }
        } else if (Number(query.isWaitOrderBase) === 1) {
          $groupWhere = {
            type: 14,
          };
        }
        includes.push({
          association: Order.hasOne(Group, {
            sourceKey: 'id',
            foreignKey: 'orderId',
          }),
          model: Group,
          attributes: ['id'],
          where: $groupWhere,
          include: [
            {
              association: Group.hasOne(GroupMaterial, {
                sourceKey: 'id',
                foreignKey: 'groupId',
              }),
              model: GroupMaterial,
              attributes: ['id'],
              required: true,
              where: {
                isOrder: 1,
                ...$materialWhere,
              },
            },
          ],
          required: true,
        });
        if (!options.group) {
          options.group = ['id'];
        }
      }

      // 是否有待审核收货单据;
      if (
        Number(query.isWaitReceiveMaterAudit) === 1 ||
        Number(query.isWaitReceiveBaseAudit) === 1 ||
        Number(query.isWaitReceiveZxMaterAudit) === 1
      ) {
        testData.b = 1;
        const Record = ctx.model.Record;
        let $recordWhere = {
          status: 1,
          type: 21,
        };
        if (
          Number(query.isWaitReceiveMaterAudit) === 1 &&
          Number(query.isWaitReceiveBaseAudit) === 1
        ) {
          $recordWhere = {
            status: 1,
            type: 21,
          };
        } else if (Number(query.isWaitReceiveMaterAudit) === 1) {
          $recordWhere.houseType = 1;
        } else if (Number(query.isWaitReceiveBaseAudit) === 1) {
          $recordWhere.houseType = 2;
        }

        if (Number(query.isWaitReceiveZxMaterAudit) === 1) {
          $recordWhere.houseType = 3;
        }

        includes.push({
          association: Order.hasOne(Record, {
            sourceKey: 'id',
            foreignKey: 'targetId',
          }),
          model: Record,
          attributes: ['id'],
          where: $recordWhere,
          required: true,
        });
        if (!options.group) {
          options.group = ['id'];
        }
      }

      // 是否有待审核退货单据;
      if (
        Number(query.isWaitAuditReturnMaterBill) === 1 ||
        Number(query.isWaitAuditReturnBaseBill) === 1 ||
        Number(query.isWaitAuditReturnZxMaterBill) === 1
      ) {
        testData.a = 1;
        const Bill = ctx.model.Bill;
        const $billWhere = {
          status: 1,
        };
        if (
          Number(query.isWaitAuditReturnMaterBill) === 1 &&
          Number(query.isWaitAuditReturnBaseBill) === 1
        ) {
          $billWhere.type = {
            [Op.in]: [801, 802],
            kind: {
              [Op.ne]: 2,
            },
          };
        } else if (Number(query.isWaitAuditReturnMaterBill) === 1) {
          $billWhere.type = 801;
          $billWhere.kind = {
            [Op.ne]: 2,
          };
        } else if (Number(query.isWaitAuditReturnBaseBill) === 1) {
          $billWhere.type = 802;
        }

        if (Number(query.isWaitAuditReturnZxMaterBill) === 1) {
          $billWhere.type = 801;
          $billWhere.kind = 2;
        }

        includes.push({
          association: Order.hasOne(Bill, {
            sourceKey: 'id',
            foreignKey: 'targetId',
          }),
          model: Bill,
          attributes: ['id'],
          where: $billWhere,
          required: true,
        });
        if (!options.group) {
          options.group = ['id'];
        }
      }

      query.setRoleType = role.type;
      // testData.options = JSON.stringify(options);
      const orders = await getOrders(options, {
        ...query,
        isDesigner: role.type === 'designer',
        setUserCompanyId: user.companyId,
      });
      if (
        [
          'foremanOrderList',
          'getOrderMaterInfo',
          'getOrderZxMaterialInfo',
        ].includes(query.dataType) &&
        orders.rows.length > 0
      ) {
        const orderIds = orders.rows.map((v) => v.id);
        ctx.request.query = {
          page: 1,
          limit: 1000,
          type:
            query.dataType === 'getOrderZxMaterialInfo'
              ? 'zx'
              : 'getAllMaterialAndOut',
          orderIds: orderIds.join(','),
        };
        const groups = await ctx.service.group.list();

        let files = [];
        if (Number(query.getDeliveryQrcode) === 1) {
          const fileIds = orders.rows
            .map((v) => v.deliveryQrcode && v.deliveryQrcode.houseType)
            .filter((v) => v);

          files = await ctx.model.File.findAll({
            where: {
              id: {
                [Op.in]: fileIds,
              },
            },
          });
        }

        orders.rows = orders.rows.map((v) => {
          const oGroups = groups.filter((g) => g.orderId === v.id);
          const allMater = oGroups.reduce((acc, cur) => {
            return acc.concat(cur.mater);
          }, []);
          const allBase = oGroups.reduce((acc, cur) => {
            return acc.concat(cur.base || []);
          }, []);

          ctx.service.orderMaterial.formatOrderListMaterialNums(
            v,
            allMater,
            allBase,
            query,
          );

          if (Number(query.getDeliveryQrcode) === 1) {
            const file = files.find(
              (f) => v.deliveryQrcode && v.deliveryQrcode.houseType === f.id,
            );
            v.deliveryQrcodeUrl = ctx.helper.getFileUrl(file && file.url);
          }

          return v;
        });
      }
      // if (query.dataType === 'supervisorOrderList' && orders.rows.length > 0) {
      //   const orderIds = orders.rows.map(v => v.id);

      //   const projectNodes = await ctx.model.Project.findAll({
      //     where: {
      //       kind: 3,
      //       targetId: {
      //         [Op.in]: orderIds,
      //       },
      //     },
      //   });

      //   orders.rows = orders.rows.map(v => {
      //     const pNodes = projectNodes.filter(p => p.targetId === v.id);
      //     const waitHandleNum = pNodes.filter(p => {
      //       const data = JSON.parse(p.data || '{}').configData || {};
      //       return p.status === 1 && data.roleType === 'supervisor';
      //     }).length;
      //     v.waitHandleNum = waitHandleNum;
      //     return v;
      //   });
      // }
      if (options.group) {
        orders.count = orders.count.length;
      }
      return { testData, orders };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }
  async function getOrders(options, query = {}) {
    // const ctx = ctx;
    let orders = [];
    query.getRelUsers = Number(query.getRelUsers) === 1;
    if (query.setRoleType === 'vip') {
      options.include.push({
        association: ctx.model.Order.hasOne(ctx.model.Record, {
          sourceKey: 'id',
          foreignKey: 'targetId',
        }),
        model: ctx.model.Record,
        where: {
          type: 15,
        },
        required: true,
      });
      //   const Record = ctx.model.Record;
      //   const recordOptions = {
      //     offset: options.offset,
      //     limit: options.limit,
      //     model: Record,
      //     where: {
      //       type: 15,
      //     },
      //     order: [[ 'updatedAt', 'desc' ]],
      //   };
      //   delete options.offset;
      //   delete options.limit;
      //   delete options.order;
      //   recordOptions.include = [{
      //     association: Record.hasOne(ctx.model.Order, { sourceKey: 'targetId', foreignKey: 'id' }),
      //     ...options,
      //   }];
      //   orders = await Record.findAndCountAll(recordOptions);
      //   orders.rows = ctx.helper.copy(orders.rows).map(v => v.order || {});
      // } else {
    }
    orders = await ctx.model.Order.findAndCountAll(options);
    const tasks = [];
    let customers = [];
    tasks.push(
      new Promise(async (r) => {
        const customerIds = [];
        orders.rows.forEach((v) => {
          customerIds.push(v.customerId);
        });
        // if (query.getRelUsers && orders.rows.length > 0) {
        //   query.orderMaps = new Map();
        //   orders.rows.forEach((v) => {
        //     query.orderMaps.set(v.customerId, v.id);
        //   });
        // }
        customers = await ctx.service.customer.findAll({
          where: {
            id: {
              [Op.in]: customerIds,
            },
          },
        });
        r();
      }),
    );
    let users = [];
    let userRels = [];
    const getMaterialOrderListRelationUser =
      Number(query.getMaterialOrderListRelationUser) === 1;
    tasks.push(
      new Promise(async (r) => {
        const orderIds = [];
        orders.rows.forEach((v) => {
          orderIds.push(v.id);
        });
        const userIds = [];
        if (getMaterialOrderListRelationUser) {
          userRels = await ctx.model.UserRel.findAll({
            where: {
              type: {
                [Op.in]: [1, 2, 4, 5, 6, 7, 8],
              },
              targetId: {
                [Op.in]: orderIds,
              },
            },
          });
          userRels.forEach((v) => {
            userIds.push(v.userId);
          });
        }

        users = await ctx.model.User.findAll({
          where: {
            id: {
              [Op.in]: userIds,
            },
          },
          attributes: ['id', 'name', 'mobile', 'avatarUrl'],
        });
        r();
      }),
    );

    let files = [];
    if (getMaterialOrderListRelationUser) {
      tasks.push(
        new Promise(async (r) => {
          const orderIds = [];
          orders.rows.forEach((v) => {
            orderIds.push(v.id);
          });
          files = await ctx.model.File.findAll({
            where: {
              targetId: {
                [Op.in]: orderIds,
              },
              type: 32,
            },
          });
          r();
        }),
      );
    }

    let products = [];
    tasks.push(
      new Promise(async (r) => {
        const productIds = [];
        orders.rows.forEach((v) => {
          productIds.push(v.productId);
        });
        products = await ctx.model.Product.findAll({
          where: {
            id: {
              [Op.in]: productIds,
            },
          },
          attributes: ['id', 'name'],
        });
        r();
      }),
    );
    let needRecords = [];
    tasks.push(
      new Promise(async (r) => {
        const orderIds = [];
        orders.rows.forEach((v) => {
          orderIds.push(v.id);
        });

        const getTypes = [15, 18, 21, 22, 56];

        needRecords = await ctx.model.Record.findAll({
          where: {
            type: {
              [Op.in]: getTypes,
            },
            targetId: {
              [Op.in]: orderIds,
            },
          },
          attributes: [
            'id',
            'type',
            'title',
            'targetId',
            'data',
            'createdAt',
            'status',
            'houseType',
          ],
        });
        r();
      }),
    );
    let bills = [];
    tasks.push(
      new Promise(async (r) => {
        const orderIds = [];
        orders.rows.forEach((v) => {
          orderIds.push(v.id);
        });
        bills = await ctx.model.Bill.findAll({
          where: {
            targetId: {
              [Op.in]: orderIds,
            },
            status: {
              [Op.in]: [0, 1, 2, 3, 4],
            },
            type: {
              [Op.in]: [
                111, 201, 202, 203, 301, 401, 402, 403, 501, 502, 503, 504, 505,
                506, 507, 508, 509, 801, 802,
              ],
            },
          },
          attributes: ['id', 'type', 'kind', 'targetId', 'amount', 'status'],
        });
        r();
      }),
    );

    let groups = [];
    tasks.push(
      new Promise(async (r) => {
        const orderIds = [];
        orders.rows.forEach((v) => {
          orderIds.push(v.id);
        });
        groups = await ctx.model.Group.findAll({
          where: {
            name: '499至尊礼包',
            area: {
              [Op.gt]: 0,
            },
            orderId: {
              [Op.in]: orderIds,
            },
          },
          attributes: ['id', 'orderId'],
        });
        r();
      }),
    );

    // let orderTasks = [];
    // if (Number(query.getIsStart) === 1) {
    //   tasks.push(new Promise(async r => {
    //     const orderIds = [];
    //     orders.rows.forEach(v => {
    //       orderIds.push(v.id);
    //     });
    //     orderTasks = await ctx.model.Task.findAll({
    //       where: {
    //         type: 'task',
    //         taskType: 2,
    //         associationId: {
    //           [Op.in]: orderIds,
    //         },
    //       },
    //       attributes: [ 'id', 'status', 'associationId', 'name', 'workflowId' ],
    //     });
    //     r();
    //   }));
    // }
    await Promise.all(tasks);

    orders.rows = ctx.helper.copy(orders.rows).map((v) => {
      const customer = customers.find((c) => c.id === v.customerId);

      // 客户信息
      v.customer = customer;
      v.name = customer && customer.name;
      v.location = customer && customer.location;
      v.mobile = customer && customer.mobile;

      // if (!query.isDesigner && Number(query.setUserCompanyId) === 11) {
      //   v.mobile = ctx.helper.hideMobile(v.mobile);
      // }

      // 设计师信息
      v.designerName = (customer && customer.designerName) || '无';
      v.designerMobile = (customer && customer.designerMobile) || '无';
      v.designerAvatarUrl = (customer && customer.designerAvatarUrl) || '';

      // 项目经理信息
      v.foremanName = (customer && customer.foremanName) || '无';
      v.foremanMobile = (customer && customer.foremanMobile) || '无';
      v.foremanAvatarUrl = (customer && customer.foremanAvatarUrl) || '';
      if (customer && customer.foremanId) {
        v.isSendForeman = true;
      }

      // 监理信息
      v.supervisorName = (customer && customer.supervisorName) || '无';
      v.supervisorMobile = (customer && customer.supervisorMobile) || '无';
      v.supervisorAvatarUrl = (customer && customer.supervisorAvatarUrl) || '';
      if (customer && customer.supervisorId) {
        v.isSendSupervisor = true;
      }

      v.area = (customer && customer.area) || 0;
      v.houseTypeName = (customer && customer.houseTypeName) || '未选择';
      const product = products.find((c) => c.id === v.productId);
      v.productName = (product && product.name) || '未选择';
      const group = groups.find((g) => g.orderId === v.id);
      if (group) {
        v.productName += '+499';
      }

      const orderBills = bills.filter(
        (b) => b.targetId === v.id && [2, 4, 1].includes(b.status),
      );
      v.designAmount = orderBills
        .filter((b) => b.status === 2 && b.type === 111)
        .reduce((s, v) => s + v.amount, 0);
      v.handsel =
        orderBills
          .filter((b) => b.status === 2 && b.type === 301)
          .reduce((s, v) => s + v.amount, 0) -
        orderBills
          .filter((b) => b.status === 4 && b.type === 401)
          .reduce((s, v) => s + v.amount, 0);
      v.refundAuditNum = orderBills.filter(
        (b) => b.status === 1 && [401, 402, 403].includes(b.type),
      ).length;
      v.refundAllNum = orderBills.filter((b) =>
        [401, 402, 403].includes(b.type),
      ).length;
      v.prefAuditNum = orderBills.filter(
        (b) => b.status === 1 && [201, 202, 203].includes(b.type),
      ).length;
      v.prefAllNum = orderBills.filter((b) =>
        [201, 202, 203].includes(b.type),
      ).length;
      v.changeAuditNum = orderBills.filter(
        (b) =>
          b.status === 1 &&
          [501, 502, 503, 504, 505, 506, 507, 508, 509].includes(b.type),
      ).length;
      v.changeAllNum = orderBills.filter((b) =>
        [501, 502, 503, 504, 505, 506, 507, 508, 509].includes(b.type),
      ).length;
      // 设置VIP类型
      const vipRecord = needRecords.filter(
        (r) => r.type === 15 && r.targetId === v.id,
      );
      if (vipRecord.length > 0) {
        v.vipType = vipRecord.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0].data;
      } else {
        v.vipType = '';
      }

      // 设置配送二维码
      const deliveryQrcodeRecords = needRecords
        .filter((r) => r.type === 56 && r.targetId === v.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      v.deliveryQrcodeRecordNum = deliveryQrcodeRecords.length;
      v.deliveryQrcode = deliveryQrcodeRecords[0];

      // 工程状态
      const orderProjectRecord = needRecords.find(
        (r) => r.type === 18 && r.targetId === v.id,
      );
      if (orderProjectRecord) {
        v.projectStatus = orderProjectRecord.status;
      } else {
        v.projectStatus = -1;
      }

      // 暂停单
      const pauseRecords = needRecords.filter(
        (r) => r.type === 22 && r.targetId === v.id,
      );
      v.pauseRecordNum = pauseRecords.length;
      // 暂停中
      v.pauseStatus =
        pauseRecords.filter((r) => {
          const data = JSON.parse(r.data || '{}');

          const startTime = new Date(data.startDate).getTime();
          const endTime = new Date(data.endDate).getTime();
          const now = new Date(
            ctx.helper.parseTime(new Date(), 'YYYY-MM-DD'),
          ).getTime();

          return startTime <= now && endTime >= now;
        }).length > 0
          ? 1
          : 0;

      // 有暂停单未开始
      if (!v.pauseStatus) {
        v.pauseStatus =
          pauseRecords.filter((r) => {
            const data = JSON.parse(r.data || '{}');

            const startTime = new Date(data.startDate).getTime();
            const now = new Date(
              ctx.helper.parseTime(new Date(), 'YYYY-MM-DD'),
            ).getTime();

            return startTime > now;
          }).length > 0
            ? 2
            : 0;
      }

      // 设置收货审核数量
      const receiveRecord = needRecords.filter(
        (r) => r.type === 21 && r.targetId === v.id,
      );
      ctx.service.orderMaterial.formatOrderListReceiveRecords(v, receiveRecord);

      // 设置退货审核数量
      ctx.service.orderMaterial.formatOrderListReturnBills(v, bills);

      // 设置开工审核结果
      // const tasks = orderTasks.filter(t => t.associationId === v.id);
      // v.isStart = tasks.filter(v => v.status === 2).length > 0;

      if (getMaterialOrderListRelationUser && userRels.length > 0) {
        ctx.service.orderMaterial.getMaterialOrderListRelationUser(
          v,
          userRels,
          users,
        );
      } else if (query.getRelationUser) {
        v.relationUserId = 0;
        v.relationUserName = '';
      }

      // 预算审核文件
      const budgetReviewFiles = files.filter(
        (f) => f.targetId === v.id && f.type === 32,
      );
      v.budgetReviewFileNum = budgetReviewFiles.length;

      return v;
    });
    return orders;
  }