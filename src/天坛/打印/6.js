function (data, options, globalData) {
  return `<style>
#baseInfoPrintContainer {
  border: none;
  border-bottom: 0.75pt solid #000;
  border-right: 0.75pt solid #000;
  --color1: #F9F9F9;
  --padding:3pt 10pt;
  --size1: 8pt;
  --font-color1: #17233E;
  --font-weight1: 500;
  --size2: 8pt;
  --font-color2: #17233E;
  --font-weight2: 900;
}
#baseInfoPrintContainer td {
  border: none;
  border-top: 0.75pt solid #000;
  border-left: 0.75pt solid #000;
}
#baseInfoPrintContainer .tableLabel {
  background:var(--color1);
  padding: var(--padding);
  color: var(--font-color1);
  font-size: var(--size1);
  font-weight: var(--font-weight1);
}
#baseInfoPrintContainer .tableValue {
  padding: var(--padding);
  color: var(--font-color2);
  font-size: var(--size2);
  font-weight: var(--font-weight2);
}
</style>
<table
  id="baseInfoPrintContainer"
  style="width:100%;"
  border="1">
    <tr>
      <td style="width:100pt;" class="tableLabel">客户地址</td>
      <td class="tableValue" colspan="5">${
        globalData && globalData.customer && globalData.customer.location
      }</td>
      <td rowspan="7" style="width:100pt;" class="tableValue"></td>
    </tr>
    <tr>
      <td class="tableLabel">客户姓名</td>
      <td class="tableValue">${
        globalData && globalData.customer && globalData.customer.name
      }</td>
      <td class="tableLabel">客户电话</td>
      <td class="tableValue">${
        globalData && globalData.customer && globalData.customer.mobile
      }</td>
      <td class="tableLabel">产品名称</td>
      <td class="tableValue">${globalData && globalData.productName}</td>
    </tr> 
      <tr>
      <td class="tableLabel">设计师</td>
      <td class="tableValue">${
        globalData && globalData.customer && globalData.customer.designerName
      }</td>
      <td class="tableLabel">设计师电话</td>
      <td class="tableValue">${
        globalData && globalData.customer && globalData.customer.designerMobile
      }</td>
      <td class="tableLabel">签单面积</td>
      <td class="tableValue">${(globalData && globalData.area) || '0'}</td>
    </tr> 
        <tr>
      <td class="tableLabel">项目经理</td>
      <td class="tableValue">${
        (globalData &&
          globalData.customer &&
          globalData.customer.foremanName) ||
        '无'
      }</td>
      <td class="tableLabel">项目经理电话</td>
      <td class="tableValue">${
        (globalData &&
          globalData.customer &&
          globalData.customer.foremanMobile) ||
        '--'
      }</td>
      <td class="tableLabel">签单额</td>
      <td class="tableValue">
        ${ Math.floor( ( globalData && ( globalData.status == 1 ? globalData.lockPrice : globalData.totalPrice ) ) || 0 ) }

      </td>
    </tr> 
      <tr>
      <td class="tableLabel">锁单金额</td>
      <td class="tableValue">
        ${ Math.floor( ( globalData && globalData.lockPrice ) || 0 ) }
      </td>
      <td class="tableLabel">合计金额</td>
      <td class="tableValue" colspan="3">${
        (globalData && globalData.totalAmount) || 0
      }</td>
    </tr> 
</table> `;
};