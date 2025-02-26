/**
 * @flowId 603
 * @flowName 管理员_获取个人套外业绩确认列表
 * @flowNodeName 函数名称
 * @flowNodeType funEditNode
 * @flowNodeId 1
 * @updateTime 2024-08-19 09:46:30
 */

 try {
    async function getRefundIcon() {
      const [res1, res2] = await Promise.all([
        ctx.service.config.list({
          limit: 1,
          page: 1,
          handleType: 'getFileUrl', // 获取config data关联的文件ID对应的文件链接
          sourceId: 'REFUND_ICON_PNG',
        }),
        ctx.service.config.list({
          limit: 1,
          page: 1,
          handleType: 'getFileUrl', // 获取config data关联的文件ID对应的文件链接
          sourceId: 'REFUND_ING_ICON_PNG',
        }),
      ]);
      return [res1?.rows?.[0]?.fileUrl ?? '', res2?.rows?.[0]?.fileUrl ?? ''];
    }
  
    const {
      limit = 10,
      page = 1,
      fileId,
      number,
      design_user_name,
      design_user_belong,
      status,
      companyId,
    } = body;
  
    if (!fileId) {
      return {
        handleError: '参数错误，未传文件id',
      };
    }
    const [fileRes, [refundIconURL, refundIngIconURL]] = await Promise.all([
      ctx.model.Workfile.findByPk(fileId),
      getRefundIcon(),
    ]);
    const fileRows = JSON.parse(fileRes?.data || '[]') || [];
    const orderIds = fileRows.map((v) => +v.id);
  
    const numberAnd = number ? `AND o.number like '%${number}%'` : '';
    const designerNameAnd = design_user_name
      ? `AND du.name like '%${design_user_name}%'`
      : '';
    const designGroupNameAnd = design_user_belong
      ? `AND dp.name like '%${design_user_belong}%'`
      : '';
    const companyIdAnd = companyId ? `AND o.companyId = ${companyId}` : '';
  
    let rows = [];
    let count = 0;
    let _billOrders = null;
    if (orderIds.length) {
      const orderIdsOr = `
      o.id in (${orderIds.join(',')})
          ${numberAnd}
          ${designerNameAnd}
          ${designGroupNameAnd}
          ${companyIdAnd}
        `;
      let statusHaving = '';
      if (status !== null && typeof status !== 'undefined') {
        switch (+status) {
          case 5:
            statusHaving = 'HAVING status in (5, 6)';
            break;
          case 7:
            statusHaving = 'HAVING status in (7, 8)';
            break;
          default:
            statusHaving = `HAVING status = ${status}`;
            break;
        }
      }
  
      const limitStart = (page - 1) * limit;
      const limitEnd = limit;
  
      const resultSql = `
        SELECT
          o.id,
          o.number,
          o.customerId,
          c.name as customerName,
          GROUP_CONCAT(b.id) as hasRefund,
          COALESCE(SUM(b.amount), 0) as refundAmount,
          GROUP_CONCAT(t1.id) as hasRefundIng,
          du.name as designerName,
          dp.name as designGroupName,
          rd.id as recordId,
          rd.title as title,
          rd.fitUse as fitUse,
          if ( rd.status is not null, rd.status, -1 ) as status,
          rd.data as recordJsonData,
          if (rd.id is not null, DATE_FORMAT(rd.createdAt, '%Y年%m月%d日 %H时%i分'), "-") as createTimeStr
        from orders as o
          left join bills as b on o.id = b.targetId AND b.type in (401, 402, 403) AND b.status = 2
          left join tasks as t1 on o.id = t1.associationId AND t1.taskType = 6 AND t1.type = 'task' AND t1.status = 1
          left join customers as c on c.id = o.customerId
          left join users as du on c.designerId = du.id
          left join departments as dp on c.designGroupId = dp.id
          left join records as rd on rd.targetId = o.id AND rd.type = 54 AND rd.houseType = 1 AND rd.data like '%fileId":${fileId}%'
          left join records as outrd on outrd.targetId = o.id AND outrd.type = 51 AND outrd.houseType = 3 AND outrd.status = 1
        where
          ${orderIdsOr}
          group by o.id
          ${statusHaving}
          ${+status === 1 ? 'order by rd.createdAt DESC' : ''}
      `;
      const countSql = `
        SELECT
          o.id,
          if ( rd.status is not null, rd.status, -1 ) as status
        from orders as o
          left join bills as b on o.id = b.targetId
          left join customers as c on c.id = o.customerId
          left join users as du on c.designerId = du.id
          left join departments as dp on c.designGroupId = dp.id
          left join records as rd on rd.targetId = o.id AND rd.type = 54 AND rd.houseType = 1 AND rd.data like '%fileId":${fileId}%'
        where
          ${orderIdsOr}
          group by o.id
          ${statusHaving}
      `;
  
      const [[billOrders], [orderCount]] = await Promise.all([
        ctx.model.query(resultSql),
        ctx.model.query(countSql),
      ]);
      _billOrders = billOrders
      count = orderCount.length;
      const sourceOrders = ctx.helper.copy(
        billOrders.slice(limitStart, limitEnd * page),
      );
      const sortOrders = [];
  
      if (+status !== 1) {
        orderIds.reverse().forEach((id) => {
          const order = sourceOrders.find((v) => v.id === id);
          if (order) {
            sortOrders.push(order);
          }
        });
      } else {
        sortOrders.push(...sourceOrders);
      }
  
      rows = sortOrders.map((order) => {
        const fileRow = fileRows.find((row) => row.id === order.id);
        let fileRowCreatedAt = null;
        let performanceMonth = null;
  
        if (fileRow) {
          fileRowCreatedAt = fileRow.createdAt;
          performanceMonth = fileRow.performanceMonth;
        }
        order.performanceMonth = performanceMonth;
        order.createdAt = fileRowCreatedAt;
  
        const recordData = JSON.parse(order?.recordJsonData || '{}') || {};
  
        const materials = recordData.materials || [];
        order.materials = materials;
  
        const hasRefundIng = recordData.stopTime
          ? recordData.refundCount?.[1]
          : order.hasRefundIng;
        const hasRefund = recordData.stopTime
          ? recordData.refundCount?.[2]
          : order.hasRefund;
        const icon = hasRefund
          ? refundIconURL
          : hasRefundIng
            ? refundIngIconURL
            : '';
  
        const refundIcon = icon
          ? `<img src="${icon}" style="
          width: 40px;
          height: 40px;
          display: block;
          position: absolute;
          right: 5px;
          bottom: 4px;
          opacity: .3;
        " />`
          : '';
        order.customer = recordData.customer ?? fileRow?.customer;
  
        order.amount = recordData.amount ?? fileRow?.amount ?? {};
  
        // 套外签单额
        order.allMaterialsAmount = materials
          .reduce((acc, cur) => {
            acc += +cur.amount;
            return acc;
          }, 2)
          .toFixed(2);
        // 实收金额
        order.materialsAmount = materials
          .reduce((acc, cur) => {
            acc += +cur.amount;
            return acc;
          }, 2)
          .toFixed(2);
        // 套外物料数
        order.allMaterialsCount = `${materials.length}/0`;
  
        order.realNumber = order.number;
        order.number = `
          <div>
            ${order.number}
            ${refundIcon}
          </div>
        `;
  
        order.stopTime = recordData.stopTime ?? null;
        order.isStop = !!order.stopTime;
  
        order.recordReason = recordData.reason ?? null;
  
        delete order.recordJsonData;
  
        order.confirmTimeStr =
          order.status === 2
            ? ctx.helper.parseTime(
                recordData.action_records[1].createdAt,
                'YYYY年MM月DD日 HH时mm分',
              )
            : '-';
  
        if (order.status == -1) {
        } else if (order.status !== 4) {
          order.status = 2;
          materials.forEach((m) => {
            if (m.status === -1) {
              order.status = 0; // 有未发起
              return true;
            } else if (m.status === 1) {
              order.status = 1; // 有待确认
              return true;
            }
          });
        }
        return order;
      });
    }
  
    return {
      rows,
      count,
      _billOrders
    };
  } catch (error) {
    return {
      tipText: error.message,
    };
  }