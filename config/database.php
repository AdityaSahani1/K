<?php

class Database {
    private static $instance = null;
    private $conn;
    private $dbtype;
    private $config;
    
    private function __construct() {
        $this->loadConfig();
        
        $this->dbtype = $this->getConfigValue('DB_TYPE', 'sqlite');
        
        try {
            if ($this->dbtype === 'sqlite') {
                $this->connectSQLite();
            } else {
                $this->connectMySQL();
            }
        } catch (Exception $e) {
            error_log("Database connection error: " . $e->getMessage());
            throw $e;
        }
    }
    
    private function loadConfig() {
        $configFile = __DIR__ . '/config.php';
        if (file_exists($configFile)) {
            $this->config = require $configFile;
        } else {
            $this->config = [];
        }
        
        require_once __DIR__ . '/env-loader.php';
    }
    
    private function getConfigValue($key, $default = null) {
        if (isset($this->config[$key])) {
            return $this->config[$key];
        }
        
        $envValue = getenv($key);
        if ($envValue !== false) {
            return $envValue;
        }
        
        return $default;
    }
    
    private function connectMySQL() {
        $host = $this->getConfigValue('MYSQL_HOST', 'localhost');
        $username = $this->getConfigValue('MYSQL_USERNAME', 'root');
        $password = $this->getConfigValue('MYSQL_PASSWORD', '');
        $database = $this->getConfigValue('MYSQL_DATABASE', 'snapsera');
        $port = $this->getConfigValue('MYSQL_PORT', 3306);
        
        $dsn = "mysql:host=$host;port=$port;dbname=$database;charset=utf8mb4";
        $this->conn = new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]);
    }
    
    private function connectSQLite() {
        $dbPath = __DIR__ . '/../data/snapsera.db';
        $dataDir = __DIR__ . '/../data';
        
        if (!file_exists($dataDir)) {
            mkdir($dataDir, 0755, true);
        }
        
        $this->conn = new PDO("sqlite:$dbPath", null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        $this->conn->exec("PRAGMA foreign_keys = ON");
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->conn;
    }
    
    public function getType() {
        return $this->dbtype;
    }
    
    public function query($sql) {
        try {
            $result = $this->conn->query($sql);
            return $result;
        } catch (PDOException $e) {
            error_log("Query error: " . $e->getMessage() . " | SQL: " . $sql);
            return false;
        }
    }
    
    public function prepare($sql) {
        try {
            return $this->conn->prepare($sql);
        } catch (PDOException $e) {
            error_log("Prepare error: " . $e->getMessage() . " | SQL: " . $sql);
            return false;
        }
    }
    
    public function escapeString($value) {
        return $this->conn->quote($value);
    }
    
    public function getLastInsertId() {
        return $this->conn->lastInsertId();
    }
    
    public function execute($sql, $params = []) {
        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Execute error: " . $e->getMessage() . " | SQL: " . $sql);
            throw $e;
        }
    }
    
    public function fetchAll($sql, $params = []) {
        try {
            $stmt = $this->execute($sql, $params);
            return $stmt->fetchAll();
        } catch (Exception $e) {
            error_log("FetchAll error: " . $e->getMessage());
            return [];
        }
    }
    
    public function fetchOne($sql, $params = []) {
        try {
            $stmt = $this->execute($sql, $params);
            return $stmt->fetch();
        } catch (Exception $e) {
            error_log("FetchOne error: " . $e->getMessage());
            return null;
        }
    }
}
?>
