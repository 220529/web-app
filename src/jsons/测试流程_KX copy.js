/**
 * @flowId 759
 * @flowKey z244yolix5cg9meb
 * @flowName 测试流程_KX
 * @flowNodeName 函数名称
 * @flowNodeType funEditNode
 * @flowNodeId 1
 * @updateTime 2025-02-11 15:33:39
 */
return (async () => {
  try {
    let { rowData, fileId } = body;
    let user_type = body.user_type;

    rowData = JSON.parse(rowData);
    if (!user_type) user_type = rowData.user_type;

    const orderId = user_type === 1 ? rowData.id : rowData.targetId;
    const recordId = user_type === 1 ? rowData.recordId : rowData.id;
    async function getOrderOutMaterials(targetId, type = 304) {
      const bills = await ctx.model.Bill.findAll({
        where: {
          targetId,
          type,
          status: 2,
        },
      });

      let ids = [];
      const bill = bills[0];
      if (bill) {
        const datasource = JSON.parse(bill.data);
        ids = datasource.associatedMaterials.map((i) => i.id);
      }

      let rows = await ctx.model.GroupMaterial.findAll({
        where: {
          id: {
            [Op.in]: ids,
          },
        },
      });
      const materials = await ctx.model.Material.findAll({
        where: {
          id: {
            [Op.in]: rows.map((v) => v.materialId),
          },
        },
      });
      const brands = await ctx.model.Dict.findAll({
        where: {
          id: {
            [Op.in]: [...new Set(materials.map((v) => v.brand))],
          },
        },
      });

      rows = rows.map((v) => {
        const material = materials.find((m) => v.materialId === m.id);
        return {
          ...v.dataValues,
          name: material?.name,
          brandName: brands.find((b) => material?.brand === b.id)?.name ?? '',
          model: material.model,
          amount: (v.price * v.count - v.discountPrice).toFixed(2),
        };
      });
      const count = ids.length;
      return { rows, bills };
    }
    const rows = await getOrderOutMaterials(orderId, 304);
    const record = await ctx.model.Record.findOne({
      where: { targetId: orderId },
    });
    // ctx.model.Record.findOne({
    //   where: {
    //     type: 51,
    //     targetId: orderId,
    //     houseType: 3,
    //   },
    //   order: [['createdAt', 'DESC']],
    // }),
    record.data = JSON.parse(record.data);
    return {
      // rows,
      record,
      // brands,
      // materials,
      msg: 'OK!!',
    };
  } catch (error) {
    return {
      handleError: error.message,
    };
  }
})();
