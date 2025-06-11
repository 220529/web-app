function (data, options, globalData) {
  const contractAmount = Number(globalData?.paymentMap?.contractAmount?.toFixed(2)) || 0;
  const contractAmount2 = Number((contractAmount * (1 - 0.09)).toFixed(2));
  const positiveAmount = Number(globalData?.paymentMap?.addMaterialAmount?.toFixed(2)) || 0;
  const positiveAmount2 = Number(positiveAmount * (1 - 0.09).toFixed(2));
  const outMaterAmount = Number(globalData?.paymentMap?.outMaterAmount?.toFixed(2)) || 0;
  const outMaterAmount2 = Number(outMaterAmount * (1 - 0.13).toFixed(2)); 
  const designPrice = Number(globalData?.paymentMap?.designPrice?.toFixed(2)) || 0;
  const designPrice2 = designPrice * (1 - 0.06);
  const applianceAmount = 0;
  const applianceAmount2 = applianceAmount * (1 - 0);
  const incomeAmount = (contractAmount + positiveAmount + designPrice + outMaterAmount + applianceAmount).toFixed(2);
  const incomeAmount2 = (contractAmount2 + positiveAmount2 + designPrice2 + outMaterAmount2 + applianceAmount2).toFixed(2);
  return `
    <style>
      .table-zebg {
        width: 100%;
        table-layout: fixed;
        border: none;
        border-bottom: 0.75pt solid #000;
        border-right: 0.75pt solid #000;
        --color1: #f9f9f9;
        --padding: 3pt 10pt;
        --size1: 9pt;
        --font-color1: #17233e;
        --font-weight1: 500;
        --size2: 9pt;
        --font-color2: #17233e;
        --font-weight2: 900;
      }
      .table-zebg td {
        border: none;
        border-top: 0.75pt solid #000;
        border-left: 0.75pt solid #000;
      }
      .table-zebg td:nth-child(odd) {
        background: var(--color1);
        padding: var(--padding);
        color: var(--font-color1);
        font-size: var(--size1);
        font-weight: var(--font-weight1);
      }
      .table-zebg td:nth-child(even) {
        padding: var(--padding);
        color: var(--font-color2);
        font-size: var(--size2);
        font-weight: var(--font-weight2);
      }
      .none {
        display: none;
      }
    </style>
    <table class="table-zebg odd-table-zebg">
      <tr>
        <td rowspan="2">基础信息</td>
        <td style="display: none"></td>
        <td>合同号</td>
        <td colspan="2">${globalData?.number || ''}</td>
        <td>客户姓名</td>
        <td>${globalData?.customer?.name || ''}</td>
        <td>客户电话</td>
        <td>${globalData?.customer?.mobile || ''}</td>
        <td>套餐类型</td>
        <td colspan="2">${globalData?.productName || ''}</td>
      </tr>
      <tr>
        <td>施工地址</td>
        <td colspan="3">${globalData?.customer?.location || ''}</td>
        <td>面积（㎡）</td>
        <td>${globalData?.area || ''}</td>
        <td>签单额</td>
        <td>${globalData?.totalPrice}</td>
        <td>锁单额</td>
        <td>${globalData?.lockPrice}</td>
      </tr>
      <tr>
        <td rowspan="3">收入情况（实收）</td>
        <td style="display: none"></td>
        <td>合同款收入（含税）</td>
        <td>${contractAmount}</td>
        <td>增、减项收入（含税）</td>
        <td>${positiveAmount}</td>
        <td>设计费收入（含税）</td>
        <td>${designPrice}</td>
        <td>套外收入（含税）</td>
        <td>${outMaterAmount}</td>
        <td>电器（含税）</td>
        <td>${applianceAmount}</td>
      </tr>
      <tr>
        <td>合同款收入（不含税9%）</td>
        <td>${contractAmount2}</td>
        <td>增、减项收入（不含税9%）</td>
        <td>${positiveAmount2}</td>
        <td>设计费收入（不含税6%）</td>
        <td>${designPrice2}</td>
        <td>套外收入（不含税13%）</td>
        <td>${outMaterAmount2}</td>
        <td>电商/零售收入（不含税）</td>
        <td>${applianceAmount2}</td>
      </tr>
      <tr>
        <td colspan="1">项目收入合计（含税）</td>
        <td colspan="4">
          ${incomeAmount}（合同款+增、减项+设计费+套外+电器）
        </td>
        <td colspan="1">项目收入合计（不含税）</td>
        <td colspan="4">
          ${incomeAmount2}（合同款+增、减项+设计费+套外+电器）
        </td>
      </tr>
    </table>
`; };
