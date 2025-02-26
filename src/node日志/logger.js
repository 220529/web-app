const { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");

// 自定义日志格式
const customFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // 时间戳格式
  format.uncolorize(), // 去掉控制台颜色
  format.printf(i => `${i.level.toUpperCase()}: ${[i.timestamp]}: ${i.message}`) // 格式化输出
);

const defaultOptions = {
  format: customFormat,
  datePattern: "YYYY-MM-DD", // 按天分割日志文件
  zippedArchive: false, // 不压缩日志文件
  maxSize: "20m", // 单个文件最大20MB
  maxFiles: "14d", // 保留14天的日志
};

const processIndex = process.env.NODE_APP_INSTANCE || 0; // 获取当前实例的索引

const newLogger = () => {
  const commonArr = ["log", "info", "warn", "error"];

  global.logger = createLogger({
    format: customFormat,
    transports: [
      new transports.Console(), // 控制台日志
      ...commonArr.map(level => {
        return new transports.DailyRotateFile({
          level: level,
          filename: `logs/${processIndex}/%DATE%/${level}.log`,
          ...defaultOptions,
        });
      }),
    ],
  });

  commonArr.forEach(item => {
    global.console[item] = (...args) => {
      let cache = [];
      let message = "";
      try {
        message = args
          .map(arg =>
            typeof arg === "object"
              ? JSON.stringify(
                  arg,
                  function (key, value) {
                    if (typeof value === "object" && value !== null) {
                      if (cache.indexOf(value) !== -1) {
                        return; // 解决循环引用
                      }
                      cache.push(value); // 收集所有的值
                    }
                    return value;
                  },
                  2
                )
              : arg
          )
          .join(", ");
        global.logger[item === "log" ? "info" : item](message);
      } catch (e) {
        global.logger.error((e && e.message) || "catch log error");
      } finally {
        cache = null;
        message = null;
      }
    };
  });

  const timeKeyMap = {};
  global.console.time = label => {
    timeKeyMap[label] = Date.now(); // 记录开始时间
  };
  global.console.timeEnd = label => {
    if (!timeKeyMap[label]) return;
    global.logger.info(`${label}-time: ${Date.now() - timeKeyMap[label]}ms`); // 输出时间差
    delete timeKeyMap[label]; // 清除时间记录
  };

  // 全局未捕获异常处理
  process.on("uncaughtException", err => {
    global.logger.error(`Uncaught Exception: ${err.message}`);
    global.logger.error(err.stack);
    // 可以选择退出进程
    process.exit(1);
  });

  // 全局未处理的 Promise 拒绝处理
  process.on("unhandledRejection", (reason, promise) => {
    global.logger.error(
      `Unhandled Rejection at: ${promise} reason: ${
        typeof reason === "object" ? JSON.stringify(reason) : reason
      }`
    );
    // 可以选择退出进程
    process.exit(1);
  });
};

// 初始化日志
newLogger();

module.exports = { logger: global.logger };
