<!DOCTYPE html>
<html>
<head>
    <title>PHP Demo - 欢迎测试</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 600px; margin: 0 auto; }
        input, button { padding: 8px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>PHP 基础 Demo</h1>
        
        <!-- 表单提交 -->
        <form method="POST" action="">
            <label for="name">请输入你的名字：</label><br>
            <input type="text" id="name" name="username" required>
            <button type="submit">提交</button>
        </form>

        <?php
        // PHP 逻辑处理
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $username = htmlspecialchars($_POST['username']); // 防止 XSS
            echo "<h2>Hello, " . $username . "!</h2>";
            echo "<p>服务器时间：" . date("Y-m-d H:i:s") . "</p>";
        }
        ?>
    </div>
</body>
</html>