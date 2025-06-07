function ( colTotal, tableData, printData, groupData) {
    return `
    <tr>
        <td>主材成本合计（不含税）: ${printData?.basesMatersT1Map?.price || 0.00}</td>
    </tr>
`;
};
