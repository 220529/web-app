/**
 * @flowId 759
 * @flowKey z244yolix5cg9meb
 * @flowName 测试流程_KX
 * @flowNodeName 函数名称
 * @flowNodeType funEditNode
 * @flowNodeId 1
 * @updateTime 2025-02-18 13:52:43
 */
return (() => {
    let { rowData, fileId, orderId, type } = body;
    let fields = null;
    const fetchRecords = async () => {
      try {
        const [record51, record54, record] = await Promise.all([
          findRecords(51),
          findRecords(54),
          ctx.model.Record.findOne({
            where: { id: orderId },
          }),
        ]);
        formatRecords(record51);
        formatRecords(record54);
        record.data = JSON.parse(record.data);
        return {
          // record,
          record51: formatReq(record51),
          record54: formatReq(record54),
          msg: 'OK!!',
        };
      } catch (error) {
        return {
          handleError: error.message,
        };
      }
    };
    const destroyAllRecords = async () => {
      try {
        const [record51, record54] = await Promise.all([
          findRecords(51),
          findRecords(54),
        ]);
        const ids51 = findRecordsIds(record51);
        const ids54 = findRecordsIds(record54);
        const [destroyIds51, destroyIds54] = await Promise.all([
          destroyRecordsByIds(51, ids51),
          destroyRecordsByIds(54, ids54),
        ]);
        return {
          ids51,
          ids54,
          destroyIds51,
          destroyIds54,
        };
      } catch (error) {
        return {
          handleError: error.message,
        };
      }
    };
    function findRecordsIds(records) {
      if (!records) {
        return null;
      }
      records = Array.isArray(records) ? records : [records];
      return records.map((record) => record.id);
    }
    const destroyRecords = async () => {
      try {
        const [record51, record54] = await Promise.all([
          destroyRecordsByIds(51, [332297]),
          destroyRecordsByIds(54, [332259, 332265]),
        ]);
        return {
          record51,
          record54,
          msg: 'destroy OK!!',
        };
      } catch (error) {
        return {
          handleError: error.message,
        };
      }
    };
    function formatReq(records) {
      return records.map((i) => {
        return i;
        return {
          id: i.id,
          status: i.status,
          houseType: i.houseType,
        };
      });
    }
    function findRecords(recordId) {
      const params = fields[recordId][type];
      return ctx.model.Record.findAll({
        where: {
          ...params,
          targetId: orderId,
        },
      });
    }
    function formatRecords(records) {
      if (!records) {
        return null;
      }
      records = Array.isArray(records) ? records : [records];
      records.forEach((record) => {
        if (record.data) {
          record.data = JSON.parse(record.data);
        }
      });
    }
    function destroyRecordsByIds(recordId, records) {
      const params = fields[recordId][type];
      const where = {
        id: {
          [Op.in]: records,
        },
        type: recordId,
        ...params,
      };
      return ctx.model.Record.destroy({
        where,
      });
    }
    fields = {
      51: {
        wai: {
          houseType: 3,
        },
        jun: {
          houseType: 6,
        },
      },
      54: {
        wai: {
          houseType: 1,
        },
        jun: {
          houseType: 5,
        },
      },
    };
    if (body.destroy) {
      return destroyAllRecords();
    }
    return fetchRecords();
    // return destroyRecords();
  })();
  