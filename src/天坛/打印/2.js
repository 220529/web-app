function a() {
  return [
    "groupName",
    "groupType",
    "useSingle",
    "area",
    "singlePrice",
    "useTotal",
    "totalPrice",
    "amount",
  ];
}

function b(value, option, target, templateData) {
  let style = {};
  if (value.isChange || [1, 2].includes(value.isUp)) {
    style = {
      "background-color": "#eee",
      "text-decoration": "line-through",
    };
  }
  return style;
}

function c(colTotal, tableData, printData, groupData) {
  return tableData.length > 0
    ? `<td colspan="13">
    </td>`
    : "";
}

function d(colTotal, tableData, printData, groupData, options) {
  const thStr = `<div style="display: table;width: 100%;border-collapse: collapse;border-top: 1px solid #000;line-height: 20pt;">
    ${options.columns[0].columns
      .map((item, index) => {
        return (
          '<div style="display: table-cell;width: ' +
          item.width +
          'pt;font-size: 9pt;">' +
          item.title +
          "</div>"
        );
      })
      .join("")}
  </div>`;
  return `
  <td style="padding: 0;" colspan="${colTotal}">
    <div style="text-align: center;width: 100%;font-size: 12pt;line-height: 30pt;font-weight: bold;">
        <div style="width: 100%;padding-top: 4pt;">${groupData.groupName}</div>
        ${thStr}
    </div>
  </td>`;
}

function e(colTotal, tableData, printData, groupData) {
  let style = "";
  let content = "";
  content = `<div style="margin-left: auto;">升级金额：${Number(
    (groupData.rows && groupData.rows[0] && groupData.rows[0].amount) || 0
  ).toFixed(2)}元</div>`;
  return `<td colspan="13" ${style}>
      <div style="text-align: right;width: 100%;font-size: 10pt;line-height: 24pt;font-weight: bold;display: flex;gap: 15px;">
        ${content}
      </div>
    </td>`;
}
