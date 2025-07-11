function ( colTotal, tableData, printData, groupData) {
    return `
    <tr>
        <td colspan="2">辅材成本合计（含税）: ${printData?.basesMatersT1Map?.price || 0.00}</td>
        <td colspan="2">辅材成本合计（不含税）: ${printData?.basesMatersT1Map?.price2 || 0.00}</td>
    </tr>
`;
};
