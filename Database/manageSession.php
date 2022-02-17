<?php

    $servername = "localhost";
    $username = "id18196979_hotte2emenoel";
    $password = "Hotte2emenoel_";
    $database = "id18196979_hottenoel";
    
    $getToken = htmlspecialchars($_GET["token"]);
    $getIdUser = htmlspecialchars($_GET["idUser"]);
    $getAction = htmlspecialchars($_GET["action"]);

    try{
        $pdo = new PDO("mysql:host=" . $servername . ";dbname=" . $database, $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $objSessionHandler = new MySQLSessionHandler($pdo);
        if(strcmp($getAction,"set")==0){
            $result = $objSessionHandler->exist($getIdUser);
            if(strcmp(gettype($result),"string")==0){
                $objSessionHandler->write($getToken, $getIdUser);
            }else{
                $objSessionHandler->update($getToken, $getIdUser);
            }
            
        } else if(strcmp($getAction,"get")==0){
            $result = $objSessionHandler->find($getToken, $getIdUser);
            echo $result[0]['session_id'];
        }
        
        $objSessionHandler->close();
        
    } catch (PDOException $e) {
    	echo $e->getMessage();
    }

    
    class MySQLSessionHandler{
        private $connection;
    
        public function __construct($pdo)
        {
            $this->connection = $pdo;
        }
    
        public function read($sessionId)
        {
            try {
                $stmt = $this->connection->prepare("SELECT session_data FROM sessions WHERE session_id = :session_id;");
                $stmt->bindValue(":session_id", $sessionId);
                $stmt->execute();
                $stmt->bind_result($sessionData);
                $stmt->fetch();
                $stmt->close();
    
                return $sessionData ? $sessionData : '';
            } catch (Exception $e) {
                return '';
            }
        }
        
        public function find($token,$idUser)
        {
            try {
                $statement = 'SELECT session_id FROM sessions WHERE session_data= "token=' . $token .' & idUser=' . $idUser . ' & end"';
                $stmt = $this->connection->prepare($statement);
                $prepareData = "'token=" . $token . " & idUser=" . $idUser . " & end'";
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
        
        public function exist($idUser)
        {
            try {
                $statement = 'SELECT session_id FROM sessions WHERE session_data LIKE "% idUser=' . $idUser . ' & end"';
                $stmt = $this->connection->prepare($statement);
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
        
        public function update($token, $idUser)
        {
            try {
                $statement = 'UPDATE sessions SET session_data = "token=' . $token . ' & idUser=' . $idUser . ' & end" , created = :created WHERE session_data LIKE "% & idUser=' . $idUser . ' & end"';
                $stmt = $this->connection->prepare($statement);
                $stmt->bindParam(':created', time());
                $stmt->execute();
                
                echo "update successfully";
    
                return TRUE;
            } catch (Exception $e) {
                echo $e->getMessage();
                return FALSE;
            }
        }
    
        public function write($token, $idUser)
        {
            try {
                $sql = 'INSERT INTO sessions (session_id,created,session_data) '
                    . 'VALUES(:session_id, :created, :session_data)';
                $stmt = $this->connection->prepare($sql);
                $prepareData = "token=" . $token . " & idUser=" . $idUser . " & end";
                $time = time();
                echo "time:" . $time;
                $sessionId = md5($prepareData . time());
                echo " id " . $sessionId;
                $stmt->bindParam(':session_id', $sessionId);
                echo "before time";
                $stmt->bindParam(':created', time());
                echo "before data";
                $stmt->bindParam(':session_data', $prepareData);
                echo " before bind param ";
                echo "before execute";
                $stmt->execute();
                
                echo "write sucess";
                //$stmt->close();
    
                return TRUE;
            } catch (Exception $e) {
                echo $e->getMessage();
                echo $e;
                return FALSE;
            }
        }
    
        public function destroy($sessionId)
        {
            try {
                $stmt = $this->connection->prepare("DELETE FROM sessions WHERE session_id = ?");
                $stmt->bind_param("s", $sessionId);
                $stmt->execute();
                $stmt->close();
    
                return TRUE;
            } catch (Exception $e) {
                return FALSE;
            }
        }
    
        public function gc($maxlifetime)
        {
            $past = time() - $maxlifetime;
    
            try {
                $stmt = $this->connection->prepare("DELETE FROM sessions WHERE `created` < ?");
                $stmt->bind_param("i", $past);
                $stmt->execute();
                $stmt->close();
    
                return TRUE;
            } catch (Exception $e) {
                return FALSE;
            }
        }
    
        public function close()
        {
            $this->connection->close();
            return TRUE;
        }
    }
    
?>

