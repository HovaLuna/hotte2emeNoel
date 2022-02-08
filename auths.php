<?php
    $scope = "openid%20user:read:email";
    header('Location: https://id.twitch.tv/oauth2/authorize?client_id=okwwebdh0aua9s28aemjtdecybmj5c&response_type=token%20id_token&scope=' . $scope .'&redirect_uri=https://hotte2emenoel.000webhostapp.com/auths&claims={"id_token":{"email":null,"email_verified":null},"userinfo":{"picture":null}}&force_verify=true');
?>
    