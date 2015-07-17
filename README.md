# zfm
php+angularjs based, file manager

php5-json, angularjs needed.

And this alpha00 version is the very basic one, it only supports files browsing but nothing else.

Here is the file list, hope I could improve the structure and use more of angularJS's cooler and former tech.

on php server side:
config.php #holds configurations, like paths that you want to show on the page, and the accounts to sign in.
entrance.php #which does sign in approving responding stuff.
kits.php #holds on some methods like show the files list or sth.
zfmsvr.php #its major job is responds the client side and provides infos relating to the files.

on angularJs site:
sign-in.html/sign-in.js #a pair to deal with sign in process, interact with entrance.php
index.html/zfmclient.js #a pair to deal with the files showing, interact with zfmsvr.php

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
In this very beginning alpha version, page routing without angularJs's logic but only by using $cookieStore of it to deal the user's login.

How to deploy it:
1, you need a server to run php5, like apache2 or nginx
2, you need to switch on php5-json
3, then download all the files the this project holds and put into a web page directory, say ./zfm
4, edit config.php, change the path/alias you want, and put at least one account in it
5, visit http://yourdomain/zfm/
there you go.
