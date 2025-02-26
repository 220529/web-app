/**
 * @flowId 759
 * @flowKey z244yolix5cg9meb
 * @flowName 测试流程_KX
 * @flowNodeName 函数名称
 * @flowNodeType funEditNode
 * @flowNodeId 1
 * @updateTime 2025-02-11 13:55:34
 */
return (async () => {
  try {
    const { orderId } = body;
    const res = await ctx.model.Bill.findAll({
      where: {
        targetId: orderId,
        type: {
          [Op.in]: [304],
        },
        status: 2,
      },
      order: [['createdAt', 'DESC']],
    });
    const bill = res.filter((v) => v.type === 304)[0];
    let rows = [];
    if (bill) {
      bill.data = JSON.parse(bill.data);
      const ids = bill.data.associatedMaterials.map((i) => i.id);
      rows = await ctx.model.GroupMaterial.findAll({
        where: {
          id: {
            [Op.in]: ids,
          },
        },
      });
    }
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
    return {
      body,
      rows,
      // bill,
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
