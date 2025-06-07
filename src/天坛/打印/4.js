function ( colTotal, tableData, printData, groupData, ) { console.log("colTotal:", colTotal);
console.log("tableData:", tableData); console.log("printData:", printData);
console.log("groupData:", groupData); 
return `
    <tr>
        <td colspan="4">套外成本合计（含税）: ${printData?.outerMatersMap?.price || 0.00}</td>
        <td colspan="4">套外成本合计（不含税）: ${printData?.outerMatersMap?.price2 || 0.00}</td>
    </tr>
    <tr>
        <td colspan="4">套外毛利率（含税）: ${printData?.amount4 || 0.00}</td>
        <td colspan="4">套外毛利率（不含税）: ${printData?.amount4 || 0.00}</td>
    </tr>
`; };
