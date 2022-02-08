<?php

    $servername = "localhost";
    $username = "id18196979_hotte2emenoel";
    $password = "Edarius-2022";
    $database = "id18196979_hottenoel";
    
    
    $val = $_GET["value"];
    echo htmlspecialchars($val) . '<br>';
    
    /**
     * PHP SQLite Insert Demo
     */
    class SQLiteInsert {
    
        /**
         * PDO object
         * @var \PDO
         */
        private $pdo;
    
        /**
         * Initialize the object with a specified PDO object
         * @param \PDO $pdo
         */
        public function __construct($pdo) {
            $this->pdo = $pdo;
        }
    
        /**
         * Insert a new key game into the games_keys table
         * @param type $game
         * @param type $plateform
         * @param type $url
         * @param type $key_code
         * @param type $lutin
         * @return int id of the inserted task
         */
        public function insertGameKey($game, $plateform, $url, $key_code, $lutin) {
            $sql = 'INSERT INTO games_keys(game, plateform, url, key_code, lutin) '
                    . 'VALUES(:game, :plateform, :url, :key_code, :lutin)';
                    
            echo "before prepare<br>";
            
            $stmt = $this->pdo->prepare($sql);
            
            echo "before bindValue<br>";
            try{
                echo $game . "<br>";
                $stmt->bindParam(':game', $game);
                echo "game ok<br>";
                $stmt->bindValue(':plateform', $plateform);
                echo "plateform ok <br>";
                $stmt->bindValue(':url', $url);
                echo "url ok <br>";
                $stmt->bindValue(':key_code', $key_code);
                echo "key code <br>";
                $stmt->bindValue(':lutin', $lutin);
                echo "lutin <br>";
            }catch(throwable $e){
                echo $e . "<br>";
            }
            
            echo "before execute <br>";
            
            $stmt->execute();
            
            echo "succes ? <br>";
    
            return $this->pdo->lastInsertId();
        }
    }
    
    $newKey_code = htmlspecialchars($_GET["keyCode"]);
    $newGame = htmlspecialchars($_GET["game"]);
    $newPlateform = htmlspecialchars($_GET["plateform"]);
    $newUrl = htmlspecialchars($_GET["url"]);
    $newLutin = htmlspecialchars($_GET["lutin"]);
    echo $newKey_code . " - " . $newGame . " - " . $newPlateform . " - " . $newUrl . " - " . $newLutin;
    
    // Create connection
    //$conn = mysqli_connect($servername, $username, $password, $database);
    
    //$pdo = mysqli_connect($servername, $username, $password, $database);
    try {
    	$pdo = new PDO("mysql:host=" . $servername . ";dbname=" . $database, $username, $password);
    	$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    	echo "Connected !";
    	$sqlite = new SQLiteInsert($pdo);
    	$projectId = $sqlite->insertGameKey($newGame, $newPlateform, $newUrl, $newKey_code, $newLutin);
        echo $projectId . "<br>";
    } catch (PDOException $e) {
    	echo $e->getMessage() . "<br>";
    	echo $e . "<br>";
    }
    
    
    
    // Check connection
    if (!$pdo) {
        die("Connection failed: " . mysqli_connect_error() + '<br>');
    }
    
    echo "Connected successfully<br>";
    
    
    // sql to add a key
    $sql = "INSERT INTO games_keys (key_code, game, plateform, url, lutin)"
    . "VALUES(:key_code, :game, :plateform, :url, :lutin)";
    
    echo $sql . '<br>';
    
    // sql to create table
    /*$sql = "CREATE TABLE games_keys (
    id_key INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    key_code VARCHAR(50) NOT NULL,
    game VARCHAR(50) NOT NULL,
    plateform VARCHAR(30) NOT NULL,
    url VARCHAR(200) NOT NULL,
    lutin INT(10) NOT NULL,
    status BOOLEAN DEFAULT 0
    )";*/
    
    
    /*if ($conn->query($sql) === TRUE) {
      echo "Table games_keys update successfully\n";
    } else {
      echo "Error update table: " . $conn->error . '\n';
    }*/
    
    
    // sql to create table
    $sql = "CREATE TABLE tickets_win (
    id_tickets INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    winner VARCHAR(10) NOT NULL,
    lucky VARCHAR(10) NOT NULL,
    status BOOLEAN DEFAULT 0,
    id_key INT(6) UNSIGNED,
    FOREIGN KEY (id_key) REFERENCES games_keys(id_key)
    )";
    
    /*
    if ($conn->query($sql) === TRUE) {
      echo "Table games_keys created successfully\n";
    } else {
      echo "Error creating table: " . $conn->error .'\n';
    }
    */
    
    $conn->close();
?>