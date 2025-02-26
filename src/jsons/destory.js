
      ctx.model.Record.destroy({
        where: {
          id: {
            [Op.in]: [332162],
          },
          type: 54,
          houseType: 2,
        },
      })
      ctx.model.Record.destroy({
        where: {
          id: {
            [Op.in]: [332154, 332180],
          },
          type: 54,
          houseType: 1,
        },
      })