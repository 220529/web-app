package cn.tintan.cpm.controller.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.util.*;
import javax.validation.constraints.*;
import java.math.BigDecimal;

@Schema(description = "管理后台 - 施工信息新增/修改 Request VO")
@Data
public class ConstructionInfoSaveReqVO {

    @Schema(description = "主键ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "3467")
    private Long id;

    @Schema(description = "分公司ID，关联公司管理数据", requiredMode = Schema.RequiredMode.REQUIRED, example = "2930")
    @NotNull(message = "分公司ID，关联公司管理数据不能为空")
    private Long companyId;

    @Schema(description = "人工结算价(含税)，0-999999.99", requiredMode = Schema.RequiredMode.REQUIRED, example = "21791")
    @NotNull(message = "人工结算价(含税)，0-999999.99不能为空")
    private BigDecimal laborSettlementPrice;

    @Schema(description = "材料结算价(含税)，0-999999.99", requiredMode = Schema.RequiredMode.REQUIRED, example = "5450")
    @NotNull(message = "材料结算价(含税)，0-999999.99不能为空")
    private BigDecimal materialSettlementPrice;

    @Schema(description = "结算价(含税)，0-999999.99", requiredMode = Schema.RequiredMode.REQUIRED, example = "1791")
    @NotNull(message = "结算价(含税)，0-999999.99不能为空")
    private BigDecimal totalSettlementPrice;

    @Schema(description = "单位ID，关联单位表", requiredMode = Schema.RequiredMode.REQUIRED, example = "11823")
    @NotNull(message = "单位ID，关联单位表不能为空")
    private Long unitId;

    @Schema(description = "工艺说明，最大500字", example = "你猜")
    private String processDescription;

    @Schema(description = "状态：0开启1关闭", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    @NotNull(message = "状态：0开启1关闭不能为空")
    private Integer status;

}