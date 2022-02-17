<?php

    $servername = "localhost";
    $username = "id18196979_hotte2emenoel";
    $password = "Hotte2emenoel_";
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
         * @param id $lutin
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
         * Update a key status to "unable"
         * @param id id_key
         * @param winner who choice the key
         */
         public function updateKey($id, $winner){
            $sql = 'UPDATE games_keys SET status=1 WHERE id_key=:id;';
            try{
                $stmt = $this->pdo->prepare($sql);
                $stmt->bindParam(':id', $id);
                $stmt->execute();
            }catch(throwable $e){
                echo $e . "<br>";
                return "NONE";
            }
            
            
            $sql = 'UPDATE tickets_win '
                . 'SET status=1, id_key=:id '
                . 'WHERE id_tickets = '
                . '(SELECT id_tickets FROM tickets_win '
                . 'WHERE lucky=:winner AND status=0 LIMIT 1)';
                
            try{
                $stmt = $this->pdo->prepare($sql);
                $stmt->bindParam(':id', $id);
                $stmt->bindParam(':winner', $winner);
                $stmt->execute();
            }catch(throwable $e){
                echo $e . "<br>";
                return "NONE";
            }
            
            return "update successfully";
        
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
        
        public function checkGiver($token,$giver){
            try {
                $statement = 'SELECT session_id FROM sessions WHERE session_data= "token=' . $token .' & idUser=' . $giver . ' & end"';
                $stmt = $this->pdo->prepare($statement);
                $prepareData = "'token=" . $token . " & idUser=" . $giver . " & end'";
                $stmt->execute();
                $sessionId = [];
                while($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $sessionId[] = [
                        'session_id' => $row['session_id'],
                    ];
                }
    
                return count($sessionId)>0 ? $sessionId : 'NONE';
            } catch (Exception $e) {
                echo "exception found " . $e;
                return '';
            }
        }
    }
    
    $newLutin = htmlspecialchars($_GET["lutin"]);
    $action = htmlspecialchars($_GET["action"]);
    $winner = htmlspecialchars($_GET["winner"]);
    $id = htmlspecialchars($_GET["id"]);
    $token = htmlspecialchars($_GET["token"]);
    
    try {
    	$pdo = new PDO("mysql:host=" . $servername . ";dbname=" . $database, $username, $password);
    	 if (!$pdo) {
            die("Connection failed: " +  '<br>');
        }
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    	$sqlite = new SQLiteSelect($pdo);
    	$output = $sqlite->checkGiver($token, $winner);
    	if($output!="NONE"){
    	    if (strcmp($action,"given")==0){
        	    $keysFind = $sqlite->selectGameKey($newLutin);
        	    echo json_encode($keysFind);
        	}else if(strcmp($action,"list")==0){
        	    $gamesFind = $sqlite->allGame();
        	    echo json_encode($gamesFind);
        	}else if(strcmp($action, "choice")==0){
        	    $gameUpdate = $sqlite->updateKey($id, $winner);
        	    echo json_encode($gameUpdate);
        	}else{
        	    echo "wrong action";
        	}   
    	}else{
    	    echo "NONE";   
    	}
    } catch (PDOException $e) {
    	echo $e->getMessage() . "<br>";
    	echo $e . "<br>";
    }
    
    
    
   
    
?>