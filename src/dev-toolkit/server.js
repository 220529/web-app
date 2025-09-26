const Koa = require('koa');
const Router = require('@koa/router');
const cors = require('@koa/cors');
const serve = require('koa-static');
const { koaBody } = require('koa-body');
const fs = require('fs');
const xlsx = require('node-xlsx');
const materialsConfig = require('./schemas/materials-mapping');

const app = new Koa();
const router = new Router();

// 中间件
app.use(cors());
app.use(serve('.'));
app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: './uploads',
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024 // 10MB
  }
}));

// Excel解析路由
router.post('/api/parseExcel', async (ctx) => {
  let tempFilePath = null;
  
  try {
    const file = ctx.request.files.excelFile;
    
    if (!file) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '请上传Excel文件'
      };
      return;
    }

    // 验证文件类型
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream'
    ];
    
    const isValidExcel = allowedTypes.includes(file.mimetype) || 
                        /\.(xlsx?|csv)$/i.test(file.originalFilename);
    
    if (!isValidExcel) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '请上传有效的Excel文件（.xlsx, .xls 或 .csv）'
      };
      return;
    }

    // 验证文件大小
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: `文件过大，最大支持 ${maxSize / 1024 / 1024}MB`
      };
      return;
    }

    tempFilePath = file.filepath;
    
    // 解析Excel
    const workbook = xlsx.parse(fs.readFileSync(file.filepath));
    const sheet = workbook[0];
    
    if (!sheet || sheet.data.length === 0) {
      ctx.body = {
        success: false,
        message: 'Excel文件为空'
      };
      return;
    }

    const headers = sheet.data[0];
    const rows = sheet.data.slice(1);

    // 映射数据并进行类型转换
    const mappedData = rows.map((row, rowIndex) => {
      const rowData = {};
      
      headers.forEach((header, colIndex) => {
        const dbField = materialsConfig.fieldMapping[header];
        if (dbField) {
          const rawValue = row[colIndex];
          // 使用映射配置的转换函数
          rowData[dbField] = materialsConfig.convertValue(rawValue, dbField);
        }
      });
      
      return rowData;
    });

    // 清理临时文件
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    console.log(mappedData);

    // 直接返回解析后的JSON数据
    ctx.body = mappedData;

  } catch (error) {
    // 清理临时文件
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: error.message
    };
  }
});

// 健康检查
router.get('/health', (ctx) => {
  ctx.body = { 
    status: 'ok',
    timestamp: new Date().toISOString()
  };
});

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
