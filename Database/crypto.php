<?php

    $cle = htmlspecialchars($_GET["key"]);
    $getAction = htmlspecialchars($_GET["action"]);
    $iv = htmlspecialchars($_GET["idUser"]);
    $message = htmlspecialchars($_GET["msg"]);
    
    // On calcule la taille de la clé pour l'algo triple des
    $cle_taille = mcrypt_module_get_algo_key_size(MCRYPT_BLOWFISH);
    
    // On calcule la taille du vecteur d'initialisation pour l'algo triple des et pour le mode NOFB
    $iv_taille = mcrypt_get_iv_size(MCRYPT_BLOWFISH, MCRYPT_MODE_CBC);

    //On fabrique le vecteur d'initialisation, la constante MCRYPT_RAND permet d'initialiser un vecteur aléatoire
    //$iv = mcrypt_create_iv($iv_taille, MCRYPT_RAND);
    $iv = substr($iv, 0, $iv_taille);
    
    //$cle ="Ceci est une clé censée crypter un message, mais à mon avis elle est beaucoup trop longue";
    // On retaille la clé pour qu'elle ne soit pas trop longue
    $cle = substr($cle, 0, $cle_taille);
    
    // Le message à crypter
    //$message = "Voici mon super message que je dois crypter";
    // On le crypte
    //$message_crypte = mcrypt_encrypt(MCRYPT_BLOWFISH, $cle, $message, MCRYPT_MODE_CBC, $iv);
    // On le décrypte
    //$message_decrypte = mcrypt_decrypt(MCRYPT_BLOWFISH, $cle, $message_crypte, MCRYPT_MODE_CBC, $iv);
    //$message_decrypte = mcrypt_decrypt(MCRYPT_BLOWFISH, $cle, $message, MCRYPT_MODE_CBC, $iv);
    
    if(strcmp($getAction, "encrypt")==0){
        // On le crypte
        $message_crypte = mcrypt_encrypt(MCRYPT_BLOWFISH, $cle, $message, MCRYPT_MODE_CBC, $iv);
        echo base64_encode($message_crypte);
    }else if(strcmp($getAction, "decrypt")==0){
        // On le décrypte
        $message = str_replace(" ","+",$message);//"o6sHk+jASB8=";
        $message_decrypte = mcrypt_decrypt(MCRYPT_BLOWFISH, $cle, base64_decode($message), MCRYPT_MODE_CBC, $iv);
        echo $message_decrypte;
    }else{
        echo "wrong action";
    }
    //echo "Message en clair :$message <br/> Message crypté : $message_crypte <br /> Message décrypté : $message_decrypte";
?>