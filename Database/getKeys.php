<?php

    $servername = "localhost";
    $username = "id18196979_hotte2emenoel";
    $password = "Edarius-2022";
    $database = "id18196979_hottenoel";
    
    /**
     * PHP SQLite Select Demo
     */
    class SQLiteSelect {
    
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
         * Select the keys games from the games_keys table
         * @param type $lutin
         * @return list of keys found
         */
        public function selectGameKey($lutin) {
            $sql = 'SELECT  game, plateform, url, key_code, status FROM games_keys '
                    . 'WHERE lutin = :lutin;';
            
            $stmt = $this->pdo->prepare($sql);
            
            try{
                $stmt->bindValue(':lutin', $lutin);
            }catch(throwable $e){
                echo $e . "<br>";
            }
            
            $stmt->execute();
            
            
            $keys = [];
            
            while($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $keys[] = [
                    'key_code' => $row['key_code'],
                    'game' => $row['game'],
                    'plateform' => $row['plateform'],
                    'url' => $row['url'],
                    'status' => $row['status'],
                ];
            }
    
            return $keys;
        }
        
        /**
         * List all gmaes from the games_keys table
         * @return list of keys found
         */
        public function allGame() {
            $sql = 'SELECT  id_key, game, plateform, url, lutin FROM games_keys '
                    . 'WHERE status = 0;';
            try{
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute();
                $keys = [];
            
            while($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $keys[] = [
                    'game' => $row['game'],
                    'plateform' => $row['plateform'],
                    'url' => $row['url'],
                    'id' => $row['id_key'],
                    'lutin' => $row['lutin'],
                ];
            }
            return $keys;
            }catch(throwable $e){
                echo $e . "<br>";
                return "NONE";
            }
        }
    }
    
    $newLutin = htmlspecialchars($_GET["lutin"]);
    $action = htmlspecialchars($_GET["action"]);
    
    // Create connection
    //$conn = mysqli_connect($servername, $username, $password, $database);
    
    //$pdo = mysqli_connect($servername, $username, $password, $database);
    try {
    	$pdo = new PDO("mysql:host=" . $servername . ";dbname=" . $database, $username, $password);
    	$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    	$sqlite = new SQLiteSelect($pdo);
    	if (strcmp($action,"given")==0){
    	    $keysFind = $sqlite->selectGameKey($newLutin);
    	    echo json_encode($keysFind);
    	}else if(strcmp($action,"list")==0){
    	    $gamesFind = $sqlite->allGame();
    	    echo json_encode($gamesFind);
    	}else{
    	    echo "wrong action";
    	}
    } catch (PDOException $e) {
    	echo $e->getMessage() . "<br>";
    	echo $e . "<br>";
    }
    
    
    
    // Check connection
    if (!$pdo) {
        die("Connection failed: " . mysqli_connect_error() + '<br>');
    }

    $conn->close();
?>