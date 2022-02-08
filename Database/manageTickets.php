<?php

    $servername = "localhost";
    $username = "id18196979_hotte2emenoel";
    $password = "Edarius-2022";
    $database = "id18196979_hottenoel";
    
    
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
         * Add a new ticket in the tickets_win tab
         * @param type $winner
         * @return int id of the inserted task
         */
        public function addTicket($giver, $lucky) {
            $sql = 'INSERT INTO tickets_win(giver, lucky) '
                    . 'VALUES(:giver, :lucky)';
                    
            $stmt = $this->pdo->prepare($sql);
            
            try{
                $stmt->bindParam(':giver', $giver);
                $stmt->bindParam(':lucky', $lucky);
                
                $stmt->execute();
            }catch(throwable $e){
                echo $e . "<br>";
            }
            
            return $this->pdo->lastInsertId();
        }
        
        public function checkGiver($token,$giver)
        {
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
        
        public function giveTicket($giver, $lucky){
            $sql = 'UPDATE tickets_win '
                . 'SET giver=:giver, lucky=:lucky '
                . 'WHERE id_tickets = '
                . '(SELECT id_tickets FROM tickets_win '
                . 'WHERE lucky=:giver AND status=0 LIMIT 1)';
                    
            $stmt = $this->pdo->prepare($sql);
            
            try{
                $stmt->bindParam(':giver', $giver);
                $stmt->bindParam(':lucky', $lucky);
                $stmt->bindParam(':ticket', $ticket);
                
                $stmt->execute();
            }catch(throwable $e){
                echo $e . "<br>";
            }
    
            return $this->pdo->lastInsertId();
        }
        
        public function listGiven($giver){
            $sql = 'SELECT COUNT(*) AS nbTickets, lucky FROM tickets_win '
                . 'WHERE giver=:giver group by lucky, giver';
            
            $stmt = $this->pdo->prepare($sql);
            
            try{
                $stmt->bindParam(':giver', $giver);
            }catch(throwable $e){
                echo $e . "<br>";
            }
            
            $stmt->execute();
            
            $tickets = [];
            
            while($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $tickets[] = [
                    'lucky' => $row['lucky'],
                    'nbTickets' => $row['nbTickets'],
                ];
            }
    
            return $tickets;
        }
        
        public function listUsed($lucky){
            $sql = 'SELECT g.game, g.plateform, g.lutin FROM games_keys g'
                . 'INNER JOIN tickets_win t ON t.id_key = g.id_key';
            
            $stmt = $this->pdo->prepare($sql);
            
            try{
                $stmt->bindParam(':giver', $giver);
            }catch(throwable $e){
                echo $e . "<br>";
            }
            
            $stmt->execute();
            
            $tickets = [];
            
            while($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $tickets[] = [
                    'lucky' => $row['lucky'],
                    'nbTickets' => $row['nbTickets'],
                ];
            }
    
            return $tickets;
        }
        
        public function countTickets($lucky){
            $sql = 'SELECT COUNT(id_tickets) AS nbTickets FROM tickets_win '
                . 'WHERE lucky=:lucky AND status=0';
            
            $stmt = $this->pdo->prepare($sql);
            
            try{
                $stmt->bindParam(':lucky', $lucky);
            }catch(throwable $e){
                echo $e . "<br>";
            }
            
            $stmt->execute();
            
            $tickets = [];
            
            while($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $tickets[] = [
                    'nbTickets' => $row['nbTickets'],
                ];
            }
    
            return $tickets;
        }
    }
    
    $getAction = htmlspecialchars($_GET["action"]);
    $getLucky = htmlspecialchars($_GET["lucky"]);
    $getId_key = htmlspecialchars($_GET["id_key"]);
    $getToken = htmlspecialchars($_GET["token"]);
    $getGiver = htmlspecialchars($_GET["giver"]);

    // Create connection
    //$conn = mysqli_connect($servername, $username, $password, $database);
    
    //$pdo = mysqli_connect($servername, $username, $password, $database);
    try {
    	$pdo = new PDO("mysql:host=" . $servername . ";dbname=" . $database, $username, $password);
    	$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    	$sqlite = new SQLiteInsert($pdo);
    	$output = $sqlite->checkGiver($getToken, $getGiver);
    	if($output=="NONE"){$output = $sqlite->checkGiver($getToken, $getLucky);}
    	    if ($output!="NONE"){
            	switch($getAction){
            	    case "new":
            	        $projectId = $sqlite->addTicket($getGiver, $getLucky);
            	        echo "Ticket added successfully";
            	        break;
            	    case "choice":
            	        echo $projectId;
            	        break;
            	    case "transfert":
            	        $projectId = $sqlite->giveTicket($getGiver, $getLucky);
            	        echo $projectId;
            	        break;
            	    case "count":
            	       $projectId = $sqlite->countTickets($getLucky);
            	       echo json_encode($projectId);
            	       break;
            	   case "listGiven":
            	       $projectId = $sqlite->listGiven($getGiver);
            	       echo json_encode($projectId);
            	       break;
            	   case "listUsed":
            	       //$projectId = $sqlite->listUsed($getLucker);
            	       //echo json_encode($projectId);
            	       break;
            	}
    	    }else{
    	        echo "wrong authentification";
    	    }
    } catch (PDOException $e) {
    	echo $e->getMessage() . "<br>";
    	echo $e . "<br>";
    }
    
    
    
    // Check connection
    if (!$pdo) {
        die("Connection failed: " . mysqli_connect_error() + '<br>');
    }
    
    $pdo->close();
?>