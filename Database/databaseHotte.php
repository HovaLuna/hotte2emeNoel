<?php

    $servername = "localhost";
    $username = "id18196979_hotte2emenoel";
    $password = "Hotte2emenoel_";
    $database = "id18196979_hottenoel";
    
    // Create connection
    $conn = mysqli_connect($servername, $username, $password, $database);
    
    // Check connection
    if (!$conn) {
        die("Connection failed: " . mysqli_connect_error());
    }
    
    echo "Connected successfully";
    
    // sql to create table
    $sql = "CREATE TABLE games_keys (
    id_key INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    key_code VARCHAR(50) NOT NULL,
    game VARCHAR(50) NOT NULL,
    plateform VARCHAR(30) NOT NULL,
    url VARCHAR(200) NOT NULL,
    lutin INT(10) NOT NULL,
    status BOOLEAN DEFAULT 0
    )";
    
    if ($conn->query($sql) === TRUE) {
      echo "Table games_keys created successfully";
    } else {
      echo "Error creating table: " . $conn->error;
    }
    
    // sql to create table
    $sql = "CREATE TABLE tickets_win (
    id_tickets INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    winner VARCHAR(10) NOT NULL,
    lucky VARCHAR(10) NOT NULL,
    status BOOLEAN DEFAULT 0,
    id_key INT(6) UNSIGNED,
    FOREIGN KEY (id_key) REFERENCES games_keys(id_key)
    )";
    
    if ($conn->query($sql) === TRUE) {
      echo "Table games_keys created successfully";
    } else {
      echo "Error creating table: " . $conn->error;
    }
    
    
    $conn->close();
?>

