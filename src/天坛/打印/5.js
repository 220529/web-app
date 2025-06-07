function (data, options, globalData) {
  // 材料费用
  const materialsCosts = globalData?.innerMatersT1Map?.price || 0 + globalData?.basesMatersT1Map?.price || 0;

  // 获取合同类型的付款信息
  const paymentInfoList = globalData?.paymentInfoList?.filter(item => item.type === 'contract') || [];
  
  // 计算各期款项
  const amount1 = globalData?.foremanMap?.first_settlement || 0;
  const amount2 = globalData?.foremanMap?.interim_payment || 0;
  const amount3 = globalData?.foremanMap?.final_payment || 0;

  // 工长费用
  const managerCosts = Number((amount1 + amount2 + amount3).toFixed(2));
  // 设计费用
  const designCosts = globalData?.designPrice || 0;
  // 套外费用
  const outCosts = globalData?.outerMatersMap?.price || 0;
  // 相关费用
  const relatedCosts = 0;
  // 总成本
  const totalCosts = Number((materialsCosts + outCosts + managerCosts + designCosts + relatedCosts).toFixed(2));

  // 合同款收入
  const contractAmount = Number(globalData?.contractAmount?.toFixed(2)) || 0;
  // 增项款收入
  const positiveAmount = globalData?.positiveAmount || 0;
  // 套外材料款
  const outMaterAmount = (globalData?.outMaterAmount || 0) + (globalData?.outChangeAmount || 0);
  // 总收入合计
  const incomeAmount = Number((contractAmount + positiveAmount + outMaterAmount + designCosts).toFixed(2));

  const radio = (((incomeAmount - totalCosts) / incomeAmount) * 100).toFixed(2) + "%";
  return `
    <table class="table-zebg" border="1">
      <tr>
        <td rowspan="3">相关费用</td>
      </tr>
      <tr>
        <td colspan="3">销售/设计/工程/监理人员提成</td>
        <td colspan="16">/</td>
      </tr>
      <tr>
        <td colspan="3">银行贷款手续费</td>
        <td colspan="16">/</td>
      </tr>
      <tr>
        <td colspan="4">项目综合成本费用（含税）</td>
        <td colspan="16">${totalCosts}（材料费+工长成本+套外费用+设计费提点+相关费用）</td>
      </tr>
      <tr>
        <td colspan="4">项目综合毛利率</td>
        <td colspan="16">${radio}（项目综合收入-项目综合成本）/项目综合收入*100%）</td>
      </tr>
    </table>
`; }
